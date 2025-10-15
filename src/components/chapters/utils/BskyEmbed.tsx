import { parseAtUri, useAtProtoRecord, useBlob, useDidResolution, type FeedPostRecord } from "atproto-ui";
import { autoPlacement, autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom";
import clsx from "clsx";
import { Bsky } from "./Bsky";
import { useMemo } from "preact/compat";
import BskyRenderer from "./BskyRenderer";

export function createAutoEmbed(record: FeedPostRecord, authorDid: string | undefined) {
  const embed = record.embed as { $type?: string } | undefined;
  if (!embed) return null;
  if (embed.$type === 'app.bsky.embed.record') {
    // this is re-rendering another bsky post
    return useMemo(() => {
      return <QuoteEmbed embed={embed as QuoteEmbedType} />;
    }, [embed]);
  }
  if (embed.$type === 'app.bsky.embed.external') {
    return <ExternalEmbed embed={embed as ExternalEmbedType} did={authorDid} />;
  }
  if (embed.$type === 'app.bsky.embed.images') {
    return <ImagesEmbed embed={embed as ImagesEmbedType} did={authorDid} />;
  }
  if (embed.$type === 'app.bsky.embed.recordWithMedia') {
    const media = (embed as RecordWithMediaEmbed).media;
    if (media?.$type === 'app.bsky.embed.images') {
      return <ImagesEmbed embed={media as ImagesEmbedType} did={authorDid} />;
    }
  }
  return null;
}

type ImagesEmbedType = {
  $type: 'app.bsky.embed.images';
  images: Array<{
    alt?: string;
    mime?: string;
    size?: number;
    image?: {
      $type?: string;
      ref?: { $link?: string };
      cid?: string;
    };
    aspectRatio?: {
      width: number;
      height: number;
    };
  }>;
};

type RecordWithMediaEmbed = {
  $type: 'app.bsky.embed.recordWithMedia';
  record?: unknown;
  media?: { $type?: string };
};

interface ImagesEmbedProps {
  embed: ImagesEmbedType;
  did?: string;
}

function ImagesEmbed({ embed, did }: ImagesEmbedProps) {
  if (!embed.images || embed.images.length === 0) return null;
  const columns = embed.images.length > 1 ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr';
  
  return (
    <div className="images" style={{ gridTemplateColumns: columns }}>
      {embed.images.map((image, idx) => (
        <PostImage key={idx} id={idx} image={image} did={did} />
      ))}
    </div>
  );
};

interface PostImageProps {
  id?: number;
  image: ImagesEmbedType['images'][number];
  did?: string;
}

function PostImage({ id, image, did }: PostImageProps) {
  const cid = image.image?.ref?.$link ?? image.image?.cid;
  const { url, loading, error } = useBlob(did, cid);
  const alt = image.alt?.trim() || 'Bluesky attachment';
  const aspect = image.aspectRatio && image.aspectRatio.height > 0
    ? `${image.aspectRatio.width} / ${image.aspectRatio.height}`
    : undefined;
  const { refs, floatingStyles } = useFloating({
    middleware: [
      autoPlacement({
        allowedPlacements: ["top", "bottom"]
      }),
      shift(),
      offset(10),
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <figure className="embed" aria-busy={loading}>
      <div className="max-w-full" style={{ aspectRatio: aspect }}>
        {url ? (
          <img className="rounded-box" src={url} alt={alt} />
        ) : (
          <div className={clsx([error ? "text-error" : "text-neutral", loading && "loading loading-spinner mx-auto"])}>
            {error ? 'Image failed to load' : 'Image unavailable'}
          </div>
        )}
      </div>
      {image.alt && image.alt.trim().length > 0 && (
        <figcaption>
          <span className="line-clamp-1">
            {image.alt}
          </span>
          <button className="trigger" ref={refs.setReference} style={{ anchorName: `--anchor-${id}` }} popoverTarget={`popover-${id}`}>
            <div className="i-lc-info" aria-label="Click to read more image description" />
          </button>
          <div className="popover" ref={refs.setFloating} popover="auto" id={`popover-${id}`} style={{ positionAnchor: `--anchor-${id}`, ...floatingStyles }} aria-hidden>
            {image.alt}
          </div>
        </figcaption>
      )}
    </figure>
  );
};

type ExternalEmbedType = {
  $type: "app.bsky.embed.external";
  external: {
    description?: string;
    thumb?: {
      $type?: string;
      mimeType?: string;
      ref?: { $link?: string; };
      size?: number;
    };
    title?: string;
    uri?: string;
  };
}

interface ExternalEmbedProps {
  embed: ExternalEmbedType;
  did?: string;
}

function ExternalEmbed({ embed, did }: ExternalEmbedProps) {
  const cid = embed.external.thumb?.ref?.$link;
  const image = useBlob(did, cid);
  const { url, loading, error } = image;
  
  return (
    <figure className="embed" aria-busy={loading}>
      <div className="max-w-full">
        {url ? (
          <a href={embed.external.uri} target="_blank" rel="noopener noreferrer" aria-label={embed.external.title}>
            <img className="rounded-box" src={url} alt={embed.external.description} />
          </a>
        ) : (
          <div className={clsx([error ? "text-error" : "text-neutral", loading && "loading loading-spinner mx-auto"])}>
            {error ? 'Image failed to load' : 'Image unavailable'}
          </div>
        )}
      </div>
      {embed.external.description && embed.external.description.trim().length > 0 && (
        <figcaption>{embed.external.description}</figcaption>
      )}
    </figure>
  );
}

type QuoteEmbedType = {
  $type: 'app.bsky.embed.record';
  record: {
    cid: string;
    uri: string;
  };
}

interface QuoteEmbedProps {
  embed: QuoteEmbedType;
}

function QuoteEmbed({ embed }: QuoteEmbedProps) {
  const { uri } = embed.record;
  const parsed = parseAtUri(uri);
  if (!parsed) {
    return <div>Referenced post unavailable.</div>;
  }
  const { record } = useAtProtoRecord<FeedPostRecord>({
    did: parsed.did,
    collection: "app.bsky.feed.post",
    rkey: parsed.rkey
  });
  const { handle, did } = useDidResolution(parsed.did);
  
  return (
    <figure className="embed mx-5">
      <Bsky
        did={parsed.did}
        rkey={parsed.rkey}
        record={record}
        renderer={({ record, loading, embed, error }) => 
          BskyRenderer({ 
            record, 
            loading, 
            embed, 
            error, 
            authorHandle: handle ?? "", 
            authorDid: did ?? "", 
            atUri: uri, 
            quoted: true
          })
        }
      />
    </figure>
  );
}