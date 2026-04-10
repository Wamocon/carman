# CarMan � Implementierungsstand V1

**Stand:** 2026-04-08

---

## Getroffene Entscheidungen

| Frage | Entscheidung |
|---|---|
| Zielmarkt | Option A � B2C breiter Privatmarkt, DACH-Fokus |
| Plattform | Option B � Web-App zuerst (Next.js), Mobile sp�ter |
| V1-Scope | Wie Pitch-Tabelle, ohne OCR |
| Free/Pro-Grenze | 1 Fahrzeug frei, kein Datenlimit, Pro = Komfort + Multi-Vehicle |
| OCR | Rausgelassen f�r V1 |

---

## Implementierter Funktionsumfang

### Authentifizierung
- [x] E-Mail/Passwort-Registrierung mit Display-Name
- [x] E-Mail/Passwort-Login
- [x] Auth-Callback f�r E-Mail-Best�tigung
- [x] Session-Management �ber Supabase SSR + Middleware
- [x] Automatische Profilerstellung bei Signup (DB-Trigger)
- [x] Gesch�tzte Routen: nicht authentifizierte Nutzer ? /login

### Fahrzeugverwaltung
- [x] Fahrzeug anlegen (Marke, Modell, Baujahr, Kraftstoffart, Kennzeichen, Kilometerstand)
- [x] Fahrzeugliste mit �bersicht
- [x] Fahrzeug-Detailseite mit letzten Kosten und Servicetermine
- [x] Fahrzeug l�schen (mit Best�tigung)
- [x] Free-Limit: max. 1 Fahrzeug, Upgrade-Hinweis bei �berschreitung

### Kostenerfassung
- [x] Allgemeine Kostenerfassung (Wartung, Reparatur, Versicherung, Steuer, Leasing, Parken, Sonstiges)
- [x] Tankerfassung mit Liter und Literpreis
- [x] Kilometerstands-Tracking (automatische Aktualisierung am Fahrzeug)
- [x] Kostenliste mit Pagination (25 pro Seite)
- [x] Filter nach Fahrzeug und Kategorie

### Servicetermine
- [x] Servicetermine nach Datum, Kilometerstand oder beidem
- [x] Serviceterminsliste gruppiert nach Fahrzeug
- [x] Als erledigt markieren / wieder �ffnen
- [x] Vorauswahl Fahrzeug bei Erstellung

### Dashboard
- [x] Monatskosten aktuell und Vormonat
- [x] Fahrzeuganzahl
- [x] Offene Servicetermine
- [x] Pro-Fahrzeug-Statistiken (Gesamtkosten, Durchschnittsverbrauch)

### Export (Pro)
- [x] CSV-Export aller Kosten pro Fahrzeug und Zeitraum
- [x] Pro-Gate: Free-Nutzer sehen Upgrade-Hinweis

### Einstellungen
- [x] Anzeigename �ndern
- [x] Abo-Status anzeigen

### Infrastruktur
- [x] Supabase Server Client (SSR) + Browser Client
- [x] Middleware f�r Auth-Session-Refresh
- [x] Row-Level Security auf allen Tabellen
- [x] DB-Migration mit vollst�ndigem Schema
- [x] TypeScript Domain-Types

---

## Nicht implementiert (bewusst f�r V1 ausgeschlossen)

| Funktion | Begr�ndung |
|---|---|
| OCR-Belegscan | Entscheidung: erst in sp�terer Version |
| GPS-Fahrtenbuch | Zu komplex f�r Web-MVP |
| OBD2-Integration | Hardware-Abh�ngigkeit |
| Predictive Maintenance | Braucht Datenbasis |
| Kostenprognosen (KI) | Erst nach Datensammlung sinnvoll |
| Flottenlogik / B2B | Anderes Produkt |
| Dark Mode Toggle | Nice-to-have, Tailwind-Basis ist vorbereitet |
| E-Mail-Benachrichtigungen f�r Servicetermine | Backend-Cronjob n�tig, V2 |

---

## Technischer Stack

| Komponente | Technologie |
|---|---|
| Framework | Next.js 16.2.1 (App Router, Turbopack) |
| Sprache | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Backend/DB | Supabase (PostgreSQL, Auth, RLS) |
| Auth | Supabase Auth (E-Mail/Passwort) |
| Deployment | Vercel + GitHub Actions |

---

## Datenbankschema

```
profiles         � id, email, display_name, subscription_tier, timestamps
vehicles         � id, Benutzer_id, make, model, year, fuel_type, license_plate, current_mileage, timestamps
cost_entries     � id, vehicle_id, Benutzer_id, category, title, amount, date, mileage, liters, price_per_liter, notes, created_at
Service appointments        � id, vehicle_id, Benutzer_id, title, Service appointment_type, due_date, due_mileage, is_completed, notes, created_at
```

