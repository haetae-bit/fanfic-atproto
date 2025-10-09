import { ActionError, defineAction } from "astro:actions";
import { db, eq, Users, Works } from "astro:db";
import { z } from "astro:schema";
import { AtUri } from "@atproto/api";
import { TID } from "@atproto/common-web";
import { customAlphabet } from "nanoid";
import { callSlices, fetchBskyPost, fetchLeaflet, getAgent } from "@/lib/atproto";
import { addChapter, updateWork } from "@/lib/db";
import schema from "./schema";

export default defineAction({
  accept: "form",
  input: schema.extend({
    option: z.enum(["manual", "bsky", "leaflet"]),
    bskyUri: z.string().optional(),
    leafletUri: z.string().optional(),
    chapterTitle: z.string().optional(),
    content: z.string().optional(),
    notes: z.string().optional(),
  }),
  handler: async (
    // yeah this is fucking insane
    {
      title,
      summary, 
      tags, 
      option, 
      bskyUri, 
      leafletUri, 
      chapterTitle, 
      content, 
      notes, 
      publish 
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
    // convert the tags into json thru shenaniganery
    console.log(tags);
    
    const createdAt = new Date();
    const record = {
      title,
      summary,
      tags,
    };
    //#endregion
    
    //#region "Import chapter from Bluesky or Leaflet"
    if (option !== "manual") {
      if (bskyUri) {
        const result = await fetchBskyPost(bskyUri);
        console.log("bsky post: " + JSON.stringify(result));
      }
      if (leafletUri) {
        const result = await fetchLeaflet(leafletUri);
        console.log("leaflet: " + JSON.stringify(result));
      }
    }
    //#endregion
    
    //#region "Start publishing work to ATProto"
    // we'll assign this after a successful request was made
    let uri: string | undefined;
    let cUri: string | undefined;
    
    if (publish) {
      try {
        const rkey = TID.nextStr();
        const { tags, ...rest } = record;
        
        const result = await callSlices(
          "work",
          "createRecord",
          rkey,
          {
            ...rest,
            tags: [tags],
            author: loggedInUser.did,
            createdAt: createdAt.toISOString()
          }
        );
        
        console.log(JSON.stringify(result));
        if (result.error) {
          console.error(`this went wrong for WORK: ${result.message}`);
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Something went wrong!",
          });
        }
        uri = result.uri;

        //#region "Publish the first chapter with the work to ATProto"
        // ONLY proceed if the uri is set from successfully adding a work
        if (uri) {
          const crkey = TID.nextStr(rkey);
          let chapterContent = {};
                  
          if (option === "manual") {
            chapterContent = {
              $type: "fan.fics.work.chapter#chapterText",
              text: content,
            };
          }

          const chapter = await callSlices(
            "work.chapter",
            "createRecord",
            crkey,
            {
              title: chapterTitle,
              content: chapterContent,
              createdAt: createdAt.toISOString(),
              workUri: uri,
            }
          );

          console.log(JSON.stringify(chapter));
          if (chapter.error) {
            console.error(`this went wrong: ${chapter.message}`);
            throw new ActionError({
              code: "BAD_REQUEST",
              message: "Something went wrong!",
            });
          }
          cUri = chapter.uri;
          //#endregion
        }
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
    const nanoid = customAlphabet(alphabet, 16);
    const slug = nanoid();

    const [work] = await db.insert(Works).values({
      uri,
      slug,
      createdAt,
      author: user.did,
      ...record,
    }).returning();

    if (chapterTitle && content) {
      try {
        await addChapter(
          work.id,
          chapterTitle,
          content,
          cUri,
          notes,
        );
      } catch (error) {
        console.error(error);
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Something went wrong!",
        });
      }
    }
    
    return work;
    //#endregion
  },
});