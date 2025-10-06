import { getAgent } from "@/lib/atproto";
import { AtUri } from "@atproto/api";
import { TID } from "@atproto/common-web";
import { ActionError, defineAction } from "astro:actions"
import { Chapters, db, eq, Works } from "astro:db";
import { z } from "astro:schema"

const chapterSchema = z.object({
  uri: z.string().optional(), // this is in case someone wants to add a new post
  title: z.string().optional(),
  notes: z.string().optional(),
  content: z.string().optional(),
});

export const chaptersActions = {
  addChapter: defineAction({
    accept: "form",
    input: chapterSchema.extend({
      publish: z.boolean({ coerce: true }),
    }),
    handler: async ({ uri, title, content, notes, publish }, context) => {
      const loggedInUser = context.locals.loggedInUser;
      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You're not logged in!",
        });
      }

      const workSlug = context.params["workId"];
      if (!workSlug) {
        throw new ActionError({
          message: "Work slug not found!",
          code: "NOT_FOUND",
        });
      }

      const [work] = await db.select({ id: Works.id, uri: Works.uri })
        .from(Works)
        .where(eq(Works.slug, workSlug))
        .limit(1);
      
      if (!work) {
        throw new ActionError({
          message: "Work not found!",
          code: "NOT_FOUND",
        });
      }

      if (uri) {
        const { rkey, host, collection } = new AtUri(uri);
        // start an import process here
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
            message: "You can only add posts or documents that you own!",
          });
        }

        const record = await agent.com.atproto.repo.getRecord({
          repo: loggedInUser.did,
          collection,
          rkey,
        });
      }

      const createdAt = new Date();
      let atUri; // this will be set once a chapter is published
      if (publish && !uri) {
        // fetch the work record then add
        if (!work.uri) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Your work isn't public on atproto!",
          });
        }

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
            message: "You can only add chapters to works that you own!",
          });
        }

        const record = await agent.com.atproto.repo.getRecord({
          repo: loggedInUser.did,
          collection: "fan.fics.work",
          rkey,
        });

        if (!record.success) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "That work does not exist!",
          });
        }

        // new chapter record key
        const crkey = TID.nextStr();
        const chapter = await agent.com.atproto.repo.createRecord({
          repo: loggedInUser.did,
          collection: "moe.fanfics.chapter",
          rkey: crkey,
          record: {
            workAtUri: work.uri,
            title,
            content,
            notes,
            createdAt: createdAt.toISOString(),
          },
          validate: false,
        });

        if (!chapter.success) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Failed to add a new chapter to the work",
          });
        }

        atUri = chapter.data.uri;
      }
      
      const result = await db.insert(Chapters).values({
        workId: work.id,
        title: title!,
        content: content!,
        notes,
      }).returning();

      return result;
    },
  }),
  editChapter: defineAction({
    accept: "form",
    input: chapterSchema,
    handler: async ({ uri, title, content, notes }, context) => {

    }
  }),
  deleteChapter: defineAction({
    accept: "form",
    handler: async (_, context) => {
      const workSlug = context.params["workId"];
      if (!workSlug) {
        // there is no work or chapter!
      }
    },
  }),
}