import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:content";
import { db, Users } from "astro:db";

export const usersActions = {
  addUser: defineAction({
    accept: "form",
    input: z.object({
      did: z.string(),
    }),
    handler: async ({ did }, context) => {
      const loggedInUser = context.locals.loggedInUser;
      
      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "To connect your PDS, you need to be logged in!",
        });
      }

      const user = await db
        .insert(Users)
        .values({ userDid: did })
        .returning();
      
      return user;
    },
  })
}