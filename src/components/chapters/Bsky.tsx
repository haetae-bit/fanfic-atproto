/** @jsxImportSource react */
import { AtProtoProvider, BlueskyPost, formatDidForLabel, parseAtUri, toBlueskyPostUrl, useDidResolution, type BlueskyPostRendererProps, type FeedPostRecord, type ParsedAtUri } from "atproto-ui";
import { createAutoEmbed } from "./utils/BskyEmbed";
import { createFacetedSegments } from "./utils/Facet";

type props = {
  did: string;
  rkey: string;
  embed?: boolean;
}

export function Bsky({ did, rkey, embed = false }: props) {
  // You can embed Bluesky posts inside other documents,
  // and there's no need to wrap it in another <AtProtoProvider> unless it's standalone
  return embed ? (
    <BlueskyPost
      did={did}
      rkey={rkey}
      // renderer={bskyRenderer}
    />
  ) : (
    <AtProtoProvider>
      <BlueskyPost
        did={did}
        rkey={rkey}
        // renderer={bskyRenderer}
      />
    </AtProtoProvider>
  )
}

function bskyRenderer({ record, error, loading, embed, authorDid, atUri }: BlueskyPostRendererProps) {
  const replyParentUri = record.reply?.parent?.uri;
  const replyTarget = replyParentUri ? parseAtUri(replyParentUri) : undefined;
  const { handle: parentHandle, loading: parentHandleLoading } = useDidResolution(replyTarget?.did);

  if (error) return <div style={{ padding: 8, color: 'crimson' }}>Failed to load post.</div>;
  if (loading && !record) return <div style={{ padding: 8 }}>Loading…</div>;

  const createdDate = new Date(record.createdAt);
  const created = createdDate.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const replyHref = replyTarget ? toBlueskyPostUrl(replyTarget) : undefined;
  const replyLabel = replyTarget ? formatReplyLabel(replyTarget, parentHandle, parentHandleLoading) : undefined;

  const resolvedEmbed = embed ?? createAutoEmbed(record, authorDid);
  const parsedSelf = atUri ? parseAtUri(atUri) : undefined;
  const postUrl = parsedSelf ? toBlueskyPostUrl(parsedSelf) : undefined;

  return (
    <article className="bsky" aria-busy={loading}>
      {replyHref && replyLabel && (
        <div>
          Replying to{' '}
          <a href={replyHref} target="_blank" rel="noopener noreferrer">
            {replyLabel}
          </a>
        </div>
      )}
      {postUrl && (
        <span>
          <a href={postUrl} target="_blank" rel="noopener noreferrer">
            View on Bluesky
          </a>
        </span>
      )}
      {record.text.split(/\n/g).map(text => <p>{text}</p>)}
      {record.facets && record.facets.length > 0 && (
        <>{createFacetedSegments(record.text, record.facets)}</>
      )}
      {resolvedEmbed && <>{resolvedEmbed}</>}
    </article>
  )
}

function formatReplyLabel(target: ParsedAtUri, resolvedHandle?: string, loading?: boolean): string {
  if (resolvedHandle) return `@${resolvedHandle}`;
  if (loading) return '…';
  return `@${formatDidForLabel(target.did)}`;
}
