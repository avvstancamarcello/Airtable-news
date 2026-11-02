import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAll, toItems } from './fetch-dossier.mjs';

const page = (records, offset) => ({ ok: true, json: async () => ({ records, offset }) });

test('toItems mappa i campi e imposta is_financial_authority=false', () => {
  const [item] = toItems([{ id: 'rec1', fields: { 'Titolo Record': 'T', 'Titolo EN': 'E', 'Testo Dossier (DE)': 'D' } }]);
  assert.equal(item.id, 'rec1');
  assert.equal(item.is_financial_authority, false);
  assert.equal(item.titles.en, 'E');
  assert.equal(item.texts.de, 'D');
  assert.deepEqual(item.tags, []);
});

test('fetchAll pagina, filtra per Pubblica sul web e usa il token', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: new URL(url), init });
    return calls.length === 1 ? page([{ id: 'a' }], 'next') : page([{ id: 'b' }]);
  };
  const records = await fetchAll({ token: 't', baseId: 'appX', tableId: 'tblY', fetchImpl });
  assert.deepEqual(records.map((r) => r.id), ['a', 'b']);
  assert.equal(calls[0].url.searchParams.get('filterByFormula'), '{Pubblica sul web}=1');
  assert.equal(calls[0].url.pathname, '/v0/appX/tblY');
  assert.equal(calls[0].url.searchParams.get('pageSize'), '100');
  assert.equal(calls[1].url.searchParams.get('offset'), 'next');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer t');
});

test('fetchAll solleva errore se Airtable risponde non-ok', async () => {
  const fetchImpl = async () => ({ ok: false, status: 403, text: async () => 'no' });
  await assert.rejects(fetchAll({ token: 't', baseId: 'a', tableId: 'b', fetchImpl }), /Airtable 403/);
});

test('un solo workflow Dossier collega secret, script e percorso JSON', async () => {
  const directory = new URL('../.github/workflows/', import.meta.url);
  const workflows = await readdir(directory);
  assert.deepEqual(workflows.filter((name) => name.includes('dossier')), ['public-dossier.yml']);
  const workflow = await readFile(new URL('public-dossier.yml', directory), 'utf8');
  for (const name of ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_DOSSIER_TABLE_ID']) {
    assert.ok(workflow.includes(`${name}: \${{ secrets.${name} }}`));
  }
  assert.ok(workflow.includes('OUTPUT_FILE: data/dossier.json'));
  assert.ok(workflow.includes('run: node scripts/fetch-dossier.mjs'));
  assert.ok(workflow.includes("cron: '0 */6 * * *'"));
});

test('lo script genera data/dossier.json usando le variabili del workflow', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'dossier-cli-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const mock = `
    import assert from 'node:assert/strict';
    let calls = 0;
    globalThis.fetch = async (url, options) => {
      assert.equal(url.pathname, '/v0/appTest/tblDossier');
      assert.equal(url.searchParams.get('filterByFormula'), '{Pubblica sul web}=1');
      assert.equal(options.headers.Authorization, 'Bearer ' + process.env.AIRTABLE_PAT);
      calls++;
      if (calls === 1) {
        return { ok: true, json: async () => ({
          records: [{ id: 'rec1', fields: { 'Titolo Record': 'Dossier approvato' } }],
          offset: 'next'
        }) };
      }
      assert.equal(calls, 2);
      assert.equal(url.searchParams.get('offset'), 'next');
      return { ok: true, json: async () => ({
        records: [{ id: 'rec2', fields: { 'Titolo Record': 'Seconda pagina' } }]
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
      AIRTABLE_PAT: 'test-token',
      AIRTABLE_BASE_ID: 'appTest',
      AIRTABLE_DOSSIER_TABLE_ID: 'tblDossier',
      OUTPUT_FILE: 'data/dossier.json',
    },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const items = JSON.parse(await readFile(join(directory, 'data/dossier.json'), 'utf8'));
  assert.deepEqual(items.map(({ id, title }) => ({ id, title })), [
    { id: 'rec1', title: 'Dossier approvato' },
    { id: 'rec2', title: 'Seconda pagina' },
  ]);
  assert.deepEqual(await readdir(join(directory, 'data')), ['dossier.json']);
});
