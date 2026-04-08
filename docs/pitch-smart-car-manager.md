# CarMan — Pitch & Entscheidungsvorlage

**Version:** 1.0  
**Stand:** 2026-04-08  
**Zweck:** Entscheidungsvorlage für den Projektstart

---

## Das Wesentliche auf einen Blick

| | |
|---|---|
| **Produkt** | Mobile-first App für private Fahrzeugkosten, Wartungen und Belege |
| **Zielgruppe** | Privatpersonen, Mehrfahrzeug-Haushalte, DACH-Raum |
| **Modell** | Freemium — kostenlos nutzbar, Premium für Komfort und Mehrfahrzeug |
| **Plattform** | iOS + Android (React Native / Expo) |
| **Backend** | Supabase (bestehend) |
| **Webportal** | Next.js (bestehend) für Landing, Admin, Support |

---

## 1. Das Problem

Die meisten privaten Autofahrer wissen nicht, was ihr Fahrzeug sie wirklich kostet.

Tankbelege verschwinden. Wartungstermine werden vergessen. Werkstattrechnungen liegen verstreut. Beim Autoverkauf fehlt jede dokumentierte Historie. In Mehrpersonen-Haushalten mit zwei Fahrzeugen gibt es keinen gemeinsamen Überblick.

Das Ergebnis: unnötige Kosten, vermeidbare Reparaturen, kein verwertbarer Fahrzeuglebenslauf.

> Kein Haushalt hat ein echtes Gegenmittel. Spreadsheets sind zu aufwändig. Papier geht verloren. Vorhandene Apps sind zu spezialisiert oder zu komplex.

---

## 2. Die Gelegenheit

### Markt ist groß und wiederkehrend

- In Deutschland gibt es über 50 Millionen zugelassene Fahrzeuge.
- Rund 37 Millionen Privathaushalte in Deutschland besitzen mindestens ein Auto.
- Jahreskosten für ein Durchschnittsfahrzeug liegen bei 3.000 bis 6.000 EUR — Kosten, die kaum jemand vollständig überblickt.

### Markt ist fragmentiert, nicht gesättigt

Bestehende Wettbewerber lösen Teilprobleme:

| Produkt | Schwerpunkt | Schwäche |
|---|---|---|
| Drivvo | Kraftstoff- und Kostenlog | App-Erlebnis, kein USP für DACH |
| Spritmonitor / Fuelly | Verbrauchsvergleich | Community-Tool, kein Assistent |
| Driversnote | Fahrtenbuch / Steuer | nur ein Teilproblem |
| AUTOsist | Flottenmanagement | B2B, nicht für Privatnutzer |

**Die Lücke:** Eine reibungsarme, mobile Kombination aus Kosten, Wartung, Belegen und Nachweis für private Autofahrer — mit echtem Alltagskomfort, DSGVO-Vertrauen und einem sauberen digitalen Fahrzeuglebenslauf — ist nicht klar besetzt.

---

## 3. Die Lösung: CarMan

**Positionierung:**

> „Das digitale Fahrzeugarchiv und Kostenassistent für private Autofahrer — damit du immer weißt, was dein Auto kostet, wann Wartung fällig ist und was du beim Verkauf nachweisen kannst."

### Was die App leistet

Die App löst fünf konkrete Alltagsprobleme:

| Nutzerproblem | App-Lösung |
|---|---|
| Ich weiß nicht, was mein Auto pro Monat kostet | Automatisches Kosten-Dashboard mit Verbrauch und Trend |
| Ich vergesse Wartungen und TÜV-Termine | Intelligente Erinnerungen nach Datum und Kilometerstand |
| Belege erfassen kostet zu viel Zeit | OCR-Scan: Foto → fertig ausgefülltes Formular |
| Ich habe keine Dokumentation für den Verkauf | Exportierbarer Fahrzeuglebenslauf als PDF |
| Mehrere Autos im Haushalt sind unübersichtlich | Gemeinsame Übersicht mit Family-Sharing |

---

## 4. Zielgruppe

### Primäre Zielgruppe

**Private Fahrzeughalter im DACH-Raum** — insbesondere:

- **Alltagsfahrer mit Kostenbewusstsein**  
  1 Fahrzeug, möchten endlich Transparenz, brauchen minimalen Aufwand. Free-Nutzer.

