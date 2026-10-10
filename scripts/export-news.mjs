import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const FIELDS = [
  'news_id', 'lang', 'title', 'summary', 'body_text', 'source_url',
  'theme', 'published_at', 'status',
];
const REQUIRED = new Set(['news_id', 'lang', 'title', 'published_at', 'status']);
const ALLOWED_LANGUAGES = new Set(['it', 'en', 'me', 'ar', 'hi', 'sq', 'ro', 'et', 'lt', 'bs', 'nl', 'sv', 'el']);

class RecordValidationError extends Error {}

function validDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2}))?$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [, year, month, day, hour, minute, second, zone] = match;
  const leap = Number(year) % 4 === 0 && (Number(year) % 100 !== 0 || Number(year) % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][Number(month) - 1];
  return Number(month) >= 1 && Number(month) <= 12
    && Number(day) >= 1 && Number(day) <= days
    && (hour === undefined || (Number(hour) < 24 && Number(minute) < 60
      && (second === undefined || Number(second) < 60)
      && (zone === 'Z' || (Number(zone.slice(1, 3)) < 24 && Number(zone.slice(4)) < 60))));
}

export function exportRecords(records) {
  if (!Array.isArray(records)) throw new Error('Airtable records must be an array');
  const seen = new Set();
  const rows = [];
  for (const [index, record] of records.entries()) {
    const fields = record?.fields;
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
      throw new Error(`Record ${index}: invalid fields object`);
    }
    if (fields.status !== 'published') continue;
    const row = {};
    for (const field of FIELDS) {
      const value = fields[field] === undefined ? '' : fields[field];
      if (typeof value !== 'string' || (REQUIRED.has(field) && !value.trim())) {
        throw new RecordValidationError(`Record ${index}: ${field} must be a${REQUIRED.has(field) ? ' non-empty' : ''} string`);
      }
      row[field] = value;
    }
    if (!ALLOWED_LANGUAGES.has(row.lang)) {
      throw new RecordValidationError(`Record ${index}: lang must be exactly one of ${[...ALLOWED_LANGUAGES].join(', ')}`);
    }
    if (!validDate(row.published_at)) {
      throw new Error(`Record ${index}: published_at must be an ISO date or timestamp with timezone`);
    }
    if (row.source_url) {
      let url;
      try {
        url = new URL(row.source_url);
      } catch {
        throw new Error(`Record ${index}: source_url must be an HTTP(S) URL`);
      }
      if (!/^https?:\/\//i.test(row.source_url) || !['http:', 'https:'].includes(url.protocol)
        || !url.hostname || url.username || url.password) {
        throw new Error(`Record ${index}: source_url must be an HTTP(S) URL without credentials`);
      }
    }
    const key = JSON.stringify([row.news_id, row.lang]);
    if (seen.has(key)) throw new Error(`Record ${index}: duplicate news_id/lang`);
    seen.add(key);
    rows.push(row);
  }
  const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  rows.sort((a, b) => compare(a.news_id, b.news_id) || compare(a.lang, b.lang));
  return `${JSON.stringify(rows, null, 2)}\n`;
}

export async function fetchRecords({ token, baseId, table = 'NEWS_SIMPLE', fetchImpl = fetch }) {
  if (typeof token !== 'string' || !token.trim()) throw new Error('AIRTABLE_PAT is required');
  if (typeof baseId !== 'string' || !/^app[a-zA-Z0-9]+$/.test(baseId)) {
    throw new Error('AIRTABLE_BASE_ID must be an Airtable base ID');
  }
  if (typeof table !== 'string' || !table.trim()) throw new Error('AIRTABLE_TABLE is required');
  const records = [];
  const offsets = new Set();
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
    url.searchParams.set('pageSize', '100');
    for (const field of FIELDS) url.searchParams.append('fields[]', field);
    if (offset) url.searchParams.set('offset', offset);
    const response = await fetchImpl(url, {
      headers: { Authorization: 'Bearer ' + token },
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`Airtable request failed (HTTP ${response.status})`);
    const page = await response.json();
    if (!page || !Array.isArray(page.records)) throw new Error('Invalid Airtable response');
    records.push(...page.records);
    offset = page.offset;
    if (offset !== undefined) {
      if (typeof offset !== 'string' || !offset || offsets.has(offset)) {
        throw new Error('Invalid or repeated Airtable pagination offset');
      }
      offsets.add(offset);
    }
  } while (offset !== undefined);
  return records;
}

export async function publishNews({ outputPath, ...options }) {
  const content = exportRecords(await fetchRecords(options));
  try {
    if (await readFile(outputPath, 'utf8') === content) return false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const temporary = await mkdtemp(join(dirname(outputPath), '.news-export-'));
  try {
    const file = join(temporary, 'news.json');
    await writeFile(file, content, { encoding: 'utf8', mode: 0o644 });
    await rename(file, outputPath);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const changed = await publishNews({
      token: process.env.AIRTABLE_PAT,
      baseId: process.env.AIRTABLE_BASE_ID,
      table: process.env.AIRTABLE_TABLE || 'NEWS_SIMPLE',
      outputPath: resolve(process.argv[2] || 'news.json'),
    });
    console.log(changed ? 'Validated news.json updated.' : 'news.json unchanged.');
  } catch (error) {
    if (error instanceof RecordValidationError) console.error(error.message);
    console.error('News export failed; published file preserved. Check Airtable access and record validation.');
    process.exitCode = 1;
  }
}
