import type { LeafletRichTextFacet, LeafletRichTextFeature } from "atproto-ui";
import React from "preact/compat";

interface BskyPostFacet {
  $type?: "app.bsky.richtext.facet";
  features?: BskyPostFeature[];
  index: {
    byteEnd: number;
    byteStart: number;
    $type?: "app.bsky.richtext.facet#byteSlice";
  };
}

type BskyPostFeature = BskyPostLinkFeature | BskyPostTagFeature | BskyPostMentionFeature;

type BskyPostTagFeature = {
  $type: "app.bsky.richtext.facet#tag";
  tag?: string;
};

type BskyPostLinkFeature = {
  $type: "app.bsky.richtext.facet#link";
  uri?: string;
}

type BskyPostMentionFeature = {
  $type: "app.bsky.richtext.facet#mention";
  did?: string;
}

type Feature = LeafletRichTextFeature | BskyPostFeature;

interface Segment {
  text: string;
  features: Feature[];
}

export function createFacetedSegments(plaintext: string, facets?: LeafletRichTextFacet[] | BskyPostFacet[]): Segment[] {
  if (!facets?.length) {
    return [{ text: plaintext, features: [] }];
  }
  
  const prefix = buildBytePrefix(plaintext);
  const startEvents = new Map<number, Feature[]>();
  const endEvents = new Map<number, Feature[]>();
  const boundaries = new Set<number>([0, prefix.length - 1]);
  for (const facet of facets) {
    const { byteStart, byteEnd } = facet.index ?? {};
    if (typeof byteStart !== 'number' || typeof byteEnd !== 'number' || byteStart >= byteEnd) continue;
    const start = byteOffsetToCharIndex(prefix, byteStart);
    const end = byteOffsetToCharIndex(prefix, byteEnd);
    if (start >= end) continue;
    boundaries.add(start);
    boundaries.add(end);
    if (facet.features?.length) {
      startEvents.set(start, [...(startEvents.get(start) ?? []), ...facet.features]);
      endEvents.set(end, [...(endEvents.get(end) ?? []), ...facet.features]);
    }
  }
  const sortedBounds = [...boundaries].sort((a, b) => a - b);
  const segments: Segment[] = [];
  let active: Feature[] = [];
  for (let i = 0; i < sortedBounds.length - 1; i++) {
    const boundary = sortedBounds[i];
    const next = sortedBounds[i + 1];
    const endFeatures = endEvents.get(boundary);
    if (endFeatures?.length) {
      active = active.filter((feature) => !endFeatures.includes(feature));
    }
    const startFeatures = startEvents.get(boundary);
    if (startFeatures?.length) {
      active = [...active, ...startFeatures];
    }
    if (boundary === next) continue;
    const text = sliceByCharRange(plaintext, boundary, next);
    segments.push({ text, features: active.slice() });
  }
  return segments;
}

function buildBytePrefix(text: string): number[] {
  const encoder = new TextEncoder();
  const prefix: number[] = [0];
  let byteCount = 0;
  for (let i = 0; i < text.length;) {
    const codePoint = text.codePointAt(i)!;
    const char = String.fromCodePoint(codePoint);
    const encoded = encoder.encode(char);
    byteCount += encoded.length;
    prefix.push(byteCount);
    i += codePoint > 0xffff ? 2 : 1;
  }
  return prefix;
}

function byteOffsetToCharIndex(prefix: number[], byteOffset: number): number {
  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i] === byteOffset) return i;
    if (prefix[i] > byteOffset) return Math.max(0, i - 1);
  }
  return prefix.length - 1;
}

function sliceByCharRange(text: string, start: number, end: number): string {
  if (start <= 0 && end >= text.length) return text;
  let result = '';
  let charIndex = 0;
  for (let i = 0; i < text.length && charIndex < end;) {
    const codePoint = text.codePointAt(i)!;
    const char = String.fromCodePoint(codePoint);
    if (charIndex >= start && charIndex < end) result += char;
    i += codePoint > 0xffff ? 2 : 1;
    charIndex++;
  }
  return result;
}

export function renderSegment(segment: Segment): React.ReactNode {
  const parts = segment.text.split('\n');
  return parts.flatMap((part, idx) => {
    const key = `${segment.text}-${idx}-${part.length}`;
    const wrapped = applyFeatures(part.length ? part : '\u00a0', segment.features, key);
    if (idx === parts.length - 1) return wrapped;
    return [wrapped, <br key={`${key}-br`} />];
  });
}

export function applyFeatures(content: React.ReactNode, features: Feature[], key: string): React.ReactNode {
  if (!features?.length) return <React.Fragment key={key}>{content}</React.Fragment>;
  return (
    <React.Fragment key={key}>
      {features.reduce<React.ReactNode>((child, feature, idx) => wrapFeature(child, feature, `${key}-feature-${idx}`), content)}
    </React.Fragment>
  );
}

export function wrapFeature(child: React.ReactNode, feature: Feature, key: string): React.ReactNode {
  switch (feature.$type) {
    case 'app.bsky.richtext.facet#link':
    case 'pub.leaflet.richtext.facet#link':
      return <a key={key} href={feature.uri} target="_blank" rel="noopener noreferrer">{child}</a>;
    case 'pub.leaflet.richtext.facet#code':
      return <code key={key}>{child}</code>;
    case 'pub.leaflet.richtext.facet#highlight':
      return <mark key={key}>{child}</mark>;
    case 'pub.leaflet.richtext.facet#underline':
      return <span key={key} style={{ textDecoration: 'underline' }}>{child}</span>;
    case 'pub.leaflet.richtext.facet#strikethrough':
      return <span key={key} style={{ textDecoration: 'line-through' }}>{child}</span>;
    case 'pub.leaflet.richtext.facet#bold':
      return <strong key={key}>{child}</strong>;
    case 'pub.leaflet.richtext.facet#italic':
      return <em key={key}>{child}</em>;
    case 'pub.leaflet.richtext.facet#id':
      return <span key={key} id={feature.id}>{child}</span>;
    case "app.bsky.richtext.facet#mention":
      return <a key={key} href={`https://bsky.app/profile/${feature.did}`} target="_blank" rel="noopener noreferrer">{child}</a>
    case "app.bsky.richtext.facet#tag":
      return <a key={key} href={`https://bsky.app/hashtag/${feature.tag}`} target="_blank" rel="noopener noreferrer">{child}</a>
    default:
      return <span key={key}>{child}</span>;
  }
}