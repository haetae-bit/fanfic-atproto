import { defineAction, ActionError } from "astro:actions";
import { db, Works, and, eq } from "astro:db";
import { AtUri } from "@atproto/api";
import { getAgent, client } from "@/lib/atproto";
import schema from "./schema";

export default defineAction({
  accept: "form",
  input: schema,
  handler: async ({ title, summary, tags }, context) => {
    const workId = context.params["workId"];
    const loggedInUser = context.locals.loggedInUser;
    
    //#region "Check authentication"
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
    //#endregion

    //#region "Does the work exist?"
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
    //#endregion

    //#region "If the work has a URI, update the record on ATProto"
    // construct an update timestamp here to be used in the ATProto and DB update methods
    const updatedAt = new Date();
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
    //#endregion
    //#region "Update the work in the database"
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
    //#endregion
  },
})