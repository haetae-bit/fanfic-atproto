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

const API_URL = import.meta.env.API_URL as string;
const SLICE_URI = import.meta.env.SLICE_URI as string;

export const client = new AtProtoClient(
  API_URL,
  SLICE_URI,
  // oauth | authprovider
);

export async function callSlices(collection: string, endpoint: string, record: { rkey: string, record: any }) {
  const BEARER_TOKEN = import.meta.env.BEARER_TOKEN;
  const SLICES_API = 'https://slices-api.fly.dev/xrpc';
  const NAMESPACE = "fan.fics";
  const url = `${SLICES_API}/${NAMESPACE}.${collection}.${endpoint}`;
  let method = "";

  if (endpoint.includes("getRecord")) {
    method = "GET";
  } else {
    method = "POST";
  }

  const result = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
    body: JSON.stringify({
      ...record,
      slice: SLICE_URI,
    }),
  });

  const json = await result.json();
  return json;
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

export function fetchLeaflet(uri: string) {
  
}