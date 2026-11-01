---
title: "6 Milliarden Dollar von Binance gestohlen, digitale Bank für Kryptowährungen"
lang: "de"
airtable_id: "recWpkUGa3QzCQaoZ"
author: "Avv. Marcello Stanca"
source_type: "Dossier Tecnico-Giuridico Indipendente"
is_financial_authority: false
notebook_url: ""
tags: ["Cybersecurity","Crypto Assets","Threat Intelligence","TraderTraitor"]
languages: ["IT","EN","ES","DE","FR"]
---

> **Nota editoriale e paternità**
> Questo report rappresenta una ricostruzione tecnico-giuridica indipendente a cura dell'Avv. Marcello Stanca (elaborata tramite ambiente di analisi su Gemini Notebook). L'analisi integra i dati di intelligence blockchain disponibili (TRM Labs, Chainalysis) e non costituisce un bollettino ufficiale rilasciato da Financial Authorities o enti regolatori.

Analytisches Dossier: Der 6,3-Milliarden-Dollar-Binance-Hack – Technische Anatomie, Batch-Engineering, On-Chain-Tracking und Risikomanagement

1. Allgemeiner Überblick über den Vorfall und Marktauswirkungen

1.1 Umfang des Vorfalls und historischer Vergleich
Zwischen dem 29. und 30. Oktober 2026 wurde die Kryptowährungsbörse Binance Opfer des gewaltigsten Cyberangriffs, der jemals in der Geschichte digitaler Vermögenswerte verzeichnet wurde. Nach offiziellen Schätzungen der Börse und Berichten führender Finanz- und Technologie-Nachrichtenagenturen erreichte der finanzielle Gesamtschaden des Vorfalls einen geschätzten Wert von etwa 6,3 Milliarden US-Dollar (mit punktuellen Bewertungen der Analysefirma Chainalysis von rund 5,912 Milliarden US-Dollar zum Zeitpunkt des Abflusses und Schätzungen von TRM Labs von bis zu 6,36 Milliarden US-Dollar).
Um die beispiellose Schwere dieses Ereignisses zu verstehen, genügt ein Vergleich mit dem vorherigen historischen Rekord: dem Diebstahl bei der Börse Bybit im Februar 2025, der einen Verlust von etwa 1,5 Milliarden US-Dollar bedeutete. Der Angriff auf Binance vervierfachte dieses Finanzvolumen nahezu und verdeutlicht einen qualitativen sowie quantitativen Sprung in den offensiven Fähigkeiten hochkomplexer Cyberkriminalitätsgruppen.

1.2 Unmittelbare Reaktion der Finanzmärkte
Die Ankündigung des Eindringens und die darauffolgende Entscheidung von Binance, vorsorglich alle Einzahlungen und Auszahlungen auszusetzen, lösten in den ersten asiatischen Handelsstunden eine sofortige und breite negative Reaktion auf den globalen Kryptowährungsmärkten aus. Wichtige digitale Vermögenswerte verzeichneten scharfe Einbrüche:
• Bitcoin (BTC) verzeichnete einen Rückgang um 2,3 % und fiel auf ein Sechs-Wochen-Tief von 77.218 US-Dollar (mit Spitzenverlusten von über 3 % auf den Spotmärkten).
• Ethereum (ETH) erlitt einen Rückgang um 3,67 % und erreichte ein Zwei-Monats-Tief von 2.241 US-Dollar.
• BNB, der native Token des Binance-Ökosystems für Netzwerk- und Handelsgebühren, erlitt den schwersten Schlag und brach um über 8 % auf das Niveau von 694 US-Dollar ein.
Die vorübergehende operative Aussetzung wurde von der Unternehmensführung als unverzichtbare Vorsichtsmaßnahme bezeichnet, um den internen Sicherheitsteams zusammen mit Strafverfolgungsbehörden und Partner-Blockchain-Intelligence-Firmen systematische Überprüfungen der Netzwerkinfrastruktur und die Isolierung von Schwachstellen zu ermöglichen.

2. Angriffsvektor und Kompromittierung der internen Infrastruktur

