import { AtUri } from "@atproto/api";
import { callSlices, client, getAgent } from "@/lib/atproto";
import { ActionError, defineAction } from "astro:actions";
import { db, eq, and, Users, Works } from "astro:db";
import { z } from "astro:schema";
import { customAlphabet } from "nanoid";
import { addChapter } from "@/lib/db";
import { TID } from "@atproto/common-web";

const workSchema = z.object({
  title: z.string(),
  summary: z.string(),
  tags: z.string(),
  publish: z.boolean(),
});

export const worksActions = {
  addWork: defineAction({
    accept: "form",
    input: workSchema.extend({
      option: z.enum(["manual", "leaflet", "bsky"]),
      bskyUri: z.string().optional(),
      leafletUri: z.string().optional(),
      chapterTitle: z.string().optional(),
      content: z.string().optional(),
      notes: z.string().optional(),
    }),
    handler: async (
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

      // check against auth
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

      // convert the tags into json thru shenaniganery
      console.log(tags);

      // we'll create a timestamp and record here
      const createdAt = new Date();
      const record = {
        title,
        summary,
        tags,
      };
      
      // if the chapter is being imported, check if it exists
      if (option !== "manual") {
        // record key is 13 chars long
        // const { records } = await client.getSliceRecords({
        //   where: {
        //     collection: { in: ["app.bsky.feed.post", "pub.leaflet.document"] },
        //     did: { eq: loggedInUser.did },
        //   }
        // });

        // console.log(records);
      }

      let uri; // we'll assign this after a successful request was made
      // depending on whether someone toggled the privacy option, push this into user pds
      if (publish) {
        try {
          const rkey = TID.nextStr();
          const agent = await getAgent(context.locals);

          if (!agent) {
            console.error("Agent not found!");
            throw new ActionError({
              code: "BAD_REQUEST",
              message: "Something went wrong when connecting to your PDS.",
            });
          }

          // we'll just smush this in and pray
          const result = await callSlices(
            "work",
            "createRecord",
            { 
              rkey,
              record: {
                ...record,
                author: loggedInUser.did,
                createdAt: createdAt.toISOString(),
              }
            }
          );
          
          console.log(JSON.stringify(result));
          uri = result.uri;

          // only do this if chapterOption is set to manual
          if (option === "manual") {
            const crkey = TID.nextStr(rkey);
            const chapter = await callSlices(
              "work.chapter",
              "createRecord",
              {
                rkey: crkey,
                record: {
                  title: chapterTitle,
                  content,
                  createdAt: createdAt.toISOString(),
                  work: new AtUri(uri),
                }
              }
            );

            console.log(chapter);
          }
        } catch (error) {
          console.error(error);
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Something went wrong with posting your fic to your PDS!",
          });
        }
      }

      // check nanoid for collision probability: https://zelark.github.io/nano-id-cc/
      const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const nanoid = customAlphabet(alphabet, 16);
      const slug = nanoid();

      // regardless if the user posted to their pds, record it into the db here too
      const [work] = await db.insert(Works).values({
        uri,
        slug,
        createdAt,
        author: user.did,
        ...record,
      }).returning();

      if (chapterTitle && content) {
        await addChapter(
          work.id,
          chapterTitle,
          content,
          notes,
        );
      }
      
      return work;
    },
  }),
  updateWork: defineAction({
    accept: "form",
    input: workSchema,
    handler: async ({ title, summary, tags }, context) => {
      const workId = context.params["workId"];
      const loggedInUser = context.locals.loggedInUser;
      
      if (!workId) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Work slug not found!",
        });
      }

      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You're not logged in!",
        });
      }

      const [work] = await db.select().from(Works)
        .where(and(
          eq(Works.slug, workId),
          eq(Works.author, loggedInUser.did)
        ))
        .limit(1);
      
      if (!work) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Could not find the work to update!",
        });
      }

      const updatedAt = new Date();
      // if the work has a uri, we should update the record to the pds
      // this should be handled by an appview...
      if (work.uri) {
        try {
          const { rkey, host } = new AtUri(work.uri);
          const agent = await getAgent(context.locals);

          if (!agent) {
            console.error("Agent not found!");
            throw new ActionError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong when connecting to your PDS.",
            });
          }

          if (loggedInUser.did !== host) {
            throw new ActionError({
              code: "UNAUTHORIZED",
              message: "You can only update your own work!",
            });
          }
          
          const result = client.fan.fics.work.updateRecord(rkey, {
            title,
            tags: [tags],
            author: loggedInUser.did,
            summary,
            createdAt: work.createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
          });

          if (!result) {
            throw new ActionError({
              code: "BAD_REQUEST",
              message: "Something went wrong with updating your fic on your PDS!",
            });
          }
        } catch (error) {
          console.error(error);
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Something went wrong with updating your fic on your PDS!",
          });
        }
      }

      const [result] = await db.update(Works)
        .set({
          title,
          tags,
          summary,
          updatedAt,
        })
        .where(and(
          eq(Works.slug, workId!),
          eq(Works.author, loggedInUser.did)
        ))
        .returning();
      
      return result;
    },
  }),
  deleteWork: defineAction({
    accept: "form",
    handler: async (_, context) => {
      const workId = context.params["workId"];
      const loggedInUser = context.locals.loggedInUser;

      if (!workId) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Work slug not found!",
        });
      }

      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You're not logged in!",
        });
      }

      const [work] = await db.select().from(Works)
        .where(and(
          eq(Works.slug, workId),
          eq(Works.author, loggedInUser.did)
        ))
        .limit(1);
      
      if (!work) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Could not find the work!",
        });
      }

      if (work.uri) {
        try {
          const { rkey, host } = new AtUri(work.uri);
          const agent = await getAgent(context.locals);

          if (!agent) {
            console.error("Agent not found!");
            throw new ActionError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong when connecting to your PDS.",
            });
          }

          if (loggedInUser.did !== host) {
            throw new ActionError({
              code: "UNAUTHORIZED",
              message: "You can only delete works that you own!",
            });
          }

          // we'll just smush this in and pray
          await client.fan.fics.work.deleteRecord(rkey);
        } catch (error) {
          console.error(error);
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Something went wrong with deleting your fic from your PDS!",
          });
        }
      }

      const [result] = await db.delete(Works)
        .where(and(
          eq(Works.slug, workId!),
          eq(Works.author, loggedInUser.did)
        ))
        .returning();
      
      return result;
    },
  }),
};