- **Mehrfahrzeug-Haushalte**  
  2+ Fahrzeuge, gemeinsame Verwaltung, Family-Sharing gewünscht. Pro-Nutzer.

- **Dokumentierer und Enthusiasten**  
  Detailstatistiken, Wartungshistorie, Fahrzeuglebenslauf. Pro-Nutzer.

### Spätere Erweiterung

- Pendler und Selbstständige mit Fahrtenbuchbedarf
- EV-Fahrzeughalter mit Ladekosten-Tracking

---

## 5. Geschäftsmodell

### Freemium — klar abgegrenzt

| | **Free** | **Pro** |
|---|---|---|
| Fahrzeuge | 1 | Unbegrenzt |
| Kosten, Wartung, Erinnerungen | ✅ Vollständig | ✅ Vollständig |
| Basis-Dashboard | ✅ | ✅ |
| OCR-Belegscan | — | ✅ |
| PDF-/CSV-Export, Verkaufsnachweis | — | ✅ |
| Family-Sharing, Mehrgeräte-Sync | — | ✅ |
| Erweiterte Berichte und Analysen | — | ✅ |
| Fahrtenbuch (V2) | nur privat | Dienstlich/privat + Export |
| OBD2-Integration (V2) | — | ✅ |

**Preislogik:** Ein einfaches Pro-Abonnement, monatlich oder jährlich. Keine Dateneintragslimits, keine Werbung. Pro monetarisiert Komfort — nicht Basiszugang.

> Die Nutzungsgewohnheit entsteht im Free-Bereich. Wenn der Datenberg wächst, wird Pro self-evident.

---

## 6. Produktkern Version 1

### Scope — was in V1 drin ist

V1 beantwortet eine klare Frage:

> „Wie halte ich meine Fahrzeugkosten, Wartungen und Belege mit minimalem Aufwand sauber im Griff?"

| Feature | Tier |
|---|---|
| Schnelles Onboarding, Fahrzeugprofil anlegen | Free + Pro |
| Tank- und Kostenerfassung (manuell, offline-fähig) | Free + Pro |
| Wartungs- und Reparaturlog | Free + Pro |
| Fixkosten (Versicherung, Steuer, Leasing) | Free + Pro |
| Erinnerungen (Datum + Kilometerstand) | Free + Pro |
| Kosten- und Verbrauchsdashboard | Free + Pro |
| OCR-Belegscan (Kamera → automatisch befüllt) | Pro |
| PDF-/CSV-Export, Fahrzeug-Nachweis | Pro |

### Scope — was in V1 bewusst nicht drin ist

| Feature | Begründung |
|---|---|
| GPS-Fahrtenbuch | Zu komplex für MVP, DSGVO-Aufwand hoch |
| OBD2-Integration | Nischenmarkt, Hardware-Abhängigkeit |
| Predictive Maintenance | Funktioniert erst mit großer Datenbasis |
| Kostenprognosen (KI) | Erst belastbar nach 6–12 Monaten Nutzungsdaten |
| Flottenlogik / B2B | Anderes Produkt, anderer Vertrieb |

---

## 7. Warum jetzt, warum dieses Team

### Marktmoment

- Kraftstoffkosten und allgemeiner Kostendruck machen Fahrzeugtransparenz zu einem Alltagsthema.
- DSGVO-Bewusstsein wächst — Nutzer im DACH-Raum vertrauen einer europäischen Lösung mehr.
- KI-basierte OCR ist heute günstig und stabil genug für ein B2C-Consumer-Produkt.

### Technischer Vorsprung

- Grundinfrastruktur vorhanden: Supabase-Backend, CI/CD, Vercel-Deployment, DSGVO-Vorlage
- TypeScript-Stack kann für React Native wiederverwendet werden
- Bestehende GitHub- und Deployment-Pipelines laufen bereits

---

## 8. Technische Zielarchitektur

```
┌─────────────────────────────────┐
│      Mobile App (V1)             │
│  React Native / Expo             │
│  iOS + Android                   │
│  Offline-fähig                   │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│         Supabase Backend         │
│  PostgreSQL · Auth · Storage     │
│  RLS · Migrations · Edge Fns     │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│    Web-Hub (bestehendes Repo)    │
│  Next.js · Vercel                │
│  Landing · Admin · Support       │
│  Report-Ansichten (Web)          │
└─────────────────────────────────┘
```

