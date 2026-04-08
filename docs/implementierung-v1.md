# Smart Car Manager — Implementierungsstand V1

**Stand:** 2026-04-08

---

## Getroffene Entscheidungen

| Frage | Entscheidung |
|---|---|
| Zielmarkt | Option A — B2C breiter Privatmarkt, DACH-Fokus |
| Plattform | Option B — Web-App zuerst (Next.js), Mobile später |
| V1-Scope | Wie Pitch-Tabelle, ohne OCR |
| Free/Pro-Grenze | 1 Fahrzeug frei, kein Datenlimit, Pro = Komfort + Multi-Vehicle |
| OCR | Rausgelassen für V1 |

---

## Implementierter Funktionsumfang

### Authentifizierung
- [x] E-Mail/Passwort-Registrierung mit Display-Name
- [x] E-Mail/Passwort-Login
- [x] Auth-Callback für E-Mail-Bestätigung
- [x] Session-Management über Supabase SSR + Middleware
- [x] Automatische Profilerstellung bei Signup (DB-Trigger)
- [x] Geschützte Routen: nicht authentifizierte Nutzer → /login

### Fahrzeugverwaltung
- [x] Fahrzeug anlegen (Marke, Modell, Baujahr, Kraftstoffart, Kennzeichen, Kilometerstand)
- [x] Fahrzeugliste mit Übersicht
- [x] Fahrzeug-Detailseite mit letzten Kosten und Erinnerungen
- [x] Fahrzeug löschen (mit Bestätigung)
- [x] Free-Limit: max. 1 Fahrzeug, Upgrade-Hinweis bei Überschreitung

### Kostenerfassung
- [x] Allgemeine Kostenerfassung (Wartung, Reparatur, Versicherung, Steuer, Leasing, Parken, Sonstiges)
- [x] Tankerfassung mit Liter und Literpreis
- [x] Kilometerstands-Tracking (automatische Aktualisierung am Fahrzeug)
- [x] Kostenliste mit Pagination (25 pro Seite)
- [x] Filter nach Fahrzeug und Kategorie

### Erinnerungen
- [x] Erinnerungen nach Datum, Kilometerstand oder beidem
- [x] Erinnerungsliste gruppiert nach Fahrzeug
- [x] Als erledigt markieren / wieder öffnen
- [x] Vorauswahl Fahrzeug bei Erstellung

### Dashboard
- [x] Monatskosten aktuell und Vormonat
- [x] Fahrzeuganzahl
- [x] Offene Erinnerungen
- [x] Pro-Fahrzeug-Statistiken (Gesamtkosten, Durchschnittsverbrauch)

### Export (Pro)
- [x] CSV-Export aller Kosten pro Fahrzeug und Zeitraum
- [x] Pro-Gate: Free-Nutzer sehen Upgrade-Hinweis

### Einstellungen
- [x] Anzeigename ändern
- [x] Abo-Status anzeigen

### Infrastruktur
- [x] Supabase Server Client (SSR) + Browser Client
- [x] Middleware für Auth-Session-Refresh
- [x] Row-Level Security auf allen Tabellen
- [x] DB-Migration mit vollständigem Schema
- [x] TypeScript Domain-Types

---

## Nicht implementiert (bewusst für V1 ausgeschlossen)

| Feature | Begründung |
|---|---|
| OCR-Belegscan | Entscheidung: erst in späterer Version |
| GPS-Fahrtenbuch | Zu komplex für Web-MVP |
| OBD2-Integration | Hardware-Abhängigkeit |
| Predictive Maintenance | Braucht Datenbasis |
| Kostenprognosen (KI) | Erst nach Datensammlung sinnvoll |
| Flottenlogik / B2B | Anderes Produkt |
| Dark Mode Toggle | Nice-to-have, Tailwind-Basis ist vorbereitet |
| E-Mail-Benachrichtigungen für Erinnerungen | Backend-Cronjob nötig, V2 |

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
profiles         — id, email, display_name, subscription_tier, timestamps
vehicles         — id, user_id, make, model, year, fuel_type, license_plate, current_mileage, timestamps
cost_entries     — id, vehicle_id, user_id, category, title, amount, date, mileage, liters, price_per_liter, notes, created_at
reminders        — id, vehicle_id, user_id, title, reminder_type, due_date, due_mileage, is_completed, notes, created_at
```

RLS-Policies: Jeder User sieht und bearbeitet nur eigene Daten (`auth.uid() = user_id`).

---

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx                    # Root Layout
│   ├── page.tsx                      # Entry: redirect to /dashboard or /login
│   ├── auth/callback/route.ts        # Auth callback
│   ├── login/                        # Login page + form + actions
│   ├── register/                     # Register page + form + actions
│   └── (app)/                        # Authenticated routes (shared layout)
│       ├── layout.tsx                # App shell with sidebar
│       ├── dashboard/page.tsx        # Dashboard
│       ├── vehicles/                 # Vehicle CRUD
│       ├── costs/                    # Cost entry CRUD
│       ├── reminders/                # Reminders CRUD
│       ├── export/                   # Pro-only CSV export
│       └── settings/                 # User settings
├── components/
│   └── Sidebar.tsx                   # Navigation sidebar (client component)
├── lib/
│   ├── utils.ts                      # Formatters, permission helpers
│   └── supabase/
│       ├── server.ts                 # Server-side Supabase client
│       ├── client.ts                 # Browser-side Supabase client
│       └── middleware.ts             # Session refresh middleware
└── types/
    └── domain.ts                     # Domain type definitions
```

---

## Quality Checks

| Check | Status |
|---|---|
| `npm run typecheck` | ✅ Bestanden |
| `npm run lint` | ✅ Bestanden |
| `npm run build` | ✅ Bestanden (alle 15 Routen) |

---

## Lokaler Supabase-Workflow

- Docker und der lokale Supabase-Stack werden über `npm run supabase:start` automatisch geprüft und bei Bedarf gestartet.
- `.env.local` wird dabei automatisch mit `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` und `SUPABASE_DB_SCHEMA` synchronisiert.
- Das initiale Schema liegt als formale timestamped Migration in `supabase/migrations/`.
- Jede künftige Schema-Änderung muss über eine neue Migration erfolgen und lokal mit `npm run db:check` verifiziert werden.
- Für Produktion werden keine manuellen Push-Befehle dokumentiert; lokal wird nur sichergestellt, dass die Migrationen fehlerfrei und vollständig für Supabase MCP sind.

---

## Setup-Anleitung

1. Repository klonen, `npm install`
2. `npm run supabase:start` ausführen, um Docker, den lokalen Supabase-Stack und `.env.local` zu synchronisieren
3. `npm run db:reset` ausführen, um die lokale Datenbank strikt aus den Migrationen aufzubauen
4. Optional `npm run test:integration:local` ausführen
5. Testbenutzer anlegen: siehe `docs/testbenutzer.md`
6. `npm run dev` starten, http://localhost:3000 öffnen
