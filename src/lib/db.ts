import slugify from "@sindresorhus/slugify";
import { Chapters, db, eq, Tags } from "astro:db";
import type { Chapter } from "./types";

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
export async function addChapter(workId: number, title: string, content: string, notes?: string) {
  if (!workId) {
    throw new Error("Work ID is invalid!");
  }

  await db.insert(Chapters).values({
    workId,
    title,
    // order,
    notes,
    content,
  });
}

