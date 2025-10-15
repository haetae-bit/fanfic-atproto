/** @jsxImportSource react */
import { BlueskyPost, useAtProtoRecord, type BlueskyPostProps, type FeedPostRecord } from "atproto-ui";
import BskyRenderer from "./BskyRenderer";
import "./Bsky.css";

export function Bsky({ did, rkey, record, renderer, loadingIndicator, fallback }: BlueskyPostProps) {
  const { record: foundRecord, error } = useAtProtoRecord<FeedPostRecord>({
    did,
    collection: "app.bsky.feed.post",
    rkey
  });

  if (error) return <p className="text-error p-4">Could not load post!</p>
  
  return (
    <BlueskyPost
      did={did}
      rkey={rkey}
      record={record ?? foundRecord}
      renderer={renderer ?? BskyRenderer}
      fallback={fallback}
      loadingIndicator={loadingIndicator ?? <div className="loading loading-spinner loading-lg mx-auto" />}
    />
  );
}
