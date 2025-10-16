import { AtpBaseClient } from "@atproto/api";
import { IdResolver } from "@atproto/identity";
import { AtProtoClient } from "./generated_client";
import type { atProtoChapter, atProtoComment, atProtoWork, BskyPost, LeafletDoc } from "./types";

const IDENTITY_RESOLVER = new IdResolver({});
export async function getDid(didOrHandle: string) {
  if (didOrHandle.startsWith("did:")) {
    return didOrHandle;
  }
  return await IDENTITY_RESOLVER.handle.resolve(didOrHandle);
};

async function getPdsUrl(didOrHandle: string) {
  const did = await getDid(didOrHandle);
  if (!did) {
    throw new Error(`Did not resolve to a valid DID: ${didOrHandle}`);
  }
  const atprotoData = await IDENTITY_RESOLVER.did.resolveAtprotoData(did);
  return atprotoData.pds;
};

export async function getAgent(loggedInUser: NonNullable<App.Locals["loggedInUser"]>) {
  try {
    const agent = new AtpBaseClient(loggedInUser.fetchHandler);
    return agent;
  } catch (error) {
    return null;
  }
}

export async function getPdsAgent(pdsOwner: { didOrHandle: string } | { loggedInUser: NonNullable<App.Locals["loggedInUser"]> }) {
  if ("loggedInUser" in pdsOwner) {
    return getAgent(pdsOwner.loggedInUser)
  }
  try {
    const destination = await getPdsUrl(pdsOwner.didOrHandle);
    if (!destination) {
      return null;
    }
    const agent = new AtpBaseClient(destination);
    return agent;
  } catch (error) {
    return null;
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
  
  const rkey = pathname.split("/")[-1];
  const didOrHandle = pathname.split("/")[1];
  const agent = await getPdsAgent({ didOrHandle });
  const result = await agent?.app.bsky.feed.post.get({ repo: didOrHandle, rkey });
  if (!result) {
    throw new Error("Bluesky post not found!");
  }
  return result;
}

async function fetchLeaflet(uri: string, did: string) {
  const agent = await getPdsAgent({ didOrHandle: did });
  const { pathname } = new URL(uri);
  const rkey = pathname.split("/")[-1];
  const record = await agent?.com.atproto.repo.getRecord({
    rkey,
    collection: "pub.leaflet.document",
    repo: did,
  });
  return record?.data;
}

export async function importChapter(option: "bsky" | "leaflet", uri: string, did?: string) {
  let chapterContent: BskyPost | LeafletDoc;
  switch (option) {
    case "bsky":
      const { uri: bskyUri, cid } = await fetchBskyPost(uri);
      console.log("bsky post: " + JSON.stringify({bskyUri, cid}));
      chapterContent = {
        $type: "fan.fics.work.chapter#bskyPost",
        postRef: { uri: bskyUri, cid }
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
            rkey: data.rkey,
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

export async function createFanficWork(workRecord: atProtoWork, chapterRecord: atProtoChapter, rkey?: string) {
  const agent = await getPdsAgent({ didOrHandle: workRecord.author });
  const result = await agent?.com.atproto.repo.applyWrites({
    repo: workRecord.author,
    writes: [
      {
        $type: "com.atproto.repo.applyWrites#create",
        rkey,
        collection: "fics.fan.work",
        value: {
          record: workRecord,
        }
      },
      {
        $type: "com.atproto.repo.applyWrites#create",
        collection: "fan.fics.work.chapter",
        value: {
          record: {
            workUri: `at://${workRecord.author}/fan.fics.work/${rkey}`,
            ...chapterRecord
          }
        }
      }
    ]
  });
  return result?.data.results;
  // return await callSlices("work", "createRecord", { record: workRecord, rkey });
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