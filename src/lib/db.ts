import { DB_URL, DB_TOKEN } from "astro:env/server";

import { createDatabase } from "db0";
import { createStorage } from "unstorage";
import dbDriver from "unstorage/drivers/db0";
import libSqlConnector from "db0/connectors/libsql/web";
import { drizzle } from "db0/integrations/drizzle";
import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";

export const database = createDatabase(
  libSqlConnector({
    url: DB_URL,
    ...import.meta.env.PROD && { authToken: DB_TOKEN },
  })
);

export const driver = drizzle(database);

export const storage = createStorage({
  driver: dbDriver({
    database,
    tableName: "fanfic_archive",
  }),
});

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