Das bestehende Next.js-Repository ist der Web-Hub — nicht die primäre Endnutzer-App. Produktentwicklung startet mit React Native / Expo.

---

## 9. Risiken und Gegenmaßnahmen

| Risiko | Bewertung | Maßnahme |
|---|---|---|
| Adoption: Nutzer pflegen keine App langfristig | Hoch | Minimale Eingabe-Friktion, klarer Sofortnutzen |
| OCR Datenschutz (personenbezogene Drittdaten) | Mittel | DSGVO-konformes OCR-Design, lokale Verarbeitung prüfen, Opt-in |
| App-Store-Gebühren reduzieren Marge | Mittel | Jahresabo via Web günstiger anbieten (30 % Provision umgehen) |
| Wettbewerber mit starkem Free-Angebot (Drivvo) | Mittel | Stärkere DACH-Positionierung, besseres UX, Nachweis-USP |
| Plattform-Komplexität (iOS + Android) | Mittel | Expo-basiertes Managed Workflow reduziert initialen Aufwand |
| OBD2/Fahrzeughersteller schränken Datenzugang ein | Niedrig | Für V1 irrelevant, für V2 als Risiko bewerten |

---

## 10. Entscheidungsbedarf

Folgende Entscheidungen sind vor Entwicklungsstart zu treffen:

### ① Zielmarkt — Breite oder Tiefe?

- **Option A (empfohlen):** B2C breiter Privatmarkt, DACH-Fokus
- **Option B:** Fahrtenbuch-/Berufsfahrer-Nische, höhere Zahlungsbereitschaft, engerer Markt

### ② Plattformprioritaet

- **Option A (empfohlen):** Mobile-first mit React Native / Expo; Web-Hub aus bestehendem Next.js-Repo
- **Option B:** Web-App zuerst aus bestehendem Repo; Mobile später
- **Option C:** Flutter (mehr Plattformkontrolle, größerer Technologiebruch)

### ③ V1-Scope final freigeben

- Liegt als Tabelle in Abschnitt 6 vor
- Entscheidung: vollständig freigeben oder einzelne Features streichen / hinzufügen?

### ④ Free/Pro-Grenze

- **Option A (empfohlen):** 1 Fahrzeug frei, kein Datenlimit, Pro = Komfort + Mehrfahrzeug
- **Option B:** Dateneintragslimit im Free-Bereich (bremst Gewohnheitsbildung)

### ⑤ OCR: Cloud oder On-Device?

- **Cloud-OCR:** bessere Erkennungsqualität, Datenschutzrisiko bei Drittdaten, Betriebskosten
- **On-Device-OCR:** datenschutzfreundlicher, technisch aufwändiger
- Entscheidung beeinflusst Datenschutzkonzept und Pro-Nutzenversprechen

---

## 11. Empfohlene nächste Schritte

1. **Entscheidungen aus Abschnitt 10 treffen** — schriftlich dokumentieren
2. **MVP-User-Flow** für die drei wichtigsten Szenarien skizzieren: erstes Onboarding, Tankeintrag mit OCR, Wartungserinnerung
3. **Datenmodell V1** definieren: Fahrzeuge, Kosten, Wartungen, Belege, Erinnerungen
4. **Datenschutzkonzept** für OCR und Fahrzeugdaten aufsetzen (DSGVO-Pflicht)
5. **React Native / Expo Projekt** anlegen, mit bestehendem Supabase-Backend verbinden
6. **B2C-Rechtstexte** erarbeiten (AGB, Datenschutzerklärung für Privatnutzer)

---

## Anhang: Analysegrundlage

Dieses Dokument basiert auf der vollständigen Markt- und Produktanalyse unter [docs/analyse-smart-car-manager.md](analyse-smart-car-manager.md).

Die Analyse enthält:
- Detaillierte Bedarfsanalyse mit Personas und Jobs-to-be-done
- Nutzwertanalyse aller geplanten Funktionen mit Scoring
- Wettbewerbsprofile (Drivvo, Driversnote, Spritmonitor, Fuelly, AUTOsist)
- Vollständige Lueckenanalyse
- Strategische Produktempfehlung mit Begründung
