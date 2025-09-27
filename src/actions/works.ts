import { AtUri } from "@atproto/api";
import { TID } from "@atproto/common-web";
import { getAgent } from "@/lib/atproto";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:content";
import { db, eq, and, Users, Works } from "astro:db";
import { customAlphabet } from "nanoid";

const workSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.string(),
  publish: z.boolean(),
});

export const worksActions = {
  addWork: defineAction({
    accept: "form",
    input: workSchema,
    handler: async ({ title, content, tags, publish }, context) => {
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
        content,
        tags,
      };

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

          // ideally, we'd like tags to be references to another record but we won't process them here
          // we'll just smush this in and pray
          const result = await agent.com.atproto.repo.createRecord({
            repo: user.did,
            collection: "moe.fanfics.works",
            rkey,
            record: {
              ...record,
              createdAt: createdAt.toISOString(),
            },
            validate: false,
          });
          
          uri = result.data.uri;
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

      const work = await db.insert(Works).values({
        uri,
        slug,
        createdAt,
        author: user.did,
        ...record,
      }).returning();
      
      const [newWork] = work;
      return newWork;
    },
  }),
  updateWork: defineAction({
    accept: "form",
    input: workSchema,
    handler: async ({ title, content, tags }, context) => {
      const workId = context.params["workId"];
      const loggedInUser = context.locals.loggedInUser;
      
      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You're not logged in!",
        });
      }

      const [work] = await db.select().from(Works)
        .where(and(
          eq(Works.slug, workId!),
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

          const result = await agent.com.atproto.repo.putRecord({
            repo: work.author, // since the author will be a did
            collection: "moe.fanfics.works",
            rkey,
            record: {
              title,
              tags,
              content,
              createdAt: work.createdAt.toISOString(),
              updatedAt: updatedAt.toISOString(),
            },
            validate: false,
          });

          if (!result.success) {
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
          content,
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

      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You're not logged in!",
        });
      }

      const [work] = await db.select().from(Works)
        .where(and(
          eq(Works.slug, workId!),
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
          const result = await agent.com.atproto.repo.deleteRecord({
            repo: work.author, // since the author will be a did
            collection: "moe.fanfics.works",
            rkey,
          });

          if (!result.success) {
            throw new ActionError({
              code: "BAD_REQUEST",
              message: "Something went wrong with deleting your fic from your PDS!",
            });
          }
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