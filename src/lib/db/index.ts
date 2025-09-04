import { DB_URL, DB_TOKEN } from "astro:env/server";

import { createDatabase } from "db0";
import { createStorage } from "unstorage";
import dbDriver from "unstorage/drivers/db0";
import libSqlConnector from "db0/connectors/libsql/node";
import { drizzle } from "db0/integrations/drizzle";

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