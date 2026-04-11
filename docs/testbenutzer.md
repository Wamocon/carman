# CarMan — Testbenutzer

> Diese Benutzer werden automatisch per Seed-Skript in der lokalen Supabase-Instanz angelegt.
> Passwörter sind nur für die Testumgebung vorgesehen.

---

## Automatische Einrichtung

### Standard-Einrichtung (inkl. Seed)

Der Befehl setzt die lokale Datenbank aus Migrationen neu auf und spielt danach automatisch Testdaten ein:
- drei Auth-Benutzer (Free / Pro / Gallery)
- Profile inkl. Abo-Stufe und Galerie-Berechtigung
- Beispiel-Fahrzeuge (mit veröffentlichten Fahrzeugen und öffentlichen Bildern)
- Beispiel-Kosten
- Beispiel-Servicetermine
- Galerie-Testdaten (öffentliche Kommentare, Bild-Bewertungen, Bild-Kommentare)

### Nur Testdaten neu einspielen (ohne Reset)
```bash
npm run db:seed:testdata
```

Das Seeding ist idempotent: Die Testkonten werden aktualisiert, nicht dupliziert.

---

## Seed-Testbenutzer

| E-Mail | Passwort | Anzeigename | Tarif | Zweck |
|---|---|---|---|---|
| `free@testuser.local` | `Test1234!` | Anna Testfahrerin | Free | Nutzerin im Free-Tarif (1 Fahrzeug) |
| `pro@testuser.local` | `Test1234!` | Max Profifahrer | Pro | Nutzer im Pro-Tarif (mehrere Fahrzeuge) |
| `gallery@testuser.local` | `Test1234!` | Lisa Galerietest | Pro | Galerie-Testerin mit 3 Fahrzeugen (2 veröffentlicht) |

Der Pro- und Gallery-Benutzer werden beim Seeding automatisch auf `pro` gesetzt, der Free-Benutzer bleibt `free`. Alle drei Benutzer haben `sharing_enabled = true`, sodass Galerie-Funktionen sofort testbar sind.

Zusatz für Auswertungen: Das Seed-Skript erzeugt für alle Fahrzeuge eine realistische Kostenhistorie über die letzten 24 Monate, damit Verlaufsgrafiken und Durchschnittsberechnungen direkt testbar sind.

---

## Persistenz bei Docker Stop/Start

- Normales Docker/Supabase-Stoppen und -Starten behält die Daten (lokale Volumes).
- Testdaten gehen nur bei explizitem Reset/Neuaufbau verloren.
- Falls nötig, jederzeit wiederherstellen mit `npm run db:seed:testdata`.

---

## Testszenarien

### Free-Benutzerin: `free@testuser.local`

| Szenario | Erwartetes Ergebnis |
|---|---|
| Anmeldung mit `free@testuser.local` / `Test1234!` | Erfolgreiche Anmeldung, Weiterleitung zu /dashboard |
| Fahrzeug anlegen | Erstes Fahrzeug kann angelegt werden |
| Zweites Fahrzeug anlegen | Wird blockiert mit Upgrade-Hinweis |
| Kosten erfassen (Tanken, Wartung, Fixkosten) | Funktioniert ohne Limit |
| Kostenposition öffnen (/costs/[id]) | Detailseite zeigt Betrag, Fahrzeug, Kommentare und Rechnungsbereich |
| Kommentar zu Kostenposition speichern | Kommentar erscheint direkt in der Detailseite |
| Rechnung hochladen (PDF/Bild) | Dokument wird am Kosteneintrag hinterlegt und kann geöffnet werden |
| Servicetermin erstellen | Funktioniert |
| Dashboard anzeigen | Zeigt Zusammenfassung des einen Fahrzeugs |
| Dashboard Kostenverlauf groß | Kategorien/Fahrzeuge/Zeitraum lassen sich filtern, Summen reagieren dynamisch |
| Fahrzeugdetails bearbeiten | Kopfdaten und Detailfelder können gespeichert werden |
| Fahrzeugkommentar speichern | Kommentar erscheint im Fahrzeugprofil |
| Fahrzeugbild hochladen | Bild erscheint in der Fahrzeuggalerie |
| Export aufrufen (/export) | Zeigt Upgrade-Hinweis, kein Download möglich |
| Einstellungen → Abo | Zeigt "Free" mit Upgrade-Hinweis |

### Pro-Benutzer: `pro@testuser.local`

