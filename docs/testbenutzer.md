# CarMan � Testbenutzer

> Diese Benutzer werden automatisch per Seed-Skript in der lokalen Supabase-Instanz angelegt.
> Passw�rter sind nur f�r die Testumgebung vorgesehen.

---

## Automatische Einrichtung

### Standard-Einrichtung (inkl. Seed)


Der Befehl setzt die lokale Datenbank aus Migrationen neu auf und spielt danach automatisch Testdaten ein:
- zwei Auth-Benutzer (Free/Pro)
- Profile inkl. Abo-Stufe
- Beispiel-Fahrzeuge
- Beispiel-Kosten
- Beispiel-Servicetermine

### Nur Testdaten neu einspielen (ohne Reset) 
Optional: if needed
```bash
npm run db:seed:testdata
```

Das Seeding ist idempotent: Die beiden Testkonten werden aktualisiert, nicht dupliziert.


---

## Seed-Testbenutzer

| E-Mail | Passwort | Anzeigename | Zweck |
|---|---|---|---|
| `free@testBenutzer.local` | `Test1234!` | Anna Testfahrerin | Nutzerin im Free-Tarif (1 Fahrzeug) |
| `pro@testBenutzer.local` | `Test1234!` | Max Profifahrer | Nutzer im Pro-Tarif (mehrere Fahrzeuge) |

Der Pro-Benutzer wird beim Seeding automatisch auf `pro` gesetzt, der Free-Benutzer bleibt `free`.

Zusatz f�r Auswertungen: Das Seed-Skript erzeugt f�r alle Fahrzeuge eine realistische Kostenhistorie �ber die letzten 24 Monate, damit Verlaufsgrafiken und Durchschnittsberechnungen direkt testbar sind.

---

## Persistenz bei Docker Stop/Start

- Normales Docker/Supabase-Stoppen und -Starten beh�lt die Daten (lokale Volumes).
- Testdaten gehen nur bei explizitem Reset/Neuaufbau verloren.
- Falls n�tig, jederzeit wiederherstellen mit `npm run db:seed:testdata`(wenn Testdaten bereits vorliegen, nicht ausführen).

---

## Testszenarien

### Free-Benutzer: `free@testBenutzer.local`

| Szenario | Erwartetes Ergebnis |
|---|---|
| Anmeldung mit `free@testBenutzer.local` / `Test1234!` | Erfolgreiche Anmeldung, Weiterleitung zu /dashboard |
| Fahrzeug anlegen | Erstes Fahrzeug kann angelegt werden |
| Zweites Fahrzeug anlegen | Wird blockiert mit Upgrade-Hinweis |
| Kosten erfassen (Tanken, Wartung, Fixkosten) | Funktioniert ohne Limit |
| Kostenposition �ffnen (/costs/[id]) | Detailseite zeigt Betrag, Fahrzeug, Kommentare und Rechnungsbereich |
| Kommentar zu Kostenposition speichern | Kommentar erscheint direkt in der Detailseite |
| Rechnung hochladen (PDF/Bild) | Dokument wird am Kosteneintrag hinterlegt und kann ge�ffnet werden |
| Servicetermin erstellen | Funktioniert |
| Dashboard anzeigen | Zeigt Zusammenfassung des einen Fahrzeugs |
| Dashboard Kostenverlauf gro� | Kategorien/Fahrzeuge/Zeitraum lassen sich filtern, Summen reagieren dynamisch |
| Fahrzeugdetails bearbeiten | Kopfdaten und Detailfelder k�nnen gespeichert werden |
| Fahrzeugkommentar speichern | Kommentar erscheint im Fahrzeugprofil |
| Fahrzeugbild hochladen | Bild erscheint in der Fahrzeuggalerie |
| Export aufrufen (/export) | Zeigt Upgrade-Hinweis, kein Download m�glich |
| Einstellungen ? Abo | Zeigt "Free" mit Upgrade-Hinweis |

### Pro-Benutzer: `pro@testBenutzer.local`

| Szenario | Erwartetes Ergebnis |
|---|---|
| Anmeldung mit `pro@testBenutzer.local` / `Test1234!` | Erfolgreiche Anmeldung, Weiterleitung zu /dashboard |
| Mehrere Fahrzeuge anlegen | Kein Limit |
| Kosten f�r verschiedene Fahrzeuge erfassen | Funktioniert, Zuordnung korrekt |
| Kosten-Detailseiten inkl. Dokumentation | Kommentare und Rechnungen pro Eintrag verf�gbar |
| Servicetermine f�r alle Fahrzeuge | Funktioniert |
| Dashboard | Zeigt �bersicht �ber alle Fahrzeuge |
| Dashboard Kostenverlauf gro� | Kategorien/Fahrzeuge/Zeitraum steuerbar mit Monatsaufl�sung |
| Fahrzeugprofil bearbeiten | �nderungen an Stammdaten und Details bleiben erhalten |
| Fahrzeugbilder/Galerie | Mehrere Bilder pro Fahrzeug dokumentierbar |
| Export (/export) | CSV-Download funktioniert |
| Filter auf Kosten-Seite | Fahrzeug- und Kategoriefilter korrekt |
| Einstellungen ? Abo | Zeigt "Pro"-Kennzeichnung |

---

## Enthaltene Seed-Daten (Kurz�bersicht)

**Free-Benutzerin (Anna):**
- 1 Fahrzeug: VW Golf, 2019, Benzin, B-AB 1234, 45.000 km
- Kaufpreis hinterlegt: 17.200 EUR (Kaufdatum 16.05.2023)
- 24 Monate Kostenhistorie mit wiederkehrenden und variablen Kosten (u. a. Tanken, Versicherung, Wartung, Parken)
- Kommentare und Rechnungsdokumente f�r ausgew�hlte Kostenpositionen
- 2 Servicetermine (T�V, Reifenwechsel)

**Pro-Benutzer (Max):**
- 2 Fahrzeuge: BMW 320d, 2020, Diesel + Tesla Model 3, 2022, Elektro
- Kaufpreise hinterlegt: 28.900 EUR (BMW) und 39.990 EUR (Tesla)
- 24 Monate Kostenhistorie pro Fahrzeug mit saisonalen Schwankungen und mehreren Kategorien (Tanken/Laden, Wartung, Steuer, Versicherung, Reparatur, Parken, Sonstiges)
- Kommentare und Rechnungsdokumente f�r ausgew�hlte Kostenpositionen
- 3+ Servicetermine
- Exportpr�fung mit verschiedenen Datumsbereichen


