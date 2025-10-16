import { ActionError, defineAction } from "astro:actions";
import { Chapters, db, eq, Users, Works } from "astro:db";
import { z } from "astro:schema";
import { ComAtprotoRepoApplyWrites } from "@atproto/api";
import { TID } from "@atproto/common-web";
import { customAlphabet, nanoid } from "nanoid";
import { createFanficWork, importChapter } from "@/lib/atproto";
import type { atProtoChapter, atProtoWork, BskyPost, ChapterText, LeafletDoc } from "@/lib/types";
import schema from "./schema";
import chapterSchema from "../chapters/schema";

const { shape: chapterShape } = chapterSchema;
const { title, ...rest } = chapterShape;

export default defineAction({
  accept: "form",
  input: schema.extend({
    chapterTitle: title,
    ...rest
  }).superRefine((data, ctx) => {
    // conditionally require fields based on option
    switch (data.option) {
      case "manual":
        if ((data.chapterTitle || data.content) === undefined || (data.chapterTitle || data.content) === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `If you're writing manually, make sure "Chapter Title" and "Work Text" are not empty!`,
            path: ["chapterTitle", "content"]
          });
        }
        break;
      case "bsky":
        if ((data.bskyTitle || data.bskyUri) === undefined || (data.bskyTitle || data.bskyUri) === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `If you're importing a Bluesky post, make sure "Chapter Title" and "Bluesky URI" are not empty!`,
            path: ["bskyTitle", "bskyUri"]
          });
        }
        break;
      case "leaflet":
        if (data.leafletUri === undefined || data.leafletUri === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `If you're importing a Leaflet document, make sure "Leaflet URI" is not empty!`,
            path: ["leafletUri"]
          });
        }
        break;
      default:
        return true;
    }
  }),
  handler: async ({
    title,
    summary, 
    tags, 
    publish,
    option,
    chapterTitle,
    bskyUri,
    bskyTitle,
    leafletUri,
    content,
    authorsNotes,
    endNotes,
    warnings,
  }, context) => {
    const loggedInUser = context.locals.loggedInUser;

    //#region "Check authentication"
    if (!loggedInUser) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You're not logged in!",
      });
    }

    // find the did of the logged in user from our db
    const [user] = await db
      .select({ did: Users.userDid })
      .from(Users)
      .where(eq(Users.userDid, loggedInUser.did))
      .limit(1);

    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You can only add a work if you connected your PDS!",
      });
    }
    //#endregion

    //#region "Construct data for a new work"
    const rkey = TID.nextStr();
    // convert the tags into json thru shenaniganery
    console.log(tags);

    let chapterContent: ChapterText | BskyPost | LeafletDoc;
    switch (option) {
      case "manual":
        chapterContent = {
          $type: "fan.fics.work.chapter#chapterText",
          text: content!
        };
      case "bsky":
        const bsky = await importChapter("bsky", bskyUri!);
        chapterContent = bsky!;
        if (!content) {
          
        }
      case "leaflet":
        const leaflet = await importChapter("leaflet", leafletUri!, loggedInUser.did);
        chapterContent = leaflet!;
      default:
        chapterContent = {
          $type: "fan.fics.work.chapter#chapterText",
          text: content!
        };
    }
    
    const createdAt = new Date();
    const workRecord: Omit<atProtoWork, "createdAt" | "updatedAt"> = {
      title,
      author: user.did,
      summary,
      tags,
      // createdAt: createdAt.toISOString(),
    };
    const chapterRecord: Omit<atProtoChapter, "content" | "createdAt" | "updatedAt"> = {
      title: (bskyTitle ? bskyTitle : chapterTitle!),
      // content: chapterContent,
      authorsNotes,
      endNotes,
      warnings,
      // createdAt: createdAt.toISOString(),
    };
    //#endregion
    
    //#region "Start publishing work to ATProto"
    // we'll assign this after a successful request was made
    let uri: string | undefined;
    let cUri: string | undefined;
    
    if (publish) {
      try {
        const { tags: workTags, ...withoutTags } = workRecord;
        
        const result = await createFanficWork({
          ...withoutTags,
          tags: [workTags],
          createdAt: createdAt.toISOString(),
        }, {
          ...chapterRecord,
          content: chapterContent,
          createdAt: createdAt.toISOString(),
        }, rkey);
        
        console.log(JSON.stringify(result));
        if (!result || result.length === 0) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Something went wrong with posting your fic to your PDS!",
          });
        }
        const writes = result as ComAtprotoRepoApplyWrites.CreateResult[];
        const work = writes[0];
        const chapter = writes[1];
        uri = work.uri;
        cUri = chapter.uri;
      } catch (error) {
        console.error(error);
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Something went wrong with posting your fic to your PDS!",
        });
      }
    }
    //#endregion

    //#region "Add a new work to the database"
    // check nanoid for collision probability: https://zelark.github.io/nano-id-cc/
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const custom = customAlphabet(alphabet, 16);
    const slug = custom();
    const newWork = await db.transaction(async (tx) => {
      const [work] = await tx.insert(Works).values({
        uri,
        slug,
        createdAt,
        ...workRecord
      }).onConflictDoNothing({ target: Works.slug }).returning();
      if (!work) { tx.rollback(); }
      const [chapter] = await tx.insert(Chapters).values({
        workId: work.id,
        slug: nanoid(),
        uri: cUri,
        content: content!,
        createdAt,
        ...chapterRecord
      }).onConflictDoNothing({ target: Chapters.id }).returning();
      if (!chapter) { tx.rollback(); }
      return work;
    });
    return newWork;
    //#endregion
  },
});