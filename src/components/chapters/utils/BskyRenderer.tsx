/** @jsxImportSource react */
import { type BlueskyPostRendererProps, parseAtUri, useDidResolution, toBlueskyPostUrl, type ParsedAtUri, formatDidForLabel, useAtProtoRecord, type FeedPostRecord } from "atproto-ui";
import { useMemo } from "preact/hooks";
import { createAutoEmbed } from "./BskyEmbed";
import { createFacetedSegments, renderSegment } from "./Facet";

export default function BskyRenderer({ record, error, loading, embed, authorDid, atUri }: BlueskyPostRendererProps) {
  const replyParentUri = record.reply?.parent?.uri;
  const replyTarget = replyParentUri ? parseAtUri(replyParentUri) : undefined;
  const { handle: parentHandle, loading: parentHandleLoading } = useDidResolution(replyTarget?.did);

  if (error) return <div className="text-error p-2">Failed to load post.</div>;
  if (loading && !record) return <div className="loading loading-spinner loading-lg text-secondary mx-auto" />;

  const createdDate = new Date(record.createdAt);
  const created = createdDate.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const replyHref = replyTarget ? toBlueskyPostUrl(replyTarget) : undefined;
  const replyLabel = replyTarget ? formatReplyLabel(replyTarget, parentHandle, parentHandleLoading) : undefined;

  const text = record.text.split(/\n/g).filter((text) => text.trim() !== "");
  const segments = useMemo(() => createFacetedSegments(record.text, record.facets), [record.text, record.facets]);
  const resolvedEmbed = embed ?? createAutoEmbed(record, authorDid);
  const parsedSelf = atUri ? parseAtUri(atUri) : undefined;
  const postUrl = parsedSelf ? toBlueskyPostUrl(parsedSelf) : undefined;
  
  return (
    <article className="bsky" aria-busy={loading}>
      <header className="flex justify-end">
        <time dateTime={createdDate.toISOString()}>
          Originally posted on {created}
        </time>
      </header>
      
      {segments.length > 0 ? (
        <p>
          {segments.map((segment) => (
            <>{renderSegment(segment)}</>
          ))}
        </p>
      ) : text.map((text, idx) => <p key={idx}>{text}</p>)}
      
      {resolvedEmbed && <>{resolvedEmbed}</>}

      <footer className={(replyHref && replyLabel) ? "justify-between" : "justify-end"}>
        {replyHref && replyLabel && (
          <span>
            Replying to{' '}
            <a href={replyHref} target="_blank" rel="noopener noreferrer">
              {replyLabel}
            </a>
          </span>
        )}
        {postUrl && (
          <a href={postUrl} target="_blank" rel="noopener noreferrer">
            View on Bluesky
          </a>
        )}
      </footer>
    </article>
  )
}

function formatReplyLabel(target: ParsedAtUri, resolvedHandle?: string, loading?: boolean): string {
  if (resolvedHandle) return `@${resolvedHandle}`;
  if (loading) return '…';
  return `@${formatDidForLabel(target.did)}`;
}
