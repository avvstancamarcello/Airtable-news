import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.equal(calls[1].url.searchParams.get('offset'), 'next');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer t');
});

test('fetchAll solleva errore se Airtable risponde non-ok', async () => {
  const fetchImpl = async () => ({ ok: false, status: 403, text: async () => 'no' });
  await assert.rejects(fetchAll({ token: 't', baseId: 'a', tableId: 'b', fetchImpl }), /Airtable 403/);
});
