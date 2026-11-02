import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
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
    assert.equal(url.pathname, '/v0/app123abc/tbl456def');
    assert.equal(url.searchParams.get('filterByFormula'), '{Pubblica sul web}=1');
    assert.equal(url.searchParams.get('pageSize'), '100');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
  }
  assert.equal(requests[1].url.searchParams.get('offset'), 'next-page');
});

test('workflow wires the required secrets and JSON output to the existing script', async () => {
  const workflow = await readFile(new URL('../.github/workflows/public-dossier.yml', import.meta.url), 'utf8');
  for (const name of ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_DOSSIER_TABLE_ID']) {
    assert.ok(workflow.includes(`${name}: \${{ secrets.${name} }}`));
  }
  assert.ok(workflow.includes('OUTPUT_FILE: data/dossier.json'));
  assert.ok(workflow.includes('run: node scripts/fetch-dossier.mjs'));
  assert.ok(workflow.includes("cron: '0 */6 * * *'"));
  await assert.rejects(
    readFile(new URL('../.github/workflows/publish-dossier.yml', import.meta.url)),
    { code: 'ENOENT' },
  );
});

test('CLI reads the workflow environment and generates data/dossier.json', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'dossier-cli-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const mock = `
    import assert from 'node:assert/strict';
    globalThis.fetch = async (url, options) => {
      assert.equal(url.pathname, '/v0/app123abc/tbl456def');
      assert.equal(url.searchParams.get('filterByFormula'), '{Pubblica sul web}=1');
      assert.equal(options.headers.Authorization, 'Bearer ' + process.env.AIRTABLE_PAT);
      return { ok: true, json: async () => ({
        records: [{ id: 'rec1', fields: { 'Pubblica sul web': true } }]
      }) };
    };
  `;
  const result = spawnSync(process.execPath, [
    '--import', `data:text/javascript,${encodeURIComponent(mock)}`,
    fileURLToPath(new URL('./fetch-dossier.mjs', import.meta.url)),
  ], {
    cwd: directory,
    env: {
      ...process.env,
      AIRTABLE_PAT: config.token,
      AIRTABLE_BASE_ID: config.baseId,
      AIRTABLE_DOSSIER_TABLE_ID: config.tableId,
      OUTPUT_FILE: 'data/dossier.json',
    },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(await readFile(join(directory, 'data/dossier.json'), 'utf8')), [
    { id: 'rec1', fields: { 'Pubblica sul web': true } },
  ]);
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
