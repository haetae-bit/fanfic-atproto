import slugify from "@sindresorhus/slugify";
import { and, Chapters, db, eq, Tags, Works } from "astro:db";
import type { Chapter } from "./types";
// import { SQLiteOAuthStorage } from "@slices/oauth";

const OAUTH_CLIENT_ID = import.meta.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = import.meta.env.OAUTH_CLIENT_SECRET;
const OAUTH_REDIRECT_URI = import.meta.env.OAUTH_REDIRECT_URI;
const OAUTH_AIP_BASE_URL = import.meta.env.OAUTH_AIP_BASE_URL;
const API_URL = import.meta.env.API_URL;
export const SLICE_URI = import.meta.env.SLICE_URI;

// oauth session
// const DATABASE_URL = import.meta.env.DATABASE_URL || "slices.db";
// const oauthStorage = new SQLiteOAuthStorage(DATABASE_URL);
// const oauthConfig = {
//   clientId: OAUTH_CLIENT_ID,
//   clientSecret: OAUTH_CLIENT_SECRET,
//   authBaseUrl: OAUTH_AIP_BASE_URL,
//   redirectUri: OAUTH_REDIRECT_URI,
//   scopes: ["atproto", "openid", "profile", "transition:generic"],
// };

// fetch tags
export async function searchTags(search: string) {
  const tags = await db.selectDistinct().from(Tags);
  // fuzzy search db?
  const results = tags.filter(({ label }) => label.includes(search));
  return results;
}

export async function findTag(label: string) {
  const tags = await db
    .selectDistinct()
    .from(Tags)
    .where(eq(Tags.label, label));
  const tag = tags.filter(({ slug }) => slug === slugify(label));
  return tag;
}

// add tag if it doesn't already exist
export async function addTag(type: "character" | "relationship" | "series" | "warnings", label: string) {
  const tag = findTag(label);
  if (!tag) {
    const slug = `${type}:${slugify(label)}`;
    await db.insert(Tags).values({ type, slug, label }).returning();
  }
}

// this should be called when a new work is added
export async function addChapter(workId: number, title: string, content: string, uri?: string, notes?: string) {
  if (!workId) {
    throw new Error("Work ID is invalid!");
  }
  
  try {
    const result = await db.insert(Chapters).values({
      workId,
      uri,
      title,
      slug: "",
      // order,
      authorsNotes: "",
      endNotes: "",
      content,
    }).returning();
    return result;
  } catch (error) {
    console.error(error);
  }
}

export async function updateWork(chapter: Chapter) {
  await db
    .update(Works)
    .set({ updatedAt: chapter.createdAt })
    .from(Chapters)
    .where(and(
      eq(Works.id, chapter.workId),
      eq(Chapters.id, chapter.id)
    ));
}

