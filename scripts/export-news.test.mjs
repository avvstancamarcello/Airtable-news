import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { exportRecords, fetchRecords, FIELDS, publishNews } from './export-news.mjs';

const record = (fields = {}) => ({
  fields: {
    news_id: 'example', lang: 'it', title: 'Titolo è valido',
    published_at: '2026-10-09T19:30:00Z', status: 'published', ...fields,
  },
});
const options = { token: 'test-placeholder', baseId: 'appExample' };
const response = (records, extra = {}) => ({ ok: true, json: async () => ({ records, ...extra }) });

test('exports only expected fields and exact published status, preserving multilingual text', () => {
  const rows = JSON.parse(exportRecords([
    record({ secret_field: 'not public', summary: 'Testo, con virgole' }),
    record({ status: 'draft', title: null }),
    record({ status: 'archived' }),
    record({ status: 'Published' }),
  ]));
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]), FIELDS);
  assert.equal(rows[0].status, 'published');
  assert.equal(rows[0].title, 'Titolo è valido');
  assert.equal(rows[0].summary, 'Testo, con virgole');
  assert.equal(rows[0].source_url, '');
});

test('deterministic order and duplicate translation detection', () => {
  const records = [record(), record({ lang: 'en' }), record({ news_id: 'another' })];
  assert.equal(exportRecords(records), exportRecords([...records].reverse()));
  assert.throws(() => exportRecords([record(), record()]), /duplicate/);
});

test('exports all 13 allowed language codes unchanged in deterministic order', () => {
  const languages = ['it', 'en', 'me', 'ar', 'hi', 'sq', 'ro', 'et', 'lt', 'bs', 'nl', 'sv', 'el'];
  const records = languages.map((lang) => record({ lang }));
  const content = exportRecords(records);
  assert.deepEqual(JSON.parse(content).map((row) => row.lang), [...languages].sort());
  assert.equal(content, exportRecords([...records].reverse()));
});

test('rejects unsupported published languages, aliases, casing and whitespace with safe diagnostics', () => {
  for (const lang of [
    'fr', 'de', 'es', 'pt', 'xx', 'cnr', 'sr', 'eng',
    'IT', 'EN', 'ME', 'It', ' it', 'it ', '\ten', 'me\n', '', '  ', '\t\n',
    options.token,
  ]) {
    assert.throws(() => exportRecords([record(), record({ lang })]), (error) => {
      assert.match(error.message, /^Record 1: lang /);
      assert.equal(error.message.includes(options.token), false);
      return true;
    });
  }
});

test('skips drafts with unsupported or malformed languages before validation', () => {
  const drafts = ['fr', 'de', 'es', 'pt', 'cnr', 'IT', ' it ', '', '  ', null, 123, undefined]
    .map((lang) => record({ status: 'draft', lang }));
  assert.equal(exportRecords([record(), ...drafts]), exportRecords([record()]));
  assert.equal(exportRecords(drafts), '[]\n');
});