2.1 Ursprung des Eindringens: Kompromittierung des DevOps-Endpunkts
Vorläufige Untersuchungen der Incident-Response-Teams von Binance deuten darauf hin, dass der Erstzugriff nicht über einen direkten Angriff auf grundlegende kryptographische Protokolle oder primäre Smart Contracts erfolgte, sondern über die Kompromittierung des Dienstlaptops eines DevOps-Ingenieurs.
Der Endpunkt des Entwicklers diente als unbefugte Zugangsbrücke zur internen Umgebung der Plattform. Unter Ausnutzung der Rechte der kompromittierten Workstation gelang es dem Angreifer, in einen internen Service-Container einzudringen, der für die Verwaltung automatisierter Auszahlungsvorgänge zuständig war.

2.2 Keine Kompromittierung privater Schlüssel (Private Keys)
Ein entscheidendes Element, das sowohl in offiziellen Mitteilungen der Börse als auch in unabhängigen Berichten hervorgehoben wird, betrifft die Integrität der Cold-Storage-Systeme und der primären kryptographischen Schlüssel. Die vorläufige Untersuchung bestätigte ausdrücklich das Fehlen jeglicher Hinweise auf ein Durchsickern oder eine Kompromittierung privater Schlüssel (Wallet Private Key Leak) der Hot Wallets oder Cold Wallets von Binance.
Das bedeutet, dass sich die Angreifer nicht direkt der kryptographischen Wurzelgeheimnisse bemächtigten, um Transaktionen manuell von externer Infrastruktur aus zu signieren, sondern das automatisierte Signiersystem von Binance manipulierten und zwangen, gültige Autorisierungen von innerhalb des kompromittierten Netzwerks zu generieren.

3. Transaktions-Engineering: Nonce, 50-Autorisierungs-Batching und Sweeper Contract

3.1 Nonce-Mechanik und Vorab-Batch-Generierung
Die analytische Rekonstruktion von TRM Labs zeigt, dass der Angriff mit extremer chirurgischer Präzision geplant und ausgeführt wurde. Die On-Chain-Staging- und Vorbereitungsphase begann mindestens 36 Stunden vor dem tatsächlichen Abfluss der Gelder.
In den Architekturmodellen EVM-basierter (Ethereum Virtual Machine) Blockchains verwaltet jedes Wallet einen eindeutigen, fortlaufenden Zähler für gesendete Transaktionen, den sogenannten Nonce. Eine vorgezeichnete Transaktionsautorisierung ist ausschließlich dann gültig und ausführbar, wenn ihr Nonce-Wert exakt mit dem fortlaufenden Wert übereinstimmt, den das Wallet in dem Moment erreicht hat, in dem die Transaktion vom Netzwerk verarbeitet wird. Da die Hot Wallets von Binance kontinuierlich einen ununterbrochenen Strom von Benutzerauszahlungen verarbeiten, rückt der Nonce-Zähler rasch und unvorhersehbar vor.
Um das Hindernis des kontinuierlichen Nonce-Fortschritts zu überwinden und sicherzustellen, dass der Angriff nicht aufgrund einer zeitlichen Fehlanpassung fehlschlug, zwang der Angreifer das interne Signiersystem von Binance, vorab ein kumulatives Paket von 50 aufeinanderfolgenden Autorisierungen (Batch Signatures) zu generieren.
Die von Analysten aufgestellte technische Hypothese besagt, dass der Zugriff des Angreifers auf das Signiersystem des Hot Wallets zeitlich begrenzt war oder Sitzungsbeschränkungen unterlag; aus diesem Grund mussten die Hacker in einem einzigen Durchgang einen Signaturblock anfordern und extrahieren, der groß genug war, um die Sequenz zukünftiger Nonces abzudecken.

3.2 Struktur des Sweeper Contracts und Abschöpfung der Gelder
Jede der 50 vom Hot Wallet signierten Autorisierungen zielte auf einen bösartigen Smart Contract zur Geldabschöpfung ab, der als Sweeper Contract bezeichnet wird. Dieser Vertrag war vom Angreifer so programmiert und bereitgestellt worden, dass er operative Befehle ausschließlich von der Adresse akzeptierte und ausführte, die vom Operator des Angriffs kontrolliert wurde.
Die Vorbereitung von 50 aufeinanderfolgenden Nonce-Werten bot die mathematische Gewissheit, dass mindestens einer davon perfekt mit dem aktuellen Wert des Hot Wallets übereinstimmen würde, wenn die Transaktion vom Angreifer eingereicht wurde.
Der Ablauf gestaltete sich nach folgendem Zeitplan:
1. Planung (36 Stunden vorher): Vorab-Generierung des Batches von 50 signierten Autorisierungen im Namen des Hot Wallets von Binance.
2. Delegierung (20:20 Uhr UTC): Der Operator reichte eine einzelne Transaktion ein, die die 50 Autorisierungen enthielt, und verknüpfte die Kontrolle des Hot Wallets erfolgreich mit dem Sweeper Contract.
3. Ausführung und Abschöpfung (3 Minuten und 24 Sekunden später): Der Operator sendete den Befehl zur Entleerung an den Sweeper Contract.
In einer einzigen konzentrierten Transaktion wurde das gesamte verbleibende Guthaben des Hot Wallets — bestehend aus 167.464 Ethereum (ETH) und 63 verschiedenen Token (darunter 1,615 Milliarden USDT) — sofort auf eine externe Adresse unter der exklusiven Kontrolle der Kriminellengruppe übertragen.

