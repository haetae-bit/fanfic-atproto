import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { db, Works, eq, Chapters } from "astro:db";
import { AtUri } from "@atproto/api";
import { TID } from "@atproto/common-web";
import { callSlices, fetchBskyPost, fetchLeaflet, fetchSlices, getAgent } from "@/lib/atproto";
import { updateWork } from "@/lib/db";
import schema from "./schema";

export default defineAction({
  accept: "form",
  input: schema.extend({
    publish: z.boolean({ coerce: true }),
  }),
  handler: async ({ option, bskyUri, leafletUri, title, content, notes, publish }, context) => {
    //#region "Check authentication and if work exists"
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
    //#endregion
    //#region "Import a chapter"
    if (option !== "manual") {
      if (bskyUri) {
        const bskyPost = await fetchBskyPost(bskyUri);
        console.log(bskyPost);
      }
      if (leafletUri) {
        const leaflet = await fetchLeaflet(leafletUri);
        console.log(leaflet);
      }
    }
    //#endregion

    //#region "Construct the data"
    const createdAt = new Date();
    let uri: string | undefined; // this will be set once a chapter is published
    //#endregion
    //#region "Publish the chapter"
    if (publish && (option === "manual")) {
      // fetch the work record then add
      if (!work.uri) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Your work isn't public on atproto!",
        });
      }

      const { host } = new AtUri(work.uri);
      if (loggedInUser.did !== host) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You can only add chapters to works that you own!",
        });
      }

      // Probably the only way I can write this nightmare:
      // https://api.slices.network/graphql?slice=at://did:plc:dg2qmmjic7mmecrbvpuhtvh6/network.slices.slice/3m2fpay6dw522
      const response = await fetchSlices(`
        query {
          fanFicsWorks(where: {
            and: [{
              uri: { eq: "${work.uri}" },
              author: { eq: "${loggedInUser.did}" }
            }]
          }) {
            edges {
              node {
                uri
              }
            }
          }
        }
      `);
      
      const { fanFicsWorks } = response.data;
      const { node } = fanFicsWorks.edges;
      console.log(JSON.stringify(fanFicsWorks));
      if (!node.uri) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "That work does not exist!",
        });
      }

      // new chapter record key
      const rkey = TID.nextStr();
      const record = await callSlices(
        "work.chapter",
        "createRecord",
        rkey,
        {
          title,
          content,
          notes,
          createdAt: createdAt.toISOString(),
        }
      );

      if (!record.success) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Failed to add a new chapter to the work",
        });
      }

      uri = record.data.uri;
    }
    //#endregion
    //#region "Post the chapter to the database"
    const [result] = await db.insert(Chapters).values({
      workId: work.id,
      uri,
      title: title!,
      content: content!,
      notes,
    }).returning();
    // any new chapters added also need to update the work
    await updateWork(result);
    //#endregion
    return result;
  },
});