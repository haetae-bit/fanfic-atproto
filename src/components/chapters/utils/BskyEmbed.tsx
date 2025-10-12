import { useBlob, type FeedPostRecord } from "atproto-ui";

export function createAutoEmbed(record: FeedPostRecord, authorDid: string | undefined) {
  const embed = record.embed as { $type?: string } | undefined;
  if (!embed) return null;
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
  const columns = embed.images.length > 1 ? 'repeat(auto-fit, minmax(160px, 1fr))' : '1fr';
  return (
    <div style={{ gridTemplateColumns: columns }}>
      {embed.images.map((image, idx) => (
        <PostImage key={idx} image={image} did={did} />
      ))}
    </div>
  );
};

interface PostImageProps {
  image: ImagesEmbedType['images'][number];
  did?: string;
}

function PostImage({ image, did }: PostImageProps) {
  const cid = image.image?.ref?.$link ?? image.image?.cid;
  const { url, loading, error } = useBlob(did, cid);
  const alt = image.alt?.trim() || 'Bluesky attachment';
  const aspect = image.aspectRatio && image.aspectRatio.height > 0
    ? `${image.aspectRatio.width} / ${image.aspectRatio.height}`
    : undefined;

  return (
    <figure aria-busy={loading}>
      <div style={{ aspectRatio: aspect }}>
        {url ? (
          <img src={url} alt={alt} />
        ) : (
          <div>
            {loading ? 'Loading image…' : error ? 'Image failed to load' : 'Image unavailable'}
          </div>
        )}
      </div>
      {image.alt && image.alt.trim().length > 0 && (
        <figcaption>{image.alt}</figcaption>
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
    <figure aria-busy={loading}>
      <div className="max-w-full">
        <a href={embed.external.uri} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">{embed.external.title}</span>
        </a>
        {url ? (
          <img src={url} alt={embed.external.description} />
        ) : (
          <div className={error ? "text-error" : "text-neutral"}>
            {loading ? 'Loading image…' : error ? 'Image failed to load' : 'Image unavailable'}
          </div>
        )}
      </div>
      {embed.external.description && embed.external.description.trim().length > 0 && (
        <figcaption className="font-style-italic">{embed.external.description}</figcaption>
      )}
    </figure>
  );
}