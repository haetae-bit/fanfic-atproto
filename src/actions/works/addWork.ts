import { ActionError, defineAction } from "astro:actions";
import { Chapters, db, eq, Users, Works } from "astro:db";
import { z } from "astro:schema";
import { customAlphabet, nanoid } from "nanoid";
import { createFanficWork, importChapter } from "@/lib/atproto";
import schema from "./schema";
import type { BskyPost, ChapterText, LeafletDoc } from "@/lib/types";

export default defineAction({
  accept: "form",
  input: schema,
  handler: async ({ title, summary, tags, publish }, context) => {
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
    // convert the tags into json thru shenaniganery
    console.log(tags);
    
    const createdAt = new Date();
    const record = {
      title,
      summary,
      tags,
    };
    //#endregion
    
    //#region "Start publishing work to ATProto"
    // we'll assign this after a successful request was made
    let uri: string | undefined;
    // let cUri: string | undefined;
    
    if (publish) {
      try {
        const { tags, ...rest } = record;
        
        const result = await createFanficWork({
          ...rest,
          tags: [tags],
          author: loggedInUser.did,
          createdAt: createdAt.toISOString(),
        });
        
        console.log(JSON.stringify(result));
        if (result.error) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Something went wrong with posting your fic to your PDS!",
          });
        }
        uri = result.uri;
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
    
    const [work] = await db.insert(Works).values({
      uri,
      slug,
      createdAt,
      author: user.did,
      ...record,
    }).onConflictDoNothing({ target: Works.slug }).returning();

    return work;
    // const newWork = await db.transaction(async (tx) => {
    //   const [work] = await tx.insert(Works).values({
    //     uri,
    //     slug,
    //     createdAt,
    //     author: user.did,
    //     ...record,
    //   }).onConflictDoNothing({ target: Works.slug }).returning();
    //   if (!work) { tx.rollback(); }
    //   const [chapter] = await tx.insert(Chapters).values({
    //     workId: work.id,
    //     slug: nanoid(),
    //     title: chapterTitle!,
    //     content: content!,
    //     uri: cUri,
    //     authorsNotes: notes,
    //   }).onConflictDoNothing({ target: Chapters.id }).returning();
    //   if (!chapter) { tx.rollback(); }
    //   return work;
    // });
    // return newWork;
    //#endregion
  },
});