/** @jsxImportSource react */
import { BlueskyPost, useAtProtoRecord, type FeedPostRecord } from "atproto-ui";
import BskyRenderer from "./BskyRenderer";
import "./Bsky.css";

type props = {
  did: string;
  rkey: string;
}

export function Bsky({ did, rkey }: props) {
  const { record, error } = useAtProtoRecord<FeedPostRecord>({
    did,
    collection: "app.bsky.feed.post",
    rkey
  });

  if (error) return <p className="text-error p-4">Could not load post!</p>
  
  return (
    <BlueskyPost
      did={did}
      rkey={rkey}
      record={record}
      renderer={BskyRenderer}
      loadingIndicator={<div className="loading loading-spinner loading-lg mx-auto" />}
    />
  );
}