test('CLI reports safe language diagnostics but hides unexpected error details', () => {
  const exporter = fileURLToPath(new URL('./export-news.mjs', import.meta.url));
  for (const lang of ['fr', '', '  ', options.token, null]) {
    const mock = lang === null
      ? `throw new Error(${JSON.stringify(options.token)})`
      : `return { ok: true, json: async () => ({ records: ${JSON.stringify([record({ lang })])} }) }`;
    const result = spawnSync(process.execPath, ['--input-type=module', '--eval', `
      globalThis.fetch = async () => { ${mock} };
      process.argv[1] = ${JSON.stringify(exporter)};
      await import(${JSON.stringify(new URL('./export-news.mjs', import.meta.url).href)});
    `], {
      encoding: 'utf8',
      env: { ...process.env, AIRTABLE_PAT: options.token, AIRTABLE_BASE_ID: options.baseId },
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /News export failed; published file preserved/);
    assert.equal(result.stderr.includes(options.token), false);
    if (lang !== null) assert.match(result.stderr, /Record 0: lang /);
    else assert.doesNotMatch(result.stderr, /Record 0:/);
  }
});

test('rejects every invalid published record instead of dropping it', () => {
  for (const field of ['news_id', 'lang', 'title', 'published_at']) {
    for (const value of ['', '  ', null, 123, undefined]) {
      assert.throws(() => exportRecords([record(), record({ [field]: value, lang: field === 'lang' ? value : 'en' })]));
    }
  }
  for (const field of ['summary', 'body_text', 'source_url', 'theme']) {
    assert.throws(() => exportRecords([record({ [field]: 42 })]), /string/);
  }
  assert.throws(() => exportRecords({}), /array/);
  for (const malformed of [null, {}, { fields: [] }]) {
    assert.throws(() => exportRecords([malformed]), /fields/);
  }
});

test('validates ISO-like dates, calendar dates and timezones', () => {
  for (const published_at of ['2026-10-09', '2024-02-29T19:30:00.123Z', '2026-10-09T19:30+02:00', '0000-02-29']) {
    assert.doesNotThrow(() => exportRecords([record({ published_at })]));
  }
  for (const published_at of [
    'yesterday', '10/09/2026', '2026-02-29', '2026-04-31', '2026-13-01',
    '2026-10-09T24:00:00Z', '2026-10-09T19:30:00', '2026-10-09T19:60:00Z',
    '2026-10-09T19:30:00+25:00',
  ]) {
    assert.throws(() => exportRecords([record({ published_at })]), /ISO/);
  }
});

test('allows optional HTTP(S) sources, rejecting unsafe or malformed URLs', () => {
  for (const source_url of ['', 'http://example.com/news', 'https://example.com/news?q=1']) {
    assert.doesNotThrow(() => exportRecords([record({ source_url })]));
  }
  for (const source_url of ['javascript:alert(1)', 'ftp://example.com', 'https://', '/news', 'https://' + 'user:pass@example.com']) {
    assert.throws(() => exportRecords([record({ source_url })]), /HTTP/);
  }
});

test('fetches all pages and requests only expected fields', async () => {
  const urls = [];
  const records = await fetchRecords({
    ...options,
    fetchImpl: async (url, init) => {
      urls.push(url);
      assert.deepEqual(url.searchParams.getAll('fields[]'), FIELDS);
      assert.equal(init.headers.Authorization, 'Bearer ' + options.token);
      assert.equal(init.redirect, 'error');
      return urls.length === 1
        ? response([record()], { offset: 'next' })
        : response([record({ lang: 'en' })]);
    },
  });
  assert.equal(records.length, 2);
  assert.equal(urls[0].pathname, '/v0/appExample/NEWS_SIMPLE');
  assert.equal(urls[1].searchParams.get('offset'), 'next');
});

test('rejects API, configuration, response and pagination failures', async () => {
  await assert.rejects(fetchRecords({ ...options, token: '' }), /PAT/);
  await assert.rejects(fetchRecords({ ...options, baseId: '../other' }), /base ID/);
  await assert.rejects(fetchRecords({ ...options, fetchImpl: async () => ({ ok: false, status: 401 }) }), /HTTP 401/);
  await assert.rejects(fetchRecords({ ...options, fetchImpl: async () => ({ ok: true, json: async () => ({}) }) }), /response/);
  for (const offset of ['same', '', 42, null]) {
    await assert.rejects(fetchRecords({
      ...options, fetchImpl: async () => response([], { offset }),
    }), /offset/);
  }
});

test('atomic publishing preserves the previous feed on any export failure', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'airtable-news-test-'));
  const outputPath = join(directory, 'news.json');
  const previous = '[{"previous":"valid feed"}]\n';
  try {
    await writeFile(outputPath, previous);
    for (const fetchImpl of [
      async () => { throw new Error('network failure'); },
      async () => ({ ok: false, status: 429 }),
      async () => ({ ok: true, json: async () => { throw new Error('bad JSON'); } }),
      async () => response([record({ published_at: 'invalid' })]),
      async (url) => url.searchParams.has('offset')
        ? { ok: false, status: 500 }
        : response([record()], { offset: 'next' }),
    ]) {
      await assert.rejects(publishNews({ ...options, outputPath, fetchImpl }));
      assert.equal(await readFile(outputPath, 'utf8'), previous);
    }
    const valid = { ...options, outputPath, fetchImpl: async () => response([record()]) };
    assert.equal(await publishNews(valid), true);
    assert.equal(await readFile(outputPath, 'utf8'), exportRecords([record()]));
    assert.equal(await publishNews(valid), false);
    assert.equal(await publishNews({ ...valid, fetchImpl: async () => response([record({ status: 'draft' })]) }), true);
    assert.equal(await readFile(outputPath, 'utf8'), '[]\n');
    await rm(outputPath);
    assert.equal(await publishNews(valid), true);
    assert.deepEqual(await readdir(directory), ['news.json']);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('invalid published languages on a later page preserve the existing feed without temporary files', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'airtable-news-test-'));
  const outputPath = join(directory, 'news.json');
  const previous = exportRecords([record()]);
  try {
    await writeFile(outputPath, previous);
    for (const lang of ['fr', 'de', 'es', 'pt', 'cnr', 'ME', ' me ', '', '  ']) {
      await assert.rejects(publishNews({
        ...options,
        outputPath,
        fetchImpl: async (url) => url.searchParams.has('offset')
          ? response([record({ lang })])
          : response([record()], { offset: 'next' }),
      }), /^Error: Record 1: lang /);
      assert.equal(await readFile(outputPath, 'utf8'), previous);
      assert.deepEqual(await readdir(directory), ['news.json']);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