4. On-Chain Forensik-Tracking-Methodik und Identifizierung der Operator-Wallets

4.1 Rekonstruktion der Transaktionskette vom Sweeper Contract
Das von Blockchain-Intelligence-Firmen (TRM Labs und Chainalysis) durchgeführte Tracking nutzte die vollständige Transparenz verteilter Hauptbücher, um die Transaktionskette rückwärts und vorwärts zu rekonstruieren:
1. Analyse des Sweeper Contracts: Durch Untersuchung des Codes und der Aktivierungstransaktion des Sweeper Contracts um 20:20 Uhr UTC isolierten die Analysten die Aufruferadresse (Caller Address). Diese Adresse stellte das operative Wallet des Angreifers (Operator Wallet) dar, die einzige Adresse, die befugt war, Befehle an den Abschöpfungs-Smart-Contract zu erteilen.
2. Rückverfolgung der initialen Gas-Finanzierung: Bei der Rückverfolgung der Transaktionshistorie des Operator-Wallets vor dem Angriff identifizierte TRM Labs winzige Abhebungen aus dem dezentralen Mixer Tornado Cash. Diese geringen ETH-Mittel dienten ausschließlich zur Deckung der Netzwerkgebühren (Gas Fees), die für die Bereitstellung des Sweeper Contracts und die Ausführung der Delegierungs- und Abschöpfungstransaktion erforderlich waren.
3. Überwachung der Abflüsse aus dem Sweeper Contract: Unmittelbar nach der Abschöpfung von 167.464 ETH und 63 Token richteten Überwachungsfirmen automatisierte Warnmeldungen für die Zieladressen des Operators ein und verfolgten die anschließende Verteilung des Kapitals.

4.2 Evolution der Geldwäschestrategie: Swaps und Lending-Protokolle
Im Gegensatz zu früheren großen Krypto-Angriffen, bei denen Gelder sofort über Kettenbrücken (Cross-Chain Bridges) geleitet wurden (wie bei Bybit geschehen), enthüllte das On-Chain-Tracking des Binance-Angriffs eine andere Geldwäschetechnik:
• Umfangreiche Swap-Transaktionen: Der Angreifer begann, Dutzende sekundärer Token, die aus dem Hot Wallet abgeschöpft wurden, über dezentrale Market Maker und DEX-Protokolle umzutauschen.
• Nutzung von Lending-Protokollen: Der Operator zahlte erhebliche Asset-Anteile in Leihplattformen ein, um nicht nachverfolgbare Liquidität zu erhalten oder die Herkunft des Kapitals weiter zu fragmentieren.
Die sofortige Identifizierung dieser Operator-Wallets ermöglichte es den Ermittlern, kontaminierte Adressen in Echtzeit an zentrale Börsen und Token-Emittenten zu übermitteln und, wo immer möglich, Einfrierprotokolle zu aktivieren.

5. Intelligence-Attribuierung und Taktiken der TraderTraitor-Gruppe

5.1 Attribuierung durch TRM Labs und Chainalysis
Die Blockchain-Intelligence-Firma TRM Labs schrieb den 6,3-Milliarden-Dollar-Angriff mit hoher Zuverlässigkeit Bedrohungskakteuren mit Verbindungen zu Nordkorea zu und identifizierte speziell die als TraderTraitor bekannte Gruppe. Die Analyse wurde durch Bewertungen von Chainalysis weiter gestützt.
TraderTraitor ist eine bekannte nordkoreanische staatliche Cyber-Bedrohungseinheit, die zuvor für bedeutende Diebstähle digitaler Vermögenswerte verantwortlich war, darunter der 1,5-Milliarden-Dollar-Diebstahl bei Bybit im Februar 2025 und der Angriff auf das KelpDAO-Protokoll im April 2026.

5.2 Übereinstimmende operative Fingerabdrücke und Taktiken
Die an On-Chain-Transaktionen durchgeführte forensische Analyse ergab deutliche methodische Überschneidungen zwischen dem Binance-Angriff und früheren TraderTraitor-Operationen:
• Initiale Finanzierung über Tornado Cash: Die Adresse des Operators wurde aktiviert und über geringe Abhebungen aus dem dezentralen Mischprotokoll Tornado Cash mit Gasgebühren versorgt.
• Verlängerte Staging-Phase: Vorbereitende Aktivitäten zur Vertragskonfiguration und Autorisierungsanforderung wurden weit im Voraus (mindestens 36 Stunden) vor der Ausführungsphase eingeleitet.
• Ausführung in einem einzigen Burst: Vorab-Einholung von Autorisierungen und deren gleichzeitige Einreichung zur Maximierung des exfiltrierten Volumens vor Auslösung von Sicherheitsalarmen.

6. Eindämmungsarchitektur und On-Chain-Einfrierung

6.1 Ergebnisse der Branchenkoordination: 3 Milliarden Dollar eingefroren
Innerhalb weniger Stunden nach Erkennung der Anomalie gelang es durch koordinierte Aktionen zwischen dem Sicherheitsteam von Binance, zentralen Emittenten digitaler Vermögenswerte, Layer-2-Sicherheitsräten und Blockchain-Intelligence-Agenturen, etwa 3 Milliarden US-Dollar an gestohlenen Vermögenswerten direkt On-Chain einzufrieren und zu neutralisieren.
Die Aufschlüsselung der eingefrorenen Gelder umfasst:
• Tether: Setzte Adressen auf die schwarze Liste und fror über 1,567 Milliarden USDT ein.
• Circle: Fror über 800 Millionen US-Dollar an Stablecoins (USDT/USDC) ein.
• Ripple: Koordinierte das Einfrieren von etwa 200 Millionen US-Dollar an verwandten Vermögenswerten.
• Arbitrum Security Council: Führte eine Notfall-On-Chain-Transaktion aus, um etwa 30,5 Millionen US-Dollar an ETH- und ARB-Token auf dem Layer-2-Netzwerk einzufrieren.
• World Liberty Financial und BitGo: Froren 27 Millionen US-Dollar an Stablecoins und etwa 2 Millionen US-Dollar an ökosystemeigenen Token ein.

6.2 Verwaltung des nicht eingefrorenen Restkapitals (2,4 Milliarden Dollar in BTC und ETH)
Während Stablecoins und bestimmte von zentralen Einheiten emittierte Token über Blacklisting-Funktionen auf Smart-Contract-Ebene verfügen, können native Kryptowährungen ohne zentrale Kontrolle On-Chain nicht willkürlich blockiert werden.
Infolgedessen behält der Angreifer derzeit die Kontrolle über ein geschätztes Restkapital von 2,4 Milliarden US-Dollar, das sich hauptsächlich wie folgt zusammensetzt:
• Über 420.000 Ethereum (ETH).
• Über 18.270 Bitcoin (BTC).
• Kleinere Beträge, die über andere Blockchain-Netzwerke verteilt sind.
Zum Schutz des Ökosystems vor diesem verbleibenden Kapital errichteten Justizbehörden und Analysefirmen (Chainalysis, TRM Labs) ein spezielles Überwachungsnetz um die Adressen des Angreifers und überwachen kontinuierlich Auszahlungspunkte in Fiat-Währung (Off-Ramps), um Versuche einer Umwandlung abzufangen.

7. Schutzmaßnahmen, SAFU-Fonds und Proof of Reserves

7.1 Vollständige Verlustübernahme über den SAFU-Fonds
Um die finanzielle Stabilität der Plattform aufrechtzuerhalten und Panik oder einen Bankrun unter ihren über 335 Millionen registrierten Benutzern zu verhindern, garantierte die Binance-Führung — durch Erklärungen von Mitgründerin Yi He und offizielle Unternehmensmitteilungen — die vollständige und sofortige Deckung aller nicht wiedererlangten Verluste.
Die finanzielle Absicherung wird aus zwei Bilanzsäulen gezogen:
1. SAFU-Fonds (Secure Asset Fund for Users): Der Notfall-Garantiefonds, der 2018 von Binance eingerichtet wurde, um Benutzer bei Sicherheitsverletzungen zu schützen.
2. Unternehmenskapital und Reserven: Unternehmensliquidität und Eigenmittel, die bereitgestellt werden, um verbleibende Fehlbeträge abzudecken.
Die Verpflichtung zur Entschädigung der Benutzer bleibt völlig unabhängig vom Ausgang der laufenden Nachverfolgungs- und Rechtsverfolgungsbemühungen bezüglich der verbleibenden 2,4 Milliarden Dollar, wodurch sichergestellt wird, dass kein Kunde einen Verlust auf seinem Kontostand erleidet.

7.2 Operative Wiederherstellung und Aktualisierung der Proof of Reserves
Parallel zur Sanierung der Netzwerkinfrastruktur und einer vollständigen Überarbeitung der Auszahlungssignaturprotokolle skizzierte Binance Meilensteine für die vollständige Wiederherstellung der Transparenz:
• Wiederherstellung der Auszahlungen: Geplant innerhalb von 48 Stunden nach dem Ereignis, nach dem Austausch und der Härtung von Auszahlungsadressen und Service-Containern.
• Veröffentlichung der Proof of Reserves (PoR): Die Börse kündigte an, einen aktualisierten Proof-of-Reserves-Bericht zu veröffentlichen, sobald die Sanierungsphase abgeschlossen ist.
Proof of Reserves nutzt fortschrittliche kryptographische Strukturen (Merkle-Bäume und Zero-Knowledge-Beweise zk-SNARKs), um jedem Benutzer die mathematische Überprüfung zu ermöglichen, dass seine Einlagen zu 100 % durch reale 1:1-Reserven gedeckt sind, was die vollständige Solvenz der Plattform nach dem größten Cyberangriff der Krypto-Geschichte bestätigt.

8. Zusammenfassende Vergleichstabelle der Garantie- und Schutzmaßnahmen

SAFU-Fonds
- Typ und Instrument: Interne Notfallreserve (in BTC/Assets denominiert).
- Operatives Ziel: Direkte und vollständige Abdeckung von Benutzerverlusten aus Sicherheitsverletzungen.
- Anwendung beim Binance-Vorfall ($6,3B): Zusammen mit Unternehmensreserven aktiviert, um 100 % der nicht wiedererlangten Verluste abzudecken.
- Vorteile: Sofortige finanzielle Garantie unabhängig von der Wiedererlangung von Geldern.
- Grenze: Reserve wird direkt von der Börse verwaltet.

Proof of Reserves (PoR)
- Typ und Instrument: Kryptographische Prüfbarkeit (Merkle-Bäume & zk-SNARKs).
- Operatives Ziel: Öffentlicher Nachweis der 1:1-Einlagendeckung gegenüber Unternehmensverbindlichkeiten.
- Anwendung beim Binance-Vorfall ($6,3B): Aktualisierter Bericht von Binance nach Sanierung geplant, um Solvenz zu bestätigen.
- Vorteile: Transparent, mathematisch durch einzelne Benutzer überprüfbar.
- Grenze: Prüft Reserven ex-post; blockiert Angriffe nicht ex-ante.

On-Chain-Einfrierung
- Typ und Instrument: Blacklisting über Smart Contracts & DAO-Council-Interventionen.
- Operatives Ziel: Abfangen und Blockieren der Bewegung gestohlener Token auf Blockchain-Netzwerken.
- Anwendung beim Binance-Vorfall ($6,3B): Ca. 3 Milliarden Dollar in Stablecoins und Token eingefroren (Tether, Circle, Ripple, Arbitrum Council, BitGo).
- Vorteile: Hochwirksam für zentrale Stablecoins und Layer-2s.
- Grenze: Nicht anwendbar auf native dezentrale Kryptowährungen (BTC, ETH).

Intelligence-Überwachung
- Typ und Instrument: On-Chain Forensik-Tracking (TRM Labs, Chainalysis).
- Operatives Ziel: Überwachung von Angreifer-Wallets und Abfangen von Auszahlungsversuchen an Off-Ramps.
- Anwendung beim Binance-Vorfall ($6,3B): TraderTraitor-Gruppe identifiziert, verbleibende $2,4B überwacht, verdächtige Swaps gemeldet.
- Vorteile: Identifiziert Geldwäschewege und unterstützt Strafverfolgungsbehörden.
- Grenze: Verhindert nicht die direkte Wallet-Kontrolle des Angreifers.
