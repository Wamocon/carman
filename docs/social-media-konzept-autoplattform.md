# CarMan Konzept: Social-Erweiterung fuer die Auto-Community

Stand: 2026-04-08

## Ziel

Pruefen, ob eine Social-Erweiterung fuer CarMan sinnvoll ist und wie sie rechtssicher sowie mit ueberschaubarem Aufwand umgesetzt werden kann.

## Kurzfazit

Eine komplette "Auto-Instagram"-Plattform als Sofortschritt ist nicht empfehlenswert.

Sinnvoll ist ein gestufter Ansatz:
1. Zuerst private Community-Naehe rund um eigene Fahrzeuge und optionale Freigaben.
2. Danach kleine, moderierte Social-Funktionen.
3. Oeffentliche Reichweiten-Funktionen erst spaeter.

So bleibt der Fokus auf dem Kernwert von CarMan: Kosten, Wartung, Erinnerungen und nachvollziehbare Dokumentation.

## Strategischer Fit

CarMan ist heute ein persoenliches Fahrzeug-Cockpit. Das ist eine gute Basis fuer Social-Funktionen:
- Es gibt strukturierte Inhalte (Kostenverlaeufe, Wartungsereignisse, Fahrzeugprofile).
- Nutzer haben wiederkehrende Ereignisse fuer Austausch.
- Der Pro-Mehrwert kann sozial erweitert werden, ohne den Kern zu verwässern.

Risiko:
- Bei zu frueher Oeffnung driftet das Produkt von Nutzen zu Unterhaltung.

## Sinnvolle Social-Use-Cases

### 1. Fahrzeug-Story (niedriges Risiko, hoher Nutzen)

Optionale Chronik pro Fahrzeug:
- Wartungs-Meilensteine
- Umbauten
- Kosten-Meilensteine
- Vorher/Nachher-Bilder

Nutzen:
- Mehr Bindung an das eigene Fahrzeug
- Hoehere Wiederkehr
- Kein externer Datenbedarf

### 2. Private Teilen-Links

Nutzer koennen einzelne Ansichten teilen:
- Fahrzeugprofil (nur Lesen)
- Kosten-/Wartungszusammenfassung
- Verkaufsvorbereitung

Nutzen:
- Praktisch fuer Familie, Werkstatt, Kaeufer
- Kein kompletter oeffentlicher Feed noetig

### 3. Modell-Communities (spaeter)

Gruppen je Modell/Baureihe:
- typische Fragen
- haeufige Probleme
- Wartungstipps
- Erfahrungswerte

Nutzen:
- Netzwerkeffekt
- Datenbasis fuer spaetere Assistenten (anonymisiert, aggregiert)

## Was ohne hohe Rechtsrisiken machbar ist

1. Private Fahrzeug-Stories mit nutzereigenen Inhalten
2. Optionale Freigabe einzelner Inhalte per Token-Link
3. Kommentare im kleinen, moderierten Kreis
4. Community-Posts nur mit Eigen-Uploads und klaren Regeln

Nicht als Erstschritt:
1. Fremdbilder ohne Lizenz
2. Unkontrolliertes Scraping als Inhaltsbasis
3. Vollstaendig oeffentliche Feeds ohne Moderationssystem

## Rechtliche Leitplanken (EU, operativ)

Keine Rechtsberatung, aber produktnahe Leitlinien:

1. Urheberrecht
- Nur eigene Uploads oder lizenzierte Assets
- Aktive Rechtebestaetigung beim Upload
- Takedown-Meldung und schnelle Entfernung

2. Markenrecht
- Markenname beschreibend erlaubt
- Keine Nutzung geschuetzter Logos oder CI ohne Freigabe

3. DSGVO
- Privacy by default: Inhalte standardmaessig privat
- Klare Sichtbarkeitsstufen (privat, geteilter Link, Community)
- Loeschung, Export und Widerruf pro Inhalt

4. Plattformpflichten
- Melde- und Moderationsprozess
- Logging fuer Missbrauchs- und Sicherheitsfaelle
- Community-Regeln mit abgestuften Sanktionen

## Produktarchitektur (Empfehlung)

### Sichtbarkeitsebenen

1. Privat (Standard)
2. Link-Shared (tokenbasiert, jederzeit widerrufbar)
3. Community (angemeldete Nutzer)
4. Oeffentlich (spaeter, optional)

### Datenmodell (grob)

- social_posts
- social_post_media
- social_comments
- social_reactions
- social_reports
- social_moderation_actions
- share_tokens

Wichtig:
- Strikte RLS je Sichtbarkeitsebene
- Keine externen Crawler auf privaten Inhalten

## Moderation und Sicherheit

MVP:
1. Melden-Button fuer Posts und Kommentare
2. Soft-Delete und Admin-Review
3. Rate-Limits pro Nutzer
4. Spam-Blockliste und einfache Heuristiken

V2:
1. Automatisierte Vorfilterung fuer Missbrauch
2. Reputation/Trust-Level fuer neue Konten

## Monetarisierungspotenzial

1. Pro-Funktion: Erweiterte Fahrzeug-Stories (mehr Medien, mehr Historie)
2. Pro-Funktion: Premium-Share-Links mit Branding und PDF-Snapshot
3. Spaeter: marktplatznahe Services (z. B. Verkaufsreport), nur bei klarer Rechts- und Datenlage

## 3-Phasen-Plan

### Phase 1: Social Light (6-8 Wochen)

Umfang:
1. Fahrzeug-Story intern (privat)
2. Teilen per Read-only-Link
3. Basis-Kommentare im eigenen Kontobereich

Erfolgskriterien:
1. Anteil Nutzer mit mindestens einem Story-Eintrag
2. Wiederkehrrate in 30 Tagen
3. Anzahl genutzter Share-Links

### Phase 2: Community Beta (8-12 Wochen)

Umfang:
1. Modell-/Baureihen-Gruppen
2. Reaktionen und Diskussionen
3. Moderation v1 plus Reporting

Erfolgskriterien:
1. Aktive Community-Nutzer pro Woche
2. Meldungsquote vs. geloeste Meldungen
3. Einfluss auf Pro-Conversion

### Phase 3: Open Social (spaeter)

Umfang:
1. Oeffentliche Profile (Opt-in)
2. Themen-Feeds
3. Ranking/Discovery

Voraussetzungen:
1. Belastbare Moderation
2. Stabile Rechts- und Datenschutzprozesse
3. Klare Produktfuehrung, damit der CarMan-Kern nicht verloren geht

## Empfehlung

Ja, Social ist sinnvoll, aber als Social Layer auf dem bestehenden CarMan-Kern.

Empfohlener Start:
1. Fahrzeug-Story plus Share-Links
2. Privat als Standard
3. Moderation und Rechteprozesse frueh aufsetzen

So steigt die Nutzernähe deutlich, ohne unnoetige rechtliche und operative Risiken einzugehen.
