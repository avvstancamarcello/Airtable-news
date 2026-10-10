# Airtable-news
Repository dedicato al feed JSON delle news esportate da Airtable per la Financial Authority Database.

## Pubblicazione Airtable → GitHub

1. Nella tabella `NEWS_SIMPLE`, usa una riga per lingua con i campi
   `news_id`, `lang`, `title`, `summary`, `body_text`, `source_url`, `theme`,
   `published_at`, `status`. Le traduzioni condividono `news_id` e hanno `lang`
   diversi (ad esempio `it` / `en`).
2. In **Settings → Secrets and variables → Actions**, crea i repository secrets:
   - `AIRTABLE_PAT`: PAT Airtable con il solo scope `data.records:read`, limitato
     alla base interessata.
   - `AIRTABLE_BASE_ID`: ID della base Airtable (`app…`), non il nome della tabella.
3. Unisci questi file nel branch `main`. Consenti al `GITHUB_TOKEN` del workflow
   di scrivere i contenuti del repository; le regole di protezione di `main`
   devono consentire questo aggiornamento automatico. Non serve un PAT GitHub.
4. Avvia **Actions → Publish Airtable news → Run workflow** su `main`.
   Il workflow si esegue anche ogni sei ore e quando cambia il codice su `main`.
   Le pull request eseguono solo i test, senza credenziali Airtable.

L'esportatore legge tutte le pagine e include solo `status === 'published'`.
I quattro campi obbligatori sono stringhe non vuote; `published_at` accetta una
data ISO (`2026-10-09`) o un timestamp ISO con fuso orario
(`2026-10-09T19:30:00Z`). I campi facoltativi devono essere stringhe se presenti,
altrimenti sono esportati come `""`; `source_url` deve essere HTTP(S), senza
credenziali. Le coppie duplicate `news_id` / `lang` causano un errore.

Un errore API, di paginazione o di validazione interrompe l'intera esportazione:
il precedente `news.json` resta intatto. Solo dopo la validazione completa il
file viene sostituito atomicamente e committato se diverso. Una lettura completa
senza record pubblicati produce legittimamente `[]`. L'ordine per `news_id` e
`lang` e il formato JSON sono deterministici; `status` e `published_at` restano
disponibili per i filtri e l'ordinamento del consumer.

Il primo `news.json` viene creato dalla prima esportazione riuscita: non sono
inclusi dati dimostrativi. Tutti i campi esportati saranno **pubblici**.
Il frontend legge solamente:
`https://raw.githubusercontent.com/avvstancamarcello/Airtable-news/main/news.json`
e non riceve il PAT né chiama Airtable. Nessuna modifica al repository frontend
è necessaria per questa pipeline.

### Verifica locale (Node.js 22)

```sh
node --test scripts/export-news.test.mjs
# Con AIRTABLE_PAT e AIRTABLE_BASE_ID già impostati nell'ambiente:
node scripts/export-news.mjs news.json
```

Non inserire credenziali nei file o nei comandi salvati. I test usano risposte
Airtable simulate e non richiedono accesso alla base. Non sono necessarie
dipendenze npm. Lo script permette opzionalmente `AIRTABLE_TABLE` per una
tabella diversa; il workflow usa `NEWS_SIMPLE`.
