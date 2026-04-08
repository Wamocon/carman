# CarMan – Markt-, Bedarfs- und Nutzwertanalyse

Stand: 08.04.2026
Zweck: Ausführliche Herleitung für Produktbedarf, Zielgruppe, V1-Scope und spätere KI-Erweiterungen

---

## 1. Executive Summary

Private Fahrzeughalter verlieren jeden Monat Geld, Zeit und Nerven, weil wichtige Fahrzeuginformationen verstreut sind: Kosten in Banking-Apps, Belege im Handschuhfach, Fristen im Kalender und Wartungswissen im Kopf. Das führt zu drei spürbaren Folgen: fehlende Kostentransparenz, vergessene Wartungen und schwächere Nachweise beim Verkauf.

Die Problemgröße ist groß und klar messbar:

- 49,1 Millionen Pkw im Bestand in Deutschland, durchschnittlich 10,3 Jahre alt.[1]
- 6,03 Millionen Pkw-Besitzumschreibungen pro Jahr, davon 93,4 Prozent privat.[2]
- Über 80 Prozent der Halter sind im Alltag auf ihr Auto angewiesen.[3]
- Über 3,6 Millionen ADAC-Pannenhilfeeinsätze im Jahr 2024.[5]

Das ist kein Nischenproblem, sondern ein breiter Alltagsmarkt mit wiederkehrendem Bedarf.

CarMan adressiert genau diesen Schmerz mit einem einfachen Kernversprechen: ein digitales Fahrzeugkonto, das Kosten, Wartung, Erinnerungen und Nachweise an einem Ort zusammenführt. Der Nutzen ist unmittelbar verständlich, wiederkehrend und im Alltag spürbar.

Management-Fazit auf einen Blick:

- Problem: Hohe Reibung in Kosten-, Wartungs- und Nachweisprozessen privater Halter.
- Größe: Sehr großer, privater Massenmarkt mit hoher Nutzungshäufigkeit.
- Lösung: Klarer V1-Fokus auf Ordnung, Transparenz und fristgerechtes Handeln.
- Priorität: Erst der belastbare Kernnutzen, dann KI als Effizienzhebel.

Strategische Empfehlung: CarMan sollte V1 nicht als Technologie-Story, sondern als Ergebnis-Story verkaufen: weniger Vergessen, besserer Überblick, bessere Entscheidungen und belastbarere Fahrzeughistorie.

---

## 2. Methodik und Grenzen

Diese Analyse kombiniert:

- den Projektkontext aus Repository, Pitch und Implementierungsdokumenten
- offizielle oder branchenrelevante Quellen mit belastbaren Zahlen
- eine qualitative Nutzwertanalyse für den V1-Scope

Wichtig: Die belastbarsten öffentlich zugänglichen Zahlen liegen überwiegend für Deutschland vor. Für die DACH-Ableitung ist das akzeptabel, weil Deutschland der größte Teilmarkt ist und die Produktlogik für Österreich und die Schweiz grundsätzlich ähnlich bleibt. Wo keine sauberen DACH-Zahlen vorlagen, wird das nicht künstlich behauptet.

---

## 3. Markt- und Bedarfsbegründung in Zahlen

| Aussage | Wert | Warum das für CarMan wichtig ist | Quelle |
|---|---:|---|---|
| Pkw-Bestand in Deutschland | 49,1 Mio. | Großer adressierbarer Markt für private Fahrzeugverwaltung | KBA Bestand 2024 [1] |
| Durchschnittsalter des Pkw-Bestands | 10,3 Jahre | Ältere Fahrzeuge erhöhen Wartungs-, Reparatur- und Dokumentationsbedarf | KBA Bestand 2024 [1] |
| Pkw-Besitzumschreibungen 2023 | 6,03 Mio. | Wiederverkauf und saubere Historie sind hochrelevant | KBA Besitzumschreibungen [2] |
| Privat-Anteil an Besitzumschreibungen | 93,4 % | Der Gebrauchtwagenmarkt ist klar privat geprägt | KBA Besitzumschreibungen [2] |
| Auto im Alltag unverzichtbar | über 80 % der Pkw-Halter | Das Problem ist wiederkehrend und nicht nur emotional, sondern funktional | DAT Report 2026 [3] |
| Auf Privatpersonen zugelassene Automobile | fast 90 % | Die Zielgruppe ist groß und prägt den Markt | DAT Report 2026 [3] |
| ADAC Pannenhilfeeinsätze 2024 | über 3,6 Mio. | Wartung, Zustandskontrolle und Prävention haben reale Alltagsrelevanz | ADAC Pannenstatistik 2025 [5] |
| Anteil Batterie an Pannenursachen | 44,9 % | Kleine, oft übersehene Themen verursachen hohe Reibung | ADAC Pannenstatistik 2025 [5] |
| Anteil Motor/Motorelektronik an Pannen | 22,1 % | Technische Zustandsprobleme bleiben ein relevanter Kosten- und Risikotreiber | ADAC Pannenstatistik 2025 [5] |
| Umfang der ADAC-Autokostenrechnung | rund 1.200 Modelle, 5 Jahre, 75.000 km | Fahrzeugkosten sind komplex und gehen weit über Tanken hinaus | ADAC Autokostenübersicht [4] |

