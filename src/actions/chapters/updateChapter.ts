import { defineAction } from "astro:actions";
import schema from "./schema";

export default defineAction({
  accept: "form",
  input: schema,
  handler: async ({ uri, title, content, notes }, context) => {

  }
});