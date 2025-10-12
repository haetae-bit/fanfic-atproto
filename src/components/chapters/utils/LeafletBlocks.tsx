import { BlueskyPost, formatDidForLabel, parseAtUri, useBlob, useDidResolution, type LeafletAlignmentValue, type LeafletBlock, type LeafletBlockquoteBlock, type LeafletBskyPostBlock, type LeafletCodeBlock, type LeafletHeaderBlock, type LeafletIFrameBlock, type LeafletImageBlock, type LeafletLinearDocumentBlock, type LeafletLinearDocumentPage, type LeafletListItem, type LeafletMathBlock, type LeafletRichTextFacet, type LeafletRichTextFeature, type LeafletTextBlock, type LeafletUnorderedListBlock, type LeafletWebsiteBlock } from "atproto-ui";
import React from "preact/compat";
import { useMemo, useRef } from "preact/hooks";
import { createFacetedSegments, renderSegment } from "./Facet";

export const LeafletRenderer: React.FC<{ page: LeafletLinearDocumentPage; documentDid: string; }> = ({ page, documentDid }) => {
  if (!page.blocks?.length) return null;
  return (
    <div>
      {page.blocks.map((blockWrapper, idx) => (
        <LeafletBlockRenderer
          key={`block-${idx}`}
          wrapper={blockWrapper}
          documentDid={documentDid}
          isFirst={idx === 0}
        />
      ))}
    </div>
  );
};

interface LeafletBlockRendererProps {
  wrapper: LeafletLinearDocumentBlock;
  documentDid: string;
  isFirst?: boolean;
}

const LeafletBlockRenderer: React.FC<LeafletBlockRendererProps> = ({ wrapper, documentDid, isFirst }) => {
  const block = wrapper.block;
  if (!block || !('$type' in block) || !block.$type) {
    return null;
  }
  const alignment = alignmentValue(wrapper.alignment);

  switch (block.$type) {
    case 'pub.leaflet.blocks.header':
      return <LeafletHeaderBlockView block={block} alignment={alignment} isFirst={isFirst} />;
    case 'pub.leaflet.blocks.blockquote':
      return <LeafletBlockquoteBlockView block={block} alignment={alignment} isFirst={isFirst} />;
    case 'pub.leaflet.blocks.image':
      return <LeafletImageBlockView block={block} alignment={alignment} documentDid={documentDid} />;
    case 'pub.leaflet.blocks.unorderedList':
      return <LeafletListBlockView block={block} alignment={alignment} documentDid={documentDid} />;
    case 'pub.leaflet.blocks.website':
      return <LeafletWebsiteBlockView block={block} alignment={alignment} documentDid={documentDid} />;
    case 'pub.leaflet.blocks.iframe':
      return <LeafletIframeBlockView block={block} alignment={alignment} />;
    case 'pub.leaflet.blocks.math':
      return <LeafletMathBlockView block={block} alignment={alignment} />;
    case 'pub.leaflet.blocks.code':
      return <LeafletCodeBlockView block={block} alignment={alignment} />;
    case 'pub.leaflet.blocks.horizontalRule':
      return <LeafletHorizontalRuleBlockView alignment={alignment} />;
    case 'pub.leaflet.blocks.bskyPost':
      return <LeafletBskyPostBlockView block={block} />;
    case 'pub.leaflet.blocks.text':
    default:
      return <LeafletTextBlockView block={block as LeafletTextBlock} alignment={alignment} isFirst={isFirst} />;
  }
};

const LeafletTextBlockView: React.FC<{ block: LeafletTextBlock; alignment?: React.CSSProperties['textAlign']; isFirst?: boolean }> = ({ block, alignment, isFirst }) => {
  const segments = useMemo(() => createFacetedSegments(block.plaintext, block.facets), [block.plaintext, block.facets]);
  const textContent = block.plaintext ?? '';
  if (!textContent.trim() && segments.length === 0) {
    return null;
  }
  const style: React.CSSProperties = {
    ...(alignment ? { textAlign: alignment } : undefined),
    ...(isFirst ? { marginTop: 0 } : undefined)
  };
  return (
    <p style={style}>
      {segments.map((segment, idx) => (
        <React.Fragment key={`text-${idx}`}>
          {renderSegment(segment)}
        </React.Fragment>
      ))}
    </p>
  );
};

const LeafletHeaderBlockView: React.FC<{ block: LeafletHeaderBlock; alignment?: React.CSSProperties['textAlign']; isFirst?: boolean }> = ({ block, alignment, isFirst }) => {
  const level = block.level && block.level >= 1 && block.level <= 6 ? block.level : 2;
  const segments = useMemo(() => createFacetedSegments(block.plaintext, block.facets), [block.plaintext, block.facets]);
  const normalizedLevel = Math.min(Math.max(level, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
  const headingTag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)[normalizedLevel - 1];
  const style: React.CSSProperties = {
    ...(alignment ? { textAlign: alignment } : undefined),
    ...(isFirst ? { marginTop: 0 } : undefined)
  };
  return React.createElement(
    headingTag,
    { style },
    segments.map((segment, idx) => (
      <React.Fragment key={`header-${idx}`}>
        {renderSegment(segment)}
      </React.Fragment>
    ))
  );
};

const LeafletBlockquoteBlockView: React.FC<{ block: LeafletBlockquoteBlock; alignment?: React.CSSProperties['textAlign']; isFirst?: boolean }> = ({ block, alignment, isFirst }) => {
  const segments = useMemo(() => createFacetedSegments(block.plaintext, block.facets), [block.plaintext, block.facets]);
  const textContent = block.plaintext ?? '';
  if (!textContent.trim() && segments.length === 0) {
    return null;
  }
  return (
    <blockquote style={{ ...(alignment ? { textAlign: alignment } : undefined), ...(isFirst ? { marginTop: 0 } : undefined) }}>
      {segments.map((segment, idx) => (
        <React.Fragment key={`quote-${idx}`}>
          {renderSegment(segment)}
        </React.Fragment>
      ))}
    </blockquote>
  );
};

const LeafletImageBlockView: React.FC<{ block: LeafletImageBlock; alignment?: React.CSSProperties['textAlign']; documentDid: string; }> = ({ block, alignment, documentDid }) => {
  const cid = block.image?.ref?.$link ?? block.image?.cid;
  const { url, loading, error } = useBlob(documentDid, cid);
  const aspectRatio = block.aspectRatio?.height && block.aspectRatio?.width
    ? `${block.aspectRatio.width} / ${block.aspectRatio.height}`
    : undefined;
  
  return (
    <figure style={{ ...(alignment ? { textAlign: alignment } : undefined) }}>
      <div style={{ ...(aspectRatio ? { aspectRatio } : {}) }}>
        {url && !error ? (
          <img src={url} alt={block.alt ?? ''} />
        ) : (
          <div>
            {loading ? 'Loading image…' : error ? 'Image unavailable' : 'No image'}
          </div>
        )}
      </div>
      {block.alt && block.alt.trim().length > 0 && (
        <figcaption>{block.alt}</figcaption>
      )}
    </figure>
  );
};

const LeafletListBlockView: React.FC<{ block: LeafletUnorderedListBlock; alignment?: React.CSSProperties['textAlign']; documentDid: string; }> = ({ block, alignment, documentDid }) => {
  return (
    <ul style={{ ...(alignment ? { textAlign: alignment } : undefined) }}>
      {block.children?.map((child, idx) => (
        <LeafletListItemRenderer
          key={`list-item-${idx}`}
          item={child}
          documentDid={documentDid}
          alignment={alignment}
        />
      ))}
    </ul>
  );
};

const LeafletListItemRenderer: React.FC<{ item: LeafletListItem; documentDid: string; alignment?: React.CSSProperties['textAlign'] }> = ({ item, documentDid, alignment }) => {
  return (
    <li style={{ ...(alignment ? { textAlign: alignment } : undefined) }}>
      <div>
        <LeafletInlineBlock block={item.content} documentDid={documentDid} alignment={alignment} />
      </div>
      {item.children && item.children.length > 0 && (
        <ul style={{ ...(alignment ? { textAlign: alignment } : undefined) }}>
          {item.children.map((child, idx) => (
            <LeafletListItemRenderer key={`nested-${idx}`} item={child} documentDid={documentDid} alignment={alignment} />
          ))}
        </ul>
      )}
    </li>
  );
};

const LeafletInlineBlock: React.FC<{ block: LeafletBlock; documentDid: string; alignment?: React.CSSProperties['textAlign'] }> = ({ block, documentDid, alignment }) => {
  switch (block.$type) {
    case 'pub.leaflet.blocks.header':
      return <LeafletHeaderBlockView block={block as LeafletHeaderBlock} alignment={alignment} />;
    case 'pub.leaflet.blocks.blockquote':
      return <LeafletBlockquoteBlockView block={block as LeafletBlockquoteBlock} alignment={alignment} />;
    case 'pub.leaflet.blocks.image':
      return <LeafletImageBlockView block={block as LeafletImageBlock} documentDid={documentDid} alignment={alignment} />;
    default:
      return <LeafletTextBlockView block={block as LeafletTextBlock} alignment={alignment} />;
  }
};

const LeafletWebsiteBlockView: React.FC<{ block: LeafletWebsiteBlock; alignment?: React.CSSProperties['textAlign']; documentDid: string }> = ({ block, alignment, documentDid }) => {
  const previewCid = block.previewImage?.ref?.$link ?? block.previewImage?.cid;
  const { url, loading, error } = useBlob(documentDid, previewCid);

  return (
    <a href={block.src} target="_blank" rel="noopener noreferrer" style={{ ...(alignment ? { textAlign: alignment } : undefined) }}>
      {url && !error ? (
        <img src={url} alt={block.title ?? 'Website preview'} />
      ) : (
        <div>
          {loading ? 'Loading preview…' : 'Open link'}
        </div>
      )}
      <div>
        {block.title && <strong>{block.title}</strong>}
        {block.description && <p>{block.description}</p>}
        <span>{block.src}</span>
      </div>
    </a>
  );
};

const LeafletIframeBlockView: React.FC<{ block: LeafletIFrameBlock; alignment?: React.CSSProperties['textAlign'] }> = ({ block, alignment }) => {
  return (
    <div style={{ ...(alignment ? { textAlign: alignment } : undefined) }}>
      <iframe
        src={block.url}
        title={block.url}
        style={{ ...(block.height ? { height: Math.min(Math.max(block.height, 120), 800) } : {}) }}
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
};

const LeafletMathBlockView: React.FC<{ block: LeafletMathBlock; alignment?: React.CSSProperties['textAlign'] }> = ({ block, alignment }) => {
  return (
    <pre style={{ ...(alignment ? { textAlign: alignment }: undefined) }}>{block.tex}</pre>
  );
};

const LeafletCodeBlockView: React.FC<{ block: LeafletCodeBlock; alignment?: React.CSSProperties['textAlign']; }> = ({ block, alignment }) => {
  const codeRef = useRef<HTMLElement | null>(null);
  const langClass = block.language ? `language-${block.language.toLowerCase()}` : undefined;
  return (
    <pre style={{ ...(alignment ? { textAlign: alignment } : undefined) }}>
      <code ref={codeRef} className={langClass}>{block.plaintext}</code>
    </pre>
  );
};

const LeafletHorizontalRuleBlockView: React.FC<{ alignment?: React.CSSProperties['textAlign']; }> = ({ alignment }) => {
  return <hr style={{ marginLeft: alignment ? 'auto' : undefined, marginRight: alignment ? 'auto' : undefined }} />;
};

const LeafletBskyPostBlockView: React.FC<{ block: LeafletBskyPostBlock }> = ({ block }) => {
  const parsed = parseAtUri(block.postRef?.uri);
  if (!parsed) {
    return <div>Referenced post unavailable.</div>;
  }
  return <BlueskyPost did={parsed.did} rkey={parsed.rkey} iconPlacement="linkInline" />;
};

function alignmentValue(value?: LeafletAlignmentValue): React.CSSProperties['textAlign'] | undefined {
  if (!value) return undefined;
  let normalized = value.startsWith('#') ? value.slice(1) : value;
  if (normalized.includes('#')) {
    normalized = normalized.split('#').pop() ?? normalized;
  }
  if (normalized.startsWith('lex:')) {
    normalized = normalized.split(':').pop() ?? normalized;
  }
  switch (normalized) {
    case 'textAlignLeft':
      return 'left';
    case 'textAlignCenter':
      return 'center';
    case 'textAlignRight':
      return 'right';
    case 'textAlignJustify':
      return 'justify';
    default:
      return undefined;
  }
}

function useAuthorLabel(author: string | undefined, authorDid: string | undefined): string | undefined {
  const { handle } = useDidResolution(authorDid);
  if (!author) return undefined;
  if (handle) return `@${handle}`;
  if (authorDid) return formatDidForLabel(authorDid);
  return author;
}