### Was diese Zahlen zusammen bedeuten

CarMan adressiert keinen Nischenfall. Die App setzt an einem sehr großen privaten Markt an, in dem Fahrzeuge lange gehalten, regelmäßig genutzt und später häufig privat weiterverkauft werden. Genau in dieser Kombination aus laufenden Kosten, Wartungsrisiko und Wiederverkaufsrelevanz liegt die wirtschaftliche Begründung der App.

---

## 4. Das reale Nutzerproblem

Die meisten Fahrzeughalter führen keine saubere, laufende Fahrzeugakte. Stattdessen liegen Informationen verteilt über:

- Kontoauszüge
- Papierbelege
- Werkstattrechnungen
- Kalender oder Erinnerungs-Apps
- das eigene Gedächtnis

Im Ergebnis entstehen typische Alltagsprobleme:

- Monatliche und jährliche Fahrzeugkosten bleiben unscharf.
- Wartungen, Reifenwechsel, HU oder andere Fristen werden nicht systematisch verfolgt.
- Bei Verkauf oder Rückfragen fehlen Belege und Nachweise.
- Rückwirkende Ordnung kostet mehr Zeit als laufende Pflege.

Das Problem ist damit nicht nur finanziell, sondern auch organisatorisch.

---

## 5. Zielgruppen und Jobs-to-be-done

### Primäre Zielgruppen

#### 1. Alltagsfahrer mit Kostenfokus

- besitzt meist ein Fahrzeug
- will wissen, was das Auto real kostet
- braucht eine einfache, schnelle Erfassung

#### 2. Mehrfahrzeug-Haushalte

- verwalten zwei oder mehr Fahrzeuge
- haben höheren Bedarf an Struktur und Überblick
- sind wahrscheinlicher bereit, für Komfort zu zahlen

#### 3. Dokumentationsorientierte Halter

- achten auf Werterhalt und Nachweise
- wollen Historie, Belege und Reparaturen sauber ablegen

### Zentrale Jobs-to-be-done

1. Hilf mir, alle fahrzeugbezogenen Kosten an einem Ort zu sehen.
2. Hilf mir, nichts Wichtiges am Fahrzeug zu vergessen.
3. Hilf mir, Nachweise und Belege schnell wiederzufinden.
4. Hilf mir, mein Fahrzeug beim Verkauf besser belegen zu können.
5. Hilf mir, im Alltag schnell zu erfassen, ohne Verwaltungsaufwand zu erzeugen.

---

## 6. Funktionelle Anforderungen der App für V1

Die folgenden Anforderungen beschreiben das Zielbild der ersten Version klar und prüfbar.

### FR-01 Konto und Zugang

- Die App soll eine Registrierung und Anmeldung per E-Mail und Passwort unterstützen.
- Die App soll pro Nutzer ein persönliches Profil mit Basisdaten bereitstellen.
- Die App soll geschützte Bereiche nur für angemeldete Nutzer zugänglich machen.

### FR-02 Fahrzeugverwaltung

- Die App soll Fahrzeugprofile mit Kern- und optionalen Detaildaten erfassen und verwalten.
- Die App soll das Bearbeiten und Löschen von Fahrzeugen ermöglichen.
- Die App soll eine Mehrfahrzeug-Verwaltung tarifabhängig unterstützen.

### FR-03 Kosten- und Tankerfassung

- Die App soll Kosten in standardisierten Kategorien erfassen.
- Die App soll Tankvorgänge mit Datum, Betrag, Menge und Preis pro Liter erfassen.
- Die App soll Kosten nach Fahrzeug, Zeitraum und Kategorie filterbar anzeigen.

### FR-04 Wartung und Erinnerungen

- Die App soll Erinnerungen nach Datum, Kilometerstand oder kombiniertem Trigger verwalten.
- Die App soll offene und erledigte Erinnerungen klar unterscheiden.
- Die App soll relevante Fristen und ausstehende Aufgaben übersichtlich darstellen.

