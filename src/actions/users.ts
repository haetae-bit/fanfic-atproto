import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:content";
import { db, eq, Users } from "astro:db";

export const usersActions = {
  addUser: defineAction({
    accept: "form",
    input: z.object({
      nickname: z.string(),
    }),
    handler: async (input, context) => {
      const loggedInUser = context.locals.loggedInUser;
      
      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "To connect your PDS, you need to be logged in!",
        });
      }

      const user = await db
        .insert(Users)
        .values({
          ...input.nickname && { nickname: input.nickname },
          userDid: loggedInUser.did,
        })
        .returning();
      
      return user;
    },
  }),
  editUser: defineAction({
    accept: "form",
    input: z.object({
      nickname: z.string().nonempty({ message: "Don't submit an empty nickname!" }),
    }),
    handler: async ({ nickname }, context) => {
      const loggedInUser = context.locals.loggedInUser;

      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You need to be logged in to set a nickname!",
        });
      }

      // check if the user exists
      const user = await db.select()
        .from(Users)
        .where(eq(Users.userDid, loggedInUser.did))
        .limit(1);
      
      if (user.length === 0) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Either you haven't connected your PDS account or something went wrong.",
        });
      }

      const updatedUser = await db.update(Users)
        .set({ nickname })
        .where(eq(Users.userDid, loggedInUser.did))
        .returning();
      
      return updatedUser;
    },
  }),
}