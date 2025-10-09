import type { APIContext } from "astro";
import { AtpBaseClient, AtUri } from "@atproto/api";
import { DidResolver } from "@atproto/identity";
import { AtProtoClient } from "./generated_client";

export async function getAgent(locals: APIContext["locals"]) {
  try {
    const agent = new AtpBaseClient(locals.loggedInUser?.fetchHandler!);
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

export async function fetchBskyPost(uri: string) {
  const { host, pathname } = new URL(uri);
  
  const bsky = [
    "blacksky.community",
    "bsky.app",
    "catsky.social",
    "deer.aylac.top",
    "deer-social-ayla.pages.dev",
    "deer.social",
    "main.bsky.dev",
    "social.daniela.lol",
  ];
  
  if (!bsky.includes(host)) {
    throw new Error("This URL is not from a compatible Bluesky client!");
  }

  const key = pathname.split("/")[-1];
  const handleOrDid = pathname.split("/")[1];
  const atUri = AtUri.make(handleOrDid, "app.bsky.feed.post", key);
  return atUri;
}

export async function fetchLeaflet(uri: string) {

}

const API_URL = import.meta.env.API_URL as string;
const SLICE_URI = import.meta.env.SLICE_URI as string;
const BEARER_TOKEN = import.meta.env.BEARER_TOKEN;
const XRPC = 'https://slices-api.fly.dev/xrpc';
const NAMESPACE = "fan.fics";

export const client = new AtProtoClient(
  API_URL,
  SLICE_URI,
  // oauth | authprovider
);

export async function callSlices(
  collection: "work" | "work.chapter" | "work.comment",
  endpoint: "createRecord" | "updateRecord" | "deleteRecord",
  rkey: string,
  record: any,
) {
  const url = `${XRPC}/${NAMESPACE}.${collection}.${endpoint}`;
  const params = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BEARER_TOKEN}`,
    }
  };

  switch (endpoint) {
    case "createRecord":
    case "updateRecord":
      try {
        const result = await fetch(url, {
          ...params,
          body: JSON.stringify({
            record,
            rkey,
            slice: SLICE_URI,
          }),
        });
        const json = await result.json();
        return json;
      } catch (error) {
        console.error(error);
        throw new Error("Record failed to post!");
      }
    case "deleteRecord":
      try {
        const result = await fetch(url, {
          ...params,
          body: JSON.stringify({ rkey }),
        });
        return result.ok;
      } catch (error) {
        console.error(error);
        throw new Error("Record failed to delete!");
      }
    default:
      break;
  }
}

export async function fetchSlices(query: string) {
  const url = `${API_URL}/graphql?slice=${SLICE_URI}`;
  const result = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `${query}`
    }),
  });
  const json = await result.json();
  return json;
}