### FR-05 Dokumentation und Nachweise

- Die App soll Notizen und Belege zu Kosten oder Fahrzeugereignissen speichern.
- Die App soll pro Fahrzeug eine nachvollziehbare Historie aufbauen.
- Die App soll die Nachweisführung für Verkauf, Rückfragen oder Werkstattkontext erleichtern.

### FR-06 Dashboard und Transparenz

- Die App soll zentrale Kennzahlen zu Kosten und offenen Punkten auf einen Blick zeigen.
- Die App soll zeitliche Kostenverläufe verständlich visualisieren.
- Die App soll schnelle Navigation in die relevanten Detailbereiche unterstützen.

### FR-07 Export und Tarife

- Die App soll Datenexporte in mindestens einem standardisierten Format unterstützen.
- Die App soll eine klare Free-/Pro-Logik abbilden.
- Die App soll Pro-Mehrwerte als Komfort- und Effizienzgewinn erkennbar machen.

### FR-08 Sprache, Datenschutz und Sicherheit

- Die App soll mindestens Deutsch und Englisch unterstützen.
- Die App soll personenbezogene Daten strikt nutzerbezogen absichern.
- Die App soll sensible Dokumente und Medien geschützt bereitstellen.

---

## 7. Warum die Lösung sinnvoll ist

CarMan ist vor allem deshalb plausibel, weil es drei bisher getrennte Bedürfnisse in einem Produkt bündelt:

### 1. Kostenklarheit

Die laufenden Kosten eines Fahrzeugs sind schwer intuitiv zu überblicken. Der ADAC macht ausdrücklich darauf aufmerksam, dass nicht nur Verbrauch und Anschaffung zählen, sondern auch Versicherung, Steuer, Werkstatt, Reifen und vor allem Wertverlust.[4]

### 2. Wartungs- und Zustandsmanagement

Die Pannenstatistik zeigt, dass selbst vermeintlich kleine oder unspektakuläre Themen wie die Starterbatterie enorme praktische Relevanz haben.[5] Für Nutzer bedeutet das: Regelmäßige Erinnerung und Zustandsorientierung stiften echten Alltagsnutzen.

### 3. Historie und Nachweise

Bei 6,03 Millionen privaten Besitzumschreibungen im Jahr ist eine nachvollziehbare Fahrzeughistorie kein Sonderfall, sondern alltäglicher Marktstandard auf Käuferseite.[2] Wer Belege und Reparaturnachweise sauber vorhalten kann, senkt Unsicherheit und stärkt Vertrauen.

---

## 8. Kritische Einordnung

Nicht jede gute Idee gehört sofort in Version 1.

### Was stark ist

- Der Markt ist groß und privat geprägt.
- Das Problem ist wiederkehrend.
- Der Nutzen ist sofort verständlich.
- Die Lösung passt zu realen Alltagsabläufen.

### Was kritisch bleibt

- Manuelle Dateneingabe ist verhaltenspsychologisch anspruchsvoll.
- Zu viele Funktionen am Anfang würden den Nutzen verwässern.
- KI-Funktionen sind kommunikativ attraktiv, aber als Startversprechen riskant.

### Daraus folgt

Die stärkste V1-Positionierung lautet nicht „smarte Auto-KI“, sondern „endlich Ordnung und Klarheit rund ums eigene Fahrzeug“.

---

## 9. Nutzwertanalyse für den V1-Scope

### Bewertungslogik

Bewertet wurden die Funktionen nach sechs Kriterien:

- Nutzerwert / Problemnähe: 30
- Nutzungshäufigkeit / Wiederkehr: 20
- Monetarisierungspotenzial: 15
- Differenzierungspotenzial: 15
- Umsetzbarkeit in früher Phase: 10
- Daten- und Betriebsrisiko: 10

Bewertungsskala: 1 bis 5. Der Gesamtwert ist auf 100 normiert.

### Ergebnis

| Funktion | Score | Einordnung |
|---|---:|---|
| Wartung, Reparaturen und Erinnerungen | 88 | zentraler V1-Kern |
| Manuelle Kosten- und Tankerfassung | 86 | zentraler V1-Kern |
| Dokumentation mit Belegen und Notizen | 82 | klarer Nutzwert- und Vertrauenshebel |
| Dashboard mit Kostenübersicht und offenen Punkten | 79 | wichtig für Transparenz und Wiederkehr |
| Export und Nachweisfunktionen | 73 | guter Premium-Hebel |
| Mehrfahrzeug-Verwaltung | 71 | stark für Haushalte und Pro-Tarif |
| OCR-gestützte Belegerfassung | 76 | wertvoll, aber nicht zwingend Tag 1 |
| GPS-Fahrtenbuch | 56 | sinnvoll für Teilzielgruppen, aber zu komplex für V1 |
| OBD2-Integration | 49 | attraktiv, aber support- und hardwarelastig |
| KI-Prognosen für Kosten oder Wartung | 44 | erst mit stabiler Datenbasis überzeugend |

