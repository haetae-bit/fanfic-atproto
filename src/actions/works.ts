import { TID } from "@atproto/common-web";
import { getAgent } from "@/lib/atproto";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:content";
import { db, eq, Users, Works } from "astro:db";
import { customAlphabet } from "nanoid";

const workSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.string(),
  public: z.boolean(),
});

export const worksActions = {
  addWork: defineAction({
    accept: "form",
    input: workSchema,
    handler: async (input, context) => {
      const loggedInUser = context.locals.loggedInUser;

      // check against auth
      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You're not logged in!",
        });
      }

      // find the did of the logged in user from our db
      const query = await db
        .select({ did: Users.userDid })
        .from(Users)
        .where(eq(Users.userDid, loggedInUser.did))
        .limit(1);

      if (query.length === 0) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You can only add a work if you connected your PDS!",
        });
      }

      const [user] = query;

      // check nanoid for collision probability: https://zelark.github.io/nano-id-cc/
      const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const nanoid = customAlphabet(alphabet, 16);
      const slug = nanoid();

      // convert the tags into json thru shenaniganery
      const tags = input.tags;
      
      const work = await db.insert(Works).values({
        slug,
        author: user.did,
        title: input.title,
        content: input.content,
        tags,
      }).returning();
      
      const [newWork] = work;

      // depending on whether someone toggled the privacy option, push this into user pds
      if (input.public) {
        // we don't need the id, but we'll need the author's did
        // we'll grab the created + updated timestamps and convert them into strings
        const { author, id, createdAt, updatedAt, ...data } = newWork;
        const createdTimestamp = createdAt.toISOString();
        const record = {
          ...data,
          createdAt: createdTimestamp,
        };
        
        try {
          const rkey = TID.nextStr();
          const agent = await getAgent(context.locals);

          if (!agent) {
            console.error("Agent not found!");
            throw new ActionError({
              code: "BAD_REQUEST",
              message: "Something went wrong when connecting to your PDS.",
            });
          }

          // ideally, we'd like tags to be references to another record but we won't process them here
          // we'll just smush this in and pray
          const result = await agent.com.atproto.repo.putRecord({
            repo: author, // since we KNOW that the author is the users' did
            collection: "moe.fanfics.works",
            rkey,
            record,
            validate: false,
          });

          return result.data.uri;
        } catch (error) {
          console.error(error);
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Something went wrong with posting your fic to your PDS!",
          });
        }
      }
      
      // otherwise just return the work
      return newWork;
    },
  }),
};