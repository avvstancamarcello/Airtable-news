import fs from 'node:fs';
import path from 'node:path';

const { AIRTABLE_PAT, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID } = process.env;
const OUT = process.env.OUTPUT_DIR || 'content/news/dossier';

async function fetchAll() {
  const records = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`);
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);
  return records;
}

const LANGS = {
  IT: { title: 'Titolo IT', body: null },
  EN: { title: 'Titolo EN', body: 'Testo Dossier (EN)' },
  ES: { title: 'Titolo ES', body: 'Testo Dossier (ES)' },
  FR: { title: 'Titolo FR', body: null },
  DE: { title: 'Titolo DE', body: 'Testo Dossier (DE)' },
};

const q = (v) => JSON.stringify(v ?? '');

export function build(f, lang, cfg, id) {
  const title = f[cfg.title] || f['Titolo Record'];
  const bodyText = cfg.body ? f[cfg.body] : '';
  if (!f[cfg.title] && !bodyText) return null;

  const fm = [
    '---',
    `title: ${q(title)}`,
    `lang: ${q(lang.toLowerCase())}`,
    `airtable_id: ${q(id)}`,
    `author: ${q(f['Autore'])}`,
    `source_type: ${q(f['Tipo Fonte / Canale'])}`,
    'is_financial_authority: false',
    `notebook_url: ${q(f['Link Notebook Originario'])}`,
    `tags: ${JSON.stringify(f['Classificazione Archivio'] || [])}`,
    `languages: ${JSON.stringify(f['Versione / Lingue'] || [])}`,
    '---',
  ].join('\n');

  const note = f['Nota Editoriale e Paternità']
    ? `> **Nota editoriale e paternità**\n> ${f['Nota Editoriale e Paternità'].replace(/\n/g, '\n> ')}\n\n`
    : '';
  const notebook = f['Link Notebook Originario']
    ? `[Notebook di ${f['Autore'] || 'autore'}](${f['Link Notebook Originario']})\n\n`
    : '';
  const files = f['Link file lingue (.md / PDF)']
    ? `\n\n## Download\n\n${f['Link file lingue (.md / PDF)']}\n`
    : '';

  return `${fm}\n\n${note}${notebook}${bodyText || ''}${files}\n`;
}

const records = await fetchAll();
fs.mkdirSync(OUT, { recursive: true });
let n = 0;
for (const r of records) {
  for (const [lang, cfg] of Object.entries(LANGS)) {
    const md = build(r.fields, lang, cfg, r.id);
    if (!md) continue;
    fs.writeFileSync(path.join(OUT, `${r.id}.${lang.toLowerCase()}.md`), md);
    n++;
  }
}
console.log(`Generati ${n} file da ${records.length} record.`);