RLS-Policies: Jeder Benutzer sieht und bearbeitet nur eigene Daten (`auth.uid() = Benutzer_id`).

---

## Projektstruktur

```
src/
+-- app/
|   +-- layout.tsx                    # Root Layout
|   +-- page.tsx                      # Entry: redirect to /dashboard or /login
|   +-- auth/callback/route.ts        # Auth callback
|   +-- login/                        # Login page + form + actions
|   +-- register/                     # Register page + form + actions
|   +-- (app)/                        # Authenticated routes (shared layout)
|       +-- layout.tsx                # App shell with sidebar
|       +-- dashboard/page.tsx        # Dashboard
|       +-- vehicles/                 # Vehicle CRUD
|       +-- costs/                    # Cost entry CRUD
|       +-- Service appointments/                # Service appointments CRUD
|       +-- export/                   # Pro-only CSV export
|       +-- settings/                 # Benutzer settings
+-- components/
|   +-- Sidebar.tsx                   # Navigation sidebar (client component)
+-- lib/
|   +-- utils.ts                      # Formatters, permission helpers
|   +-- supabase/
|       +-- server.ts                 # Server-side Supabase client
|       +-- client.ts                 # Browser-side Supabase client
|       +-- middleware.ts             # Session refresh middleware
+-- types/
    +-- domain.ts                     # Domain type definitions
```

---

## Quality Checks

| Check | Status |
|---|---|
| `npm run typecheck` | ? Bestanden |
| `npm run lint` | ? Bestanden |
| `npm run build` | ? Bestanden (alle 15 Routen) |
| `npm run test:integration:local` | ? Bestanden (inkl. Kommentare + Rechnungsmetadaten) |

---

## Kosten-Detaildokumentation

- Jede Kostenposition besitzt eine eigene Detailseite unter `/costs/[id]`.
- Pro Kostenposition koennen mehrere Kommentare gespeichert werden.
- Rechnungen koennen pro Kostenposition hochgeladen und als Dokumentation hinterlegt werden.
- Rechnungsdateien liegen im privaten Supabase-Storage-Bucket `cost-invoices` und werden in der App �ber signierte Links ge�ffnet.

## Dashboard- und Fahrzeugprofil-Erweiterungen

- Kostenliste: Filter direkt �ber Tabelle, gefilterte Gesamtkosten sichtbar, Gesamtkostenbereich auf-/zuklappbar.
- Dashboard: Liniengrafik mit Kategorien-Filter, gro�er Detailansicht (`/dashboard/cost-trend`), Fahrzeug- und Zeitraumauswahl auf Monatsebene.
- Fahrzeugprofil: Kopfdaten und Detailfelder bearbeitbar, zus�tzliche Fahrzeugkommentare und private Bildgalerie (`vehicle-images` Bucket).

---

## Lokaler Supabase-Ablauf

- Docker und der lokale Supabase-Stack werden �ber `npm run supabase:start` automatisch gepr�ft und bei Bedarf gestartet.
- `.env.local` wird dabei automatisch mit `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` und `SUPABASE_DB_SCHEMA` synchronisiert.
- Das initiale Schema liegt als formale timestamped Migration in `supabase/migrations/`.
- Jede k�nftige Schema-�nderung muss �ber eine neue Migration erfolgen und lokal mit `npm run db:check` verifiziert werden.
- F�r Produktion werden keine manuellen Push-Befehle dokumentiert; lokal wird nur sichergestellt, dass die Migrationen fehlerfrei und vollst�ndig f�r Supabase MCP sind.

---

## Einrichtung-Anleitung

1. Repository klonen, `npm install`
2. `npm run supabase:start` ausf�hren, um Docker, den lokalen Supabase-Stack und `.env.local` zu synchronisieren
3. Optional `npm run db:reset` ausf�hren, um die lokale Datenbank aus Migrationen aufzubauen und Testdaten (Free/Pro) automatisch zu seeden, wenn Testdaten bereits vorliegen, nicht ausführen.
4. Optional `npm run db:seed:testdata` ausf�hren, um nur die Testdaten idempotent neu einzuspielen, wenn Testdaten bereits vorliegen, nicht ausführen.
5. Optional `npm run test:integration:local` ausf�hren
6. Testbenutzer-Details: siehe `docs/testbenutzer.md`
7. `npm run dev` starten, http://localhost:3000 �ffnen




