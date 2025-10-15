/** @jsxImportSource react */
import { type BlueskyPostRendererProps, parseAtUri, useDidResolution, toBlueskyPostUrl, type ParsedAtUri, formatDidForLabel, useAtProtoRecord, type FeedPostRecord, type BlueskyPostRendererInjectedProps, useBlueskyProfile, useBlob } from "atproto-ui";
import { useMemo } from "preact/hooks";
import clsx from "clsx";
import { createAutoEmbed } from "./BskyEmbed";
import { createFacetedSegments, renderSegment } from "./Facet";

type props = {
  quoted?: boolean;
} & BlueskyPostRendererInjectedProps;

export default function BskyRenderer({ record, authorHandle, error, loading, embed, authorDid, atUri, quoted }: props) {
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
  
  const { data: profile } = useBlueskyProfile(authorDid);
  const { url: avatarUrl, loading: avatarLoading, error: avatarError } = useBlob(authorDid, profile?.avatar);
  const authorName = profile?.displayName || `@${authorHandle}` || "…";
  const text = record.text.split(/\n/g).filter((text) => text.trim() !== "");
  const segments = useMemo(() => createFacetedSegments(record.text, record.facets), [record.text, record.facets]);
  const resolvedEmbed = embed ?? createAutoEmbed(record, authorDid);
  const parsedSelf = atUri ? parseAtUri(atUri) : undefined;
  const postUrl = parsedSelf ? toBlueskyPostUrl(parsedSelf) : undefined;
  
  return (
    <article className="bsky" aria-busy={loading}>
      <header className={clsx(["flex items-start mb-3", quoted ? "justify-between" : "justify-end"])}>
        {quoted && (
          <a className="author" href={`https://bsky.app/profile/${encodeURIComponent(authorDid)}`} target="_blank" rel="noopener noreferrer">
            <div className={clsx(["avatar", (avatarLoading || avatarError) && "avatar-placeholder"])}>
              <div className={clsx(["w-16 mask mask-squircle", avatarLoading ? "bg-neutral text-neutral-content" : avatarError && "bg-error text-error-content"])}>
                {avatarError ? <span>Er</span> : avatarLoading ? <span className="loading loading-spinner" /> : (
                  <img src={avatarUrl} alt={`${authorName}'s avatar`} />
                )}
              </div>
            </div>
            <div className="author-text">
              <span className="author-name">{profile?.displayName}</span>
              <span className="author-handle">@{authorHandle}</span>
            </div>
          </a>
        )}
        <time dateTime={createdDate.toISOString()} className={quoted ? "text-xs" : "text-sm"}>
          {quoted ? created : `Posted on ${created}`}
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
        {postUrl && quoted ? (
          <a href={postUrl} target="_blank" rel="noopener noreferrer">
            Quoted post on Bluesky
          </a>
        ) : (
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
