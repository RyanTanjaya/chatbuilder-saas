// URL ingestion — fetch a web page and reduce it to clean readable text so it
// can flow through the same chunk → embed → store pipeline as an uploaded file.
//
// Safety notes:
// - Only http(s) URLs are allowed.
// - A lightweight allowlist-by-exclusion blocks obvious private/loopback hosts
//   to discourage SSRF. It is NOT a complete defense (DNS rebinding to a private
//   IP would slip through); a production deployment should resolve + check the
//   target IP. Adequate for this app's threat model.
// - Responses are capped in size and time so a hostile/huge page can't hang us.
import * as cheerio from 'cheerio';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB of HTML
const FETCH_TIMEOUT_MS = 12_000;

export interface ScrapedPage {
  title: string;
  text: string;
}

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    h === 'localhost' ||
    h.endsWith('.localhost') ||
    h.endsWith('.local') ||
    h.endsWith('.internal')
  ) {
    return true;
  }
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 0 || a === 127 || a === 10) return true; // this-host, loopback, private
    if (a === 169 && b === 254) return true; // link-local incl. 169.254.169.254 metadata
    if (a === 192 && b === 168) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
  }
  if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) {
    return true; // IPv6 loopback / unique-local / link-local
  }
  return false;
}

export function assertFetchableUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('That does not look like a valid URL.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs are supported.');
  }
  if (isBlockedHost(url.hostname)) {
    throw new Error('That host is not allowed.');
  }
  return url;
}

// Collapse whitespace the same way extract.ts does for files: drop control
// chars, normalise newlines, trim runs of blank lines. Keeps chunking stable.
function normalise(raw: string): string {
  return raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00\x01-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function scrapeUrl(raw: string): Promise<ScrapedPage> {
  const url = assertFetchableUrl(raw);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'ChatBuilder-Ingest/1.0 (+https://chatbuilder.app)',
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Could not reach that page (${detail}).`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new Error(`The page returned HTTP ${res.status}.`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!/text\/html|application\/xhtml|text\/plain/i.test(contentType)) {
    throw new Error('That URL is not an HTML page. Upload files for PDFs and docs.');
  }

  // Guard against huge bodies even when the server omits content-length.
  const declared = Number(res.headers.get('content-length') || 0);
  if (declared && declared > MAX_BYTES) {
    throw new Error('That page is too large to ingest (over 5 MB).');
  }
  const html = await res.text();
  if (html.length > MAX_BYTES) {
    throw new Error('That page is too large to ingest (over 5 MB).');
  }

  const $ = cheerio.load(html);
  $('script, style, noscript, template, svg, iframe, form, nav, header, footer, aside').remove();
  $('[aria-hidden="true"], [hidden]').remove();

  const title =
    $('title').first().text().trim() ||
    $('h1').first().text().trim() ||
    url.hostname;

  // Prefer the main content region when the page marks one up; fall back to body.
  const scope = $('main').length ? $('main') : $('article').length ? $('article') : $('body');
  const text = normalise(scope.text());

  return { title: title.slice(0, 200), text };
}
