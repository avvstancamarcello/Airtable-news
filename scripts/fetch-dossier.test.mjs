import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fetchDossier, publishDossier } from './fetch-dossier.mjs';

const config = {
  token: 'test-token',
  baseId: 'app123abc',
  tableId: 'tbl456def',
};

test('fetches all pages with the public-record formula', async () => {
  const requests = [];
  const pages = [
    { records: [{ id: 'rec1', fields: { title: 'First' } }], offset: 'next-page' },
    { records: [{ id: 'rec2', fields: { title: 'Second' } }] },
  ];
  const records = await fetchDossier({
    ...config,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => pages[requests.length - 1] };
    },
  });

  assert.deepEqual(records, pages.flatMap((page) => page.records));
  assert.equal(requests.length, 2);
  for (const { url, options } of requests) {
    assert.equal(url.searchParams.get('filterByFormula'), '{Pubblica sul web}=1');
    assert.equal(url.searchParams.get('pageSize'), '100');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
  }
  assert.equal(requests[1].url.searchParams.get('offset'), 'next-page');
});

test('writes the paginated JSON output and leaves unchanged files untouched', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'dossier-export-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const outputPath = join(directory, 'data', 'dossier.json');
  const records = [{ id: 'rec1', fields: { title: 'Public' } }];
  const options = {
    ...config,
    outputPath,
    fetchImpl: async () => ({ ok: true, json: async () => ({ records }) }),
  };

  assert.equal(await publishDossier(options), true);
  assert.equal(await readFile(outputPath, 'utf8'), `${JSON.stringify(records, null, 2)}\n`);
  assert.equal(await publishDossier(options), false);
});

test('rejects repeated pagination offsets', async () => {
  await assert.rejects(
    fetchDossier({
      ...config,
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({ records: [], offset: 'same-offset' }),
      }),
    }),
    /Invalid or repeated Airtable pagination offset/,
  );
});

test('does not replace the previous output when Airtable fails', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'dossier-export-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const outputPath = join(directory, 'dossier.json');
  await writeFile(outputPath, 'previous data\n');

  await assert.rejects(
    publishDossier({
      ...config,
      outputPath,
      fetchImpl: async () => ({ ok: false, status: 503 }),
    }),
    /HTTP 503/,
  );
  assert.equal(await readFile(outputPath, 'utf8'), 'previous data\n');
});