| Szenario | Erwartetes Ergebnis |
|---|---|
| Anmeldung mit `pro@testuser.local` / `Test1234!` | Erfolgreiche Anmeldung, Weiterleitung zu /dashboard |
| Mehrere Fahrzeuge anlegen | Kein Limit |
| Kosten für verschiedene Fahrzeuge erfassen | Funktioniert, Zuordnung korrekt |
| Kosten-Detailseiten inkl. Dokumentation | Kommentare und Rechnungen pro Eintrag verfügbar |
| Servicetermine für alle Fahrzeuge | Funktioniert |
| Dashboard | Zeigt Übersicht über alle Fahrzeuge |
| Dashboard Kostenverlauf groß | Kategorien/Fahrzeuge/Zeitraum steuerbar mit Monatsauflösung |
| Fahrzeugprofil bearbeiten | Änderungen an Stammdaten und Details bleiben erhalten |
| Fahrzeugbilder/Galerie | Mehrere Bilder pro Fahrzeug dokumentierbar |
| Export (/export) | CSV-Download funktioniert |
| Filter auf Kosten-Seite | Fahrzeug- und Kategoriefilter korrekt |
| Einstellungen → Abo | Zeigt "Pro"-Kennzeichnung |

### Gallery-Benutzerin: `gallery@testuser.local`

| Szenario | Erwartetes Ergebnis |
|---|---|
| Anmeldung mit `gallery@testuser.local` / `Test1234!` | Erfolgreiche Anmeldung, Weiterleitung zu /dashboard |
| Dashboard anzeigen | Zeigt Übersicht über 3 Fahrzeuge (Porsche 911, Golf R, BMW M2) |
| Galerie (/gallery) öffnen | Zeigt veröffentlichte Fahrzeuge aller Benutzer mit Sharing |
| Eigene Fahrzeuge in der Galerie sehen | Porsche 911 Carrera und VW Golf R sichtbar, BMW M2 nicht (unveröffentlicht) |
| Fremde Fahrzeuge in der Galerie sehen | BMW 320d und Tesla Model 3 von Max sichtbar |
| Galerie nach Bewertung sortieren | Sortierung ändert sich korrekt (höchste zuerst / niedrigste zuerst) |
| Galerie-Fahrzeug anklicken | Detailseite mit Fahrzeugdaten, Sonderausstattung und öffentlichen Bildern |
| Öffentlichen Kommentar abgeben | Kommentar erscheint mit Anzeigename unter dem Fahrzeug |
| Bild-Detail öffnen | Bild-Detailansicht mit Beschreibung, Reaktionen und Kommentaren |
| Bild-Kommentar schreiben | Kommentar erscheint unter dem Bild |
| Heat-Smiley-Reaktion setzen | Reaktionszähler erhöht sich, eigene Reaktion wird markiert |
| Fahrzeug veröffentlichen/zurückziehen | Fahrzeug erscheint/verschwindet in der Galerie |
| Bild als öffentlich/privat markieren | Bild erscheint/verschwindet in der Galerieansicht |
| Fahrzeug-Sharing-Tab | Sharing-Einstellungen (Veröffentlichung, Social-Sharing) erreichbar |
| Bild-Einrichtung-Tab | Fokuspunkt-Editor und öffentlich/privat-Toggle pro Bild |
| Social-Media-Link teilen | Link kopierbar, öffnet Share-Dialog |

---

## Enthaltene Seed-Daten (Kurzübersicht)

**Free-Benutzerin (Anna):**
- 1 Fahrzeug: VW Golf, 2019, Benzin, B-AB 1234, 45.000 km
- Kaufpreis hinterlegt: 17.200 EUR (Kaufdatum 16.05.2023)
- 24 Monate Kostenhistorie mit wiederkehrenden und variablen Kosten (u. a. Tanken, Versicherung, Wartung, Parken)
- Kommentare und Rechnungsdokumente für ausgewählte Kostenpositionen
- 2 Servicetermine (TÜV, Reifenwechsel)

**Pro-Benutzer (Max):**
- 2 Fahrzeuge: BMW 320d, 2020, Diesel + Tesla Model 3, 2022, Elektro
- Kaufpreise hinterlegt: 28.900 EUR (BMW) und 39.990 EUR (Tesla)
- 24 Monate Kostenhistorie pro Fahrzeug mit saisonalen Schwankungen und mehreren Kategorien (Tanken/Laden, Wartung, Steuer, Versicherung, Reparatur, Parken, Sonstiges)
- Kommentare und Rechnungsdokumente für ausgewählte Kostenpositionen
- 3+ Servicetermine
- Exportprüfung mit verschiedenen Datumsbereichen
- BMW 320d und Tesla Model 3 als veröffentlicht mit öffentlichen Bildern

**Gallery-Benutzerin (Lisa):**
- 3 Fahrzeuge:
  - Porsche 911 Carrera, 2023, Benzin, S-PC 9110, 8.500 km — veröffentlicht, 2 öffentliche Bilder
  - VW Golf R, 2022, Benzin, S-GR 2220, 22.000 km — veröffentlicht, 2 öffentliche Bilder
  - BMW M2, 2024, Benzin, S-BM 2240, 3.200 km — nicht veröffentlicht, 1 privates Bild
- Kosteneinträge für alle 3 Fahrzeuge
- Öffentliche Kommentare auf Fahrzeugen anderer Benutzer
- Bild-Kommentare und Heat-Smiley-Reaktionen auf öffentlichen Bildern
- Dient als Haupttestbenutzerin für Galerie-, Sharing- und Bewertungsfunktionen
