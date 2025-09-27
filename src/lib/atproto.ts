import type { APIContext } from "astro";
import { AtpBaseClient } from "@atproto/api";
import { DidResolver } from "@atproto/identity";

export async function getAgent(locals: APIContext["locals"]) {
  const loggedInUser = locals.loggedInUser;
  try {
    const agent = new AtpBaseClient(loggedInUser?.fetchHandler!);
    return agent;
  } catch (error) {
    // we don't need to return anything to make sure the site still functions for not logged in users?
    console.error(error);
    return;
  }
}

const RESOLVER = new DidResolver({});
export async function didToHandle(did: string) {
  try {
    const atProtoData = await RESOLVER.resolveAtprotoData(did);
    return atProtoData.handle;
  } catch (error) {
    return "Invalid handle";
  }
}