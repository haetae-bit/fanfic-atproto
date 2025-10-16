import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { db, Works, eq, Chapters } from "astro:db";
import { AtUri } from "@atproto/api";
import { TID } from "@atproto/common-web";
import { createFanficChapter, findFanfics, importChapter } from "@/lib/atproto";
import { updateWork } from "@/lib/db";
import type { BskyPost, ChapterText, LeafletDoc } from "@/lib/types";
import schema from "./schema";
import { nanoid } from "nanoid";

export default defineAction({
  accept: "form",
  input: schema.extend({
    publish: z.boolean({ coerce: true }),
  }).refine(data => {
    switch (data.option) {
      case "bsky":
        return data.bskyUri && data.bskyTitle;
      case "leaflet":
        return data.leafletUri;
      case "manual":
        return data.title && data.content;
      default:
        return false
    }
  }, {
    message: "Missing fields for the chapter option!",
    path: ["option"]
  }),
  handler: async ({ option, bskyUri, bskyTitle, leafletUri, title, content, authorsNotes, endNotes, warnings, publish }, context) => {
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
    let chapterContent: ChapterText | BskyPost | LeafletDoc;
    switch (option) {
      case "bsky":
        const bsky = await importChapter("bsky", bskyUri!);
        chapterContent = bsky?.record!;
        title = bskyTitle!;
        content = JSON.stringify(bsky?.value);
      case "leaflet":
        const leaflet = await importChapter("leaflet", leafletUri!, loggedInUser.did);
        chapterContent = leaflet?.record!;
        title = leaflet?.value.title as string;
        content = JSON.stringify(leaflet?.value);
      default:
        chapterContent = {
          $type: "fan.fics.work.chapter#chapterText",
          text: content!
        };
        title = title as string;
        content = content as string;
    }
    //#endregion

    //#region "Construct the data"
    const createdAt = new Date();
    let uri: string | undefined; // this will be set once a chapter is published
    const chapter = {
      title,
      warnings,
      authorsNotes,
      endNotes
    };
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
      const response = await findFanfics(`
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
      const record = await createFanficChapter({
        content: chapterContent,
        ...chapter,
        createdAt: createdAt.toISOString(),
      });

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
      slug: nanoid(),
      uri,
      content,
      ...chapter,
    }).returning();
    // any new chapters added also need to update the work
    await updateWork(result);
    //#endregion
    return result;
  },
});