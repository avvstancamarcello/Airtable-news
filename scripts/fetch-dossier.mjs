import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function fetchDossier({ token, baseId, tableId, fetchImpl = fetch }) {
  if (typeof token !== 'string' || !token.trim()) throw new Error('AIRTABLE_PAT is required');
  if (typeof baseId !== 'string' || !/^app[a-zA-Z0-9]+$/.test(baseId)) {
    throw new Error('AIRTABLE_BASE_ID must be an Airtable base ID');
  }
  if (typeof tableId !== 'string' || !tableId.trim()) {
    throw new Error('AIRTABLE_DOSSIER_TABLE_ID is required');
  }

  const records = [];
  const offsets = new Set();
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`);
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('filterByFormula', '{Pubblica sul web}=1');
    if (offset) url.searchParams.set('offset', offset);
    const response = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${token}` },
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

export async function publishDossier({ outputPath, ...options }) {
  const records = await fetchDossier(options);
  const content = `${JSON.stringify(records, null, 2)}\n`;
  const outputDirectory = dirname(outputPath);
  await mkdir(outputDirectory, { recursive: true });

  try {
    if (await readFile(outputPath, 'utf8') === content) return false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const temporaryDirectory = await mkdtemp(join(outputDirectory, '.dossier-export-'));
  try {
    const temporaryFile = join(temporaryDirectory, 'dossier.json');
    await writeFile(temporaryFile, content, { encoding: 'utf8', mode: 0o644 });
    await rename(temporaryFile, outputPath);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const changed = await publishDossier({
      token: process.env.AIRTABLE_PAT,
      baseId: process.env.AIRTABLE_BASE_ID,
      tableId: process.env.AIRTABLE_DOSSIER_TABLE_ID,
      outputPath: resolve(process.env.OUTPUT_FILE || 'data/dossier.json'),
    });
    console.log(changed ? 'Dossier JSON updated.' : 'Dossier JSON unchanged.');
  } catch (error) {
    console.error(`Dossier export failed; published file preserved: ${error.message}`);
    process.exitCode = 1;
  }
}
