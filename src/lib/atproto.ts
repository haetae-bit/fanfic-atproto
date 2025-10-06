import type { APIContext } from "astro";
import { AtpBaseClient } from "@atproto/api";
import { DidResolver } from "@atproto/identity";
import { AtProtoClient } from "./client";

export async function getAgent(locals: APIContext["locals"]) {
  try {
    const agent = new AtpBaseClient(locals.loggedInUser?.fetchHandler!);
    const client = new AtProtoClient(
      'https://api.slices.network',
      'at://did:plc:dg2qmmjic7mmecrbvpuhtvh6/network.slices.slice/3m2fpay6dw522',
      // oauthClient
    );
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