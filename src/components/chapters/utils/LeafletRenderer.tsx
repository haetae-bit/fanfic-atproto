/** @jsxImportSource react */
import { parseAtUri, type LeafletDocumentRendererProps } from "atproto-ui";
import { LeafletPageRenderer } from "./LeafletBlocks";

export function LeafletRenderer({ record, publicationBaseUrl, error, loading, canonicalUrl, did }: LeafletDocumentRendererProps) {
  const publishedAt = record.publishedAt && new Date(record.publishedAt);
  const published = publishedAt && publishedAt.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <article className="leaflet">
      <header>
        <h1>{record.title}</h1>
        {published && (
          <time dateTime={publishedAt.toISOString()}>Originally posted on {published}</time>
        )}
      </header>
      {record.pages.map(page => (
        <>
          {LeafletPageRenderer({ page, documentDid: did })}
        </>
      ))}
      <footer>
        <a className="not-prose link-secondary" href={canonicalUrl} target="_blank" rel="noopener noreferrer">View on Leaflet.pub</a>
      </footer>
    </article>
  )
}