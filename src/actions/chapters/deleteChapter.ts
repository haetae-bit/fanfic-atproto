import { defineAction } from "astro:actions";

export default defineAction({
  accept: "form",
  handler: async (_, context) => {
    const workSlug = context.params["workId"];
    if (!workSlug) {
      // there is no work or chapter!
    }
  },
});