import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
  handle: text().notNull(),
  userDid: text().notNull(),
});

export const worksTable = sqliteTable("works_table", {
  id: int().primaryKey({ autoIncrement: true }),
  author: text(),
  // recordkey
  title: text(),
  body: text(),
});

export const tagsTable = sqliteTable("tags_table", {
  id: int().primaryKey({ autoIncrement: true }),
  label: text(),
  // rkey
  class: text(),
  // classrkey?
});