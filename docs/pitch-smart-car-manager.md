# CarMan - Pitch und Entscheidungsvorlage

Version: 1.1
Stand: 2026-04-08
Zweck: Entscheidungsvorlage fuer den Projektstart

---

## Das Wesentliche auf einen Blick

| Bereich | Inhalt |
|---|---|
| Produkt | Mobile-first App fuer private Fahrzeugkosten, Wartung und Belege |
| Zielgruppe | Privatpersonen und Mehrfahrzeug-Haushalte im DACH-Raum |
| Modell | Freemium: kostenloser Einstieg, Pro fuer Komfort und Mehrfahrzeug |
| Plattform | iOS und Android (React Native / Expo) |
| Backend | Supabase |
| Web-Hub | Next.js fuer Landing, Admin und Support |

---

## 1. Das Problem

Viele private Autofahrer wissen nicht, was ihr Fahrzeug wirklich kostet.

Belege verschwinden, Wartungen werden vergessen und beim Verkauf fehlt oft eine saubere Historie.
In Mehrfahrzeug-Haushalten ist die Uebersicht besonders schwierig.

Ergebnis: unnoetige Kosten, vermeidbare Reparaturen und kein belastbarer Fahrzeuglebenslauf.

---

## 2. Die Gelegenheit

### Markt ist gross und wiederkehrend

- In Deutschland gibt es ueber 50 Millionen zugelassene Fahrzeuge.
- Rund 37 Millionen Privathaushalte besitzen mindestens ein Auto.
- Die laufenden Kosten sind hoch, aber selten transparent dokumentiert.

### Markt ist fragmentiert

Bestehende Wettbewerber loesen Teilprobleme:

| Produkt | Schwerpunkt | Schwaeche |
|---|---|---|
| Drivvo | Kraftstoff und Kostenlog | Kein klarer DACH-Fokus |
| Spritmonitor / Fuelly | Verbrauchsvergleich | Eher Community als Assistent |
| Driversnote | Fahrtenbuch und Steuer | Kein ganzheitlicher Fahrzeugblick |
| AUTOsist | Flottenmanagement | B2B-lastig |

Die Luecke: Eine einfach nutzbare, private und DSGVO-sensible Gesamtloesung fuer Kosten, Wartung, Dokumentation und Nachweis.

---

## 3. Die Loesung: CarMan

Positionierung:

"Das digitale Fahrzeugarchiv und Kostenassistent fuer private Autofahrer - damit du immer weisst, was dein Auto kostet, wann Wartung faellig ist und was du beim Verkauf nachweisen kannst."

### Was die App leistet

| Nutzerproblem | CarMan-Loesung |
|---|---|
| Ich kenne meine monatlichen Kosten nicht | Kosten-Dashboard mit Trend |
| Ich vergesse Wartung und Termine | Erinnerungen nach Datum und Kilometerstand |
| Belege kosten Zeit | Strukturierte Erfassung und spaeter OCR-Ausbau |
| Mir fehlt eine Historie beim Verkauf | Exportierbarer Fahrzeuglebenslauf |
| Mehrere Autos sind unuebersichtlich | Gemeinsame Verwaltung mit Pro |

---

## 4. Zielgruppe

### Primaere Zielgruppe

- Alltagsfahrer mit Kostenbewusstsein
- Mehrfahrzeug-Haushalte
- Dokumentationsorientierte Nutzer

### Spaetere Erweiterung

- Pendler und Selbststaendige mit Fahrtenbuchbedarf
- EV-Fahrzeughalter mit Ladekosten-Tracking

---

## 5. Geschaeftsmodell

| Funktion | Free | Pro |
|---|---|---|
| Fahrzeuge | 1 | Unbegrenzt |
| Kosten, Wartung, Erinnerungen | Ja | Ja |
| Basis-Dashboard | Ja | Ja |
| OCR-Belegscan | Nein | Ja |
| Export (CSV/PDF) | Nein | Ja |
| Family-Sharing | Nein | Ja |
| Erweiterte Analysen | Nein | Ja |

Preislogik: Ein einfaches Pro-Abonnement (monatlich oder jaehrlich), ohne Werbedruck und ohne Datenlimit im Free-Einstieg.

---

## 6. Produktkern V1

### In Scope

- Onboarding und Fahrzeugprofil
- Kosten- und Tankerfassung
- Wartungs- und Reparaturlog
- Fixkosten
- Erinnerungen
- Kosten- und Verbrauchsdashboard
- CSV-Export (Pro)

### Bewusst nicht in V1

| Funktion | Grund |
|---|---|
| GPS-Fahrtenbuch | Zu komplex fuer MVP |
| OBD2-Integration | Hardware-Abhaengigkeit |
| Predictive Maintenance | Braucht laengere Datengrundlage |
| KI-Prognosen | Erst sinnvoll nach stabiler Nutzung |
| B2B-Flottenlogik | Eigenes Produktsegment |

---

## 7. Warum jetzt

- Hoher Kostendruck im Alltag
- Mehr DSGVO-Bewusstsein im DACH-Raum
- Reife technische Basis (Supabase, CI/CD, bestehendes Web-Hub)

---

## 8. Technische Zielarchitektur

```text
+-----------------------------------------------+
| Mobile App (V1)                               |
| React Native / Expo                           |
| iOS + Android                                 |
| Offline-faehige Erfassung                     |
+------------------------------+----------------+
                               |
+------------------------------v----------------+
| Supabase Backend                               |
| PostgreSQL, Auth, Storage, RLS, Migrations     |
+------------------------------+----------------+
                               |
+------------------------------v----------------+
| Web-Hub (bestehendes Repo)                     |
| Next.js, Vercel, Landing, Admin, Support       |
+-----------------------------------------------+
```

---

## 9. Risiken und Gegenmassnahmen

| Risiko | Bewertung | Gegenmassnahme |
|---|---|---|
| Niedrige Langzeitnutzung | Hoch | Niedrige Eingabereibung und schneller Nutzen |
| OCR-Datenschutz | Mittel | Datenschutzkonformes Design und Opt-in |
| App-Store-Gebuehren | Mittel | Jahresabo-Option ueber Web |
| Wettbewerbsdruck | Mittel | DACH-Positionierung und klare UX |
| Plattformkomplexitaet | Mittel | Expo-basierter Start |

---

## 10. Entscheidungsbedarf vor Start

1. Zielmarkt finalisieren: breiter B2C-Fokus oder Nische.
2. Plattformprioritaet bestaetigen: Mobile-first.
3. V1-Scope fixieren.
4. Free/Pro-Grenze final freigeben.
5. OCR-Strategie bestimmen: Cloud oder On-Device.

---

## 11. Empfohlene naechste Schritte

1. Entscheidungen dokumentieren.
2. MVP-Benutzerablaeufe fuer Kernszenarien skizzieren.
3. Datenmodell V1 finalisieren.
4. Datenschutzkonzept fuer OCR und Fahrzeugdaten ausarbeiten.
5. React-Native-Projekt mit bestehendem Backend verbinden.
6. Rechtstexte fuer B2C finalisieren.





