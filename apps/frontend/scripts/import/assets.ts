import { createHash } from 'node:crypto';
import { statSync } from 'node:fs';
import path from 'node:path';
import type { HTMLElement } from 'node-html-parser';
import type { AssetRef, SourceRef } from '../../src/types/content.ts';
import { decodeEscapes } from '../../src/lib/content/brand.ts';
import { processText, type Stats } from './html.ts';

const ERAS_HOST = /(^|\.)erasvietnam\.(vn|com)$/i;

/**
 * Media src -> AssetRef src + status. Mirror-relative and Eras-host paths become `/path`
 * (local when the file exists in the mirror, else missing); any other host keeps its URL (missing).
 */
export function classifyAsset(
  raw: string,
  file: string,
  erasDir: string,
): { src: string; status: 'local' | 'missing' } | null {
  const value = decodeEscapes(raw).trim();
  let url: URL;
  try {
    url = new URL(value, `https://erasvietnam.vn/${file}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!ERAS_HOST.test(url.hostname)) return { src: value, status: 'missing' };
  let local = false;
  try {
    local = statSync(path.join(erasDir, decodeURIComponent(url.pathname))).isFile();
  } catch {
    // missing file or malformed %-escape: no local file
  }
  return { src: url.pathname, status: local ? 'local' : 'missing' };
}

const dimension = (value: string | undefined) =>
  value && /^\d+$/.test(value) ? Number(value) : undefined;

/** Shared AssetRef registry: ids are `asset-{sha1(src)[0..10]}`, kept in first-seen order. */
export function createAssetRegistry(erasDir: string, stats: Stats) {
  const assets = new Map<string, AssetRef>();

  const add = (
    raw: string | undefined,
    meta: { alt?: string; width?: string; height?: string; kind: AssetRef['kind'] },
    source: SourceRef,
  ): { src: string; id: string } | null => {
    const found = raw ? classifyAsset(raw, source.file, erasDir) : null;
    if (!found) {
      console.log(`asset dropped ${source.file}:${source.line} ${raw ?? '(no src)'}`);
      return null;
    }
    const id = `asset-${createHash('sha1').update(found.src).digest('hex').slice(0, 10)}`;
    let asset = assets.get(id);
    if (asset && asset.src !== found.src) throw new Error(`Asset id collision: ${id}`);
    if (!asset) {
      asset = { id, src: found.src, alt: '', kind: meta.kind, status: found.status, sources: [] };
      assets.set(id, asset);
    }
    // First non-empty value wins, so the output does not depend on which page mentioned it last.
    if (!asset.alt && meta.alt) asset.alt = processText(meta.alt, stats).trim();
    asset.width ??= dimension(meta.width);
    asset.height ??= dimension(meta.height);
    if (!asset.sources.some((s) => s.file === source.file && s.line === source.line))
      asset.sources.push(source);
    return { src: asset.src, id };
  };

  const image = (el: HTMLElement | null, file: string, lineOf: (o: number) => number) =>
    el
      ? add(
          el.getAttribute('src'),
          {
            alt: el.getAttribute('alt'),
            width: el.getAttribute('width'),
            height: el.getAttribute('height'),
            kind: 'image',
          },
          { file, line: lineOf(el.range[0]) },
        )?.id
      : undefined;

  return { add, image, list: () => [...assets.values()] };
}

export type AssetRegistry = ReturnType<typeof createAssetRegistry>;