### Interpretation

#### Gehört in V1

- Fahrzeugprofile
- Kosten- und Tankerfassung
- Wartungshistorie und Erinnerungen
- Dashboard für Überblick
- Dokumentation mit Nachweisen

#### Eignet sich früh als Ausbau oder Premium-Hebel

- Export
- Mehrfahrzeug-Verwaltung
- OCR für Belege

#### Sollte bewusst später kommen

- GPS-Fahrtenbuch
- OBD2
- komplexe KI-Prognosen

---

## 10. Einordnung der KI-Themen

KI ist in diesem Produkt sinnvoll, aber nicht als Hauptbegründung für den Start.

### Sinnvolle KI-Roadmap

#### KI-THEMA 1: OCR für Belege

- direkter, messbarer Komfortgewinn
- senkt Erfassungsfriktion
- gut als Pro-Mehrwert denkbar

#### KI-THEMA 2: Kategorisierungsvorschläge

- leichter zu erklären als Prognosemodelle
- erhöht Konsistenz ohne hohe Vertrauenshürde

#### KI-THEMA 3: Auffällige Kostenmuster

- sinnvoll, wenn bereits genug Historie vorliegt
- eher Assistenz als „intelligente Wahrheit“ kommunizieren

#### KI-THEMA 4: Proaktive Wartungshinweise

- langfristig attraktiv
- braucht aber belastbare Nutzungshistorie und nachvollziehbare Erklärlogik

### Was nicht als Startversprechen taugt

- abstrakte KI-Prognosen ohne Datenbasis
- schwer erklärbare predictive maintenance claims
- überhöhte Automatisierungsversprechen, die das eigentliche Problem überdecken

---

## 11. Empfehlung für die Produktkommunikation

### Gute Tonalität

CarMan sollte als pragmatischer Alltagshelfer kommuniziert werden:

- verständlich
- verlässlich
- datenschutzsensibel
- ohne Technikshow

### Schlechte Tonalität

Nicht ratsam sind kommunikative Übertreibungen wie:

- „KI revolutioniert Ihre Fahrzeughaltung“
- „Nie wieder Werkstattprobleme“
- „Die App weiß, was Ihr Auto morgen braucht“

Solche Aussagen schaffen mehr Erwartungsdruck als echten Nutzen.

---

## 12. Schlussfolgerung

CarMan ist als V1 sinnvoll, wenn der Fokus klar bleibt:

- nicht maximale Feature-Breite
- nicht frühe KI-Inszenierung
- sondern ein sauberer Kern aus Kosten, Wartung, Erinnerung und Nachweis

Die stärkste Produktthese lautet daher:

Private Fahrzeughalter brauchen kein komplexes Flotten- oder Telematiksystem, sondern ein einfaches, vertrauenswürdiges Werkzeug, das aus verstreuten Fahrzeuginformationen einen klaren Überblick für den Alltag macht.

---

## 13. Quellenverzeichnis

[1] Kraftfahrt-Bundesamt: Bestand – Zahlen zum 1. Januar 2024 im Überblick. https://www.kba.de/DE/Statistik/Fahrzeuge/Bestand/bestand_node.html. Abruf: 08.04.2026.

[2] Kraftfahrt-Bundesamt: Besitzumschreibungen – Zahlen des Jahres 2023 im Überblick. https://www.kba.de/DE/Statistik/Fahrzeuge/Besitzumschreibungen/besitzumschreibungen_node.html. Abruf: 08.04.2026.

[3] Deutsche Automobil Treuhand: DAT Report 2026 / DAT News. https://www.dat.de/report/ und https://www.dat.de/news/dat-report-2026/. Abruf: 08.04.2026.

[4] ADAC: Übersicht Autokosten aller Modelle von A bis Z. https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/autokosten/uebersicht/. Abruf: 08.04.2026.

[5] ADAC: Pannenstatistik 2025 – Die Gewinner und Verlierer. https://www.adac.de/rund-ums-fahrzeug/unfall-schaden-panne/adac-pannenstatistik/. Abruf: 08.04.2026.


