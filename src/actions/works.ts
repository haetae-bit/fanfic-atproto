import { AtUri, ComAtprotoRepoStrongRef } from "@atproto/api";
import { getAgent } from "@/lib/atproto";
import { ActionError, defineAction } from "astro:actions";
import { db, eq, and, Users, Works } from "astro:db";
import { z } from "astro:schema";
import { customAlphabet } from "nanoid";
import { addChapter } from "@/lib/db";

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
      chapterOption: z.enum(["manual", "leaflet", "bsky"]),
      chapterUri: z.string().optional(),
      chapterTitle: z.string().optional(),
      content: z.string().optional(),
      notes: z.string().optional(),
    }),
    handler: async (
      {
        title,
        summary, 
        tags, 
        chapterOption, 
        chapterUri, 
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
      
      if (chapterUri) {
        const { collection, rkey } = new AtUri(chapterUri);
        const agent = await getAgent(context.locals);
        const record = await agent?.com.atproto.repo.getRecord({
          repo: loggedInUser.did,
          collection,
          rkey,
        });
        if (record?.success) {
          const { data } = record;
          console.log(data.value);
        }
      }

      let uri; // we'll assign this after a successful request was made
      // depending on whether someone toggled the privacy option, push this into user pds
      if (publish) {
        try {
          const agent = await getAgent(context.locals);

          if (!agent) {
            console.error("Agent not found!");
            throw new ActionError({
              code: "BAD_REQUEST",
              message: "Something went wrong when connecting to your PDS.",
            });
          }

          // ideally, we'd like tags to be references to another record but we won't process them here
          // we'll just smush this in and pray
          const result = await agent.fan.fics.work.createRecord({
            title,
            tags: [tags],
            author: loggedInUser.did,
            summary,
            chapters: [],
            createdAt: createdAt.toISOString(),
          });
          
          uri = result.uri;

          // only do this if chapterOption is set to manual
          if (chapterOption === "manual") {
            // const crkey = TID.nextStr();
            const chapter = await agent.fan.fics.work.chapter.createRecord({
              workAtUri: uri as string,
              title: chapterTitle!,
              content: content!,
              createdAt: createdAt.toISOString(),
              Main: {

              },
              ChapterRef: "",
            });

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

          const result = await agent.fan.fics.work.updateRecord(rkey, {
            title,
            tags: [tags],
            author: loggedInUser.did,
            chapters: [],
            createdAt: work.createdAt.toISOString(),
            updatedAt: new Date().toISOString(),
            summary,
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
          const result = await agent.fan.fics.work.deleteRecord(rkey);
          return result;
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