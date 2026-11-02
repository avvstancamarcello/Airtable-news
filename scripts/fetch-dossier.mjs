import fs from 'node:fs';
import path from 'node:path';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function toItems(records) {
  return records.map(({ id, fields: f }) => ({
    id,
    title: f['Titolo Record'] || '',
    author: f['Autore'] || '',
    source_type: f['Tipo Fonte / Canale'] || '',
    is_financial_authority: false,
    notebook_url: f['Link Notebook Originario'] || '',
    languages: f['Versione / Lingue'] || [],
    file_links: f['Link file lingue (.md / PDF)'] || '',
    tags: f['Classificazione Archivio'] || [],
    editorial_note: f['Nota Editoriale e Paternità'] || '',
    titles: {
      it: f['Titolo IT'] || '',
      en: f['Titolo EN'] || '',
      es: f['Titolo ES'] || '',
      fr: f['Titolo FR'] || '',
      de: f['Titolo DE'] || '',
    },
    texts: {
      en: f['Testo Dossier (EN)'] || '',
      es: f['Testo Dossier (ES)'] || '',
      de: f['Testo Dossier (DE)'] || '',
    },
  }));
}

export async function fetchAll({ token, baseId, tableId, fetchImpl = fetch }) {
  const records = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`);
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('filterByFormula', '{Pubblica sul web}=1');
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);
  return records;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { AIRTABLE_PAT, AIRTABLE_BASE_ID, AIRTABLE_DOSSIER_TABLE_ID } = process.env;
  const out = process.env.OUTPUT_FILE || 'data/dossier.json';
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID || !AIRTABLE_DOSSIER_TABLE_ID) {
    throw new Error('Mancano AIRTABLE_PAT, AIRTABLE_BASE_ID o AIRTABLE_DOSSIER_TABLE_ID');
  }
  const records = await fetchAll({
    token: AIRTABLE_PAT, baseId: AIRTABLE_BASE_ID, tableId: AIRTABLE_DOSSIER_TABLE_ID,
  });
  const items = toItems(records);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // Scrittura solo a fetch riuscito: un errore non svuota il file esistente.
  fs.writeFileSync(out, JSON.stringify(items, null, 2) + '\n');
  console.log(`Scritti ${items.length} dossier in ${out}`);
}
