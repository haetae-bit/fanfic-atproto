import type { APIContext } from "astro";
import { AtpBaseClient, AtUri } from "@atproto/api";
import { DidResolver } from "@atproto/identity";
import { AtProtoClient } from "./generated_client";
import type { atProtoChapter, atProtoComment, atProtoWork, BskyPost, LeafletDoc } from "./types";

export async function getAgent(locals?: APIContext["locals"]) {
  try {
    const agent = new AtpBaseClient(
      locals?.loggedInUser?.fetchHandler ?? { service: "api.bsky.social" }
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

async function fetchBskyPost(url: string) {
  const { host, pathname } = new URL(url);
  
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
  console.log(`rkey is ${key}\nhandle/did is ${handleOrDid}`);
  const atUri = AtUri.make(handleOrDid, "app.bsky.feed.post", key);
  return atUri;
}

async function fetchLeaflet(uri: string, did: string) {
  const agent = await getAgent();
  const atUri = new AtUri(uri);
  const { collection, rkey } = atUri;
  const record = await agent?.com.atproto.repo.getRecord({
    rkey,
    collection,
    repo: did,
  });
  return record?.data;
}

export async function importChapter(option: "manual" | "bsky" | "leaflet", uri: string, did?: string) {
  let chapterContent: BskyPost | LeafletDoc;
  switch (option) {
    case "bsky":
      const bsky = await fetchBskyPost(uri);
      console.log("bsky post: " + JSON.stringify(bsky));
      chapterContent = {
        $type: "fan.fics.work.chapter#bskyPost",
        postRef: {
          uri: bsky.toString(),
          cid: ""
        }
      };
      return chapterContent;
    case "leaflet":
      const leaflet = await fetchLeaflet(uri, did!);
      console.log("leaflet: " + JSON.stringify(leaflet));
      chapterContent = {
        $type: "fan.fics.work.chapter#leafletDoc",
        docRef: {
          uri: leaflet!.uri,
          cid: leaflet!.cid!,
        }
      };
      return chapterContent;
  }
}

// This is Slices-related code, which makes requests to Slices for fan.fics.*-specific lexicons
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

// This is a very thin wrapper for the fetch requests to Slices
async function callSlices(
  collection: "work" | "work.chapter" | "work.comment",
  endpoint: "createRecord" | "updateRecord" | "deleteRecord",
  data: {
    record?: atProtoWork | atProtoChapter | atProtoComment,
    rkey?: string,
  }
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
            record: data.record,
            ...(endpoint === "updateRecord" && { rkey: data.rkey }),
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
          body: JSON.stringify({ rkey: data.rkey }),
        });
        return result;
      } catch (error) {
        console.error(error);
        throw new Error("Record failed to delete!");
      }
  }
}

export async function createFanficWork(record: atProtoWork) {
  return await callSlices("work", "createRecord", { record });
}

export async function updateFanficWork(record: atProtoWork, rkey: string) {
  return await callSlices("work", "updateRecord", { record, rkey });
}

export async function deleteFanficWork(rkey: string) {
  return await callSlices("work", "deleteRecord", { rkey });
}

export async function createFanficChapter(record: atProtoChapter) {
  return await callSlices("work.chapter", "createRecord", { record });
}

export async function updateFanficChapter(record: atProtoChapter, rkey: string) {
  return await callSlices("work.chapter", "updateRecord", { record, rkey });
}

export async function deleteFanficChapter(rkey:string) {
  return await callSlices("work.chapter", "deleteRecord", { rkey });
}

export async function createFanficComment(record: atProtoComment) {
  return await callSlices("work.comment", "createRecord", { record });
}

export async function updateFanficComment(record: atProtoComment, rkey: string) {
  return await callSlices("work.comment", "updateRecord", { record, rkey });
}

export async function deleteFanficComment(rkey: string) {
  return await callSlices("work.comment", "deleteRecord", { rkey });
}

// This is for finding specific fanfics through GraphQL, so this will be the SEARCH query
export async function findFanfics(query: string) {
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