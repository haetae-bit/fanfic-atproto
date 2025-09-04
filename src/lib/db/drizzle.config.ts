import { DB_URL, DB_TOKEN } from "astro:env/server";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: DB_URL,
    authToken: DB_TOKEN,
  },
});