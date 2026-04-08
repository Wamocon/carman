# HOWTO — Project Setup & Deployment Guide

> ?? **Herzlichen Glückwunsch zur Einrichtung! / Congratulations on setting up!**
> Du kannst dieses Dokument nach Abschluss der Einrichtung löschen oder als Referenz behalten.
> You can delete this HOWTO document once your setup is complete, or keep it for future reference.

> ?? **Lies die [AGENTS.md](AGENTS.md) Datei, um GitHub Copilot optimal und produktiv zu nutzen.**
> **Read the [AGENTS.md](AGENTS.md) file to use GitHub Copilot in an optimised and productive way.**

---

## DE Deutsch

---

### Prozessübersicht

Folge diesen Schritten in der angegebenen Reihenfolge, um vom Template zur Produktion zu gelangen:

1. **GitHub Repo erstellen** — Nutze dieses Template, um ein neues Repository in der Wamocon GitHub Organisation zu erstellen.
2. **Repo klonen** — Klone es auf deinen Rechner und führe `npm install` aus.
3. **GitHub Workflow-Datei aktualisieren** — Öffne `.github/workflows/deploy.yml` und `.github/workflows/pr-pipeline.yml`, ersetze `Wamocon/github_workflow` durch deine Org/Repo-Referenz falls abweichend.
4. **Lokales Supabase starten & `.env.local` synchronisieren** — Führe `npm run supabase:start` aus. Docker und der lokale Supabase-Stack werden bei Bedarf automatisch gestartet und `.env.local` wird aktualisiert.
5. **Migrationen lokal anwenden & Entwicklung beginnen** — Führe `npm run db:reset` aus, dann `npm run dev`.
6. **Repo vorübergehend öffentlich machen & auf Vercel deployen** — Stelle das Repo temporär auf öffentlich, importiere es in Vercel und deploye.
7. **Domain von Strato hinzufügen** — Konfiguriere die über Strato erworbene Domain in Vercel.
8. **Vercel Project ID holen** — Kopiere die Vercel Project ID aus den Vercel-Projekteinstellungen.
9. **Vercel Project ID zu GitHub Secrets hinzufügen** — Füge `VERCEL_PROJECT_ID` zu den GitHub Actions Secrets deines Repos hinzu.
10. **Repo auf intern umstellen** — Ändere die Sichtbarkeit des Repos zurück von öffentlich auf intern.

> ?? **Für detaillierte Informationen, lies weiter unten.**

---

### 1. Klonen & Einrichten

```bash
# Repository klonen
git clone https://github.com/Wamocon/<dein-repo-name>.git
cd <dein-repo-name>

# Abhängigkeiten installieren
npm install

# Lokalen Supabase-Stack starten und .env.local aktualisieren
npm run supabase:start

# Lokale Migrationen anwenden
npm run db:reset

# Entwicklungsserver starten (mit Turbopack für schnelles Hot-Reload)
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser.

**Verfügbare Skripte:**

| Befehl | Beschreibung |
|---|---|
| `npm run supabase:start` | Prüft Docker und den lokalen Supabase-Stack, startet beides bei Bedarf und synchronisiert `.env.local` |
| `npm run db:reset` | Setzt die lokale Docker-Datenbank aus den timestamped Migrationen neu auf |
| `npm run db:lint` | Prüft die lokalen Migrationen auf SQL-Probleme |
| `npm run db:diff` | Zeigt lokales Schema-Drift gegenüber den Migrationen |
| `npm run db:check` | Führt Reset, Lint und Integrationstest als Gesamtprüfung aus |
| `npm run test:integration:local` | Verifiziert Read/Write gegen die lokale Docker-Supabase |
| `npm run dev` | Startet den Dev-Server mit Turbopack (Hot Reload) |
| `npm run build` | Erstellt den Produktions-Build |
| `npm run start` | Startet den Produktionsserver |
| `npm run lint` | Führt ESLint aus |
| `npm run typecheck` | Führt TypeScript-Typprüfung aus |

---

### 1b. Git-Workflow & Branch-Strategie

> ?? **Arbeite nach dem ersten Push immer auf einem Branch — nie direkt auf `main`/`master`.**

**Empfohlener Ablauf:**

```bash
# Einmalig: Ersten Stand auf main/master pushen
git add .
git commit -m "chore: initial setup"
git push origin <main-oder-master>

# Ab jetzt: Immer auf einem Feature-Branch arbeiten
git checkout -b feature/mein-feature

# Änderungen lokal testen, dann committen
npm run dev        # testen
npm run typecheck  # Typfehler prüfen
npm run lint       # Lint prüfen

git add .
git commit -m "feat: beschreibung der Änderung"
git push origin feature/mein-feature
```

**Wichtige Regeln:**

- **Lokal testen, bevor du pushst.** Führe `npm run typecheck` und `npm run lint` aus, bevor du Änderungen pushst.
- **Alle Änderungen vor dem PR-Öffnen pushen.** Jeder neue Push auf einen offenen PR triggert automatisch die GitHub Actions — das verbraucht GitHub Actions-Minuten. Öffne den PR daher erst, wenn alle Änderungen fertig und gepusht sind.
- **Nur einen PR auf einmal offen halten**, bis er gemergt ist. Danach neuen Branch erstellen.

> ?? **Warum das wichtig ist:** Jeder Push auf einen offenen PR löst die komplette CI-Pipeline aus (Auto-Fix + Typecheck + Lint + Vercel Preview Deploy). Viele unnötige Pushes verbrauchen GitHub Actions-Minuten. Teste erst lokal — dann push, dann PR.

---

### 2. Lokales Supabase-Setup & Warnung

> ?? **KRITISCH: Sobald du einen Supabase-Account hast, speichere alle Testdaten direkt dort.**
>
> **Lege Testdaten NICHT als lokale Dateien im Projektverzeichnis ab** (z.B. JSON-Fixtures, SQL-Dumps oder seed-Skripte die du manuell pflegst). Füge Daten stattdessen direkt in dein Supabase-Projekt ein — über das Supabase Dashboard, per MCP-Tool oder per Migrations-Skript. So bleibt deine Datenquelle von Anfang an einheitlich und du vermeidest manuelle Synchronisierungsaufwände.

**Schritte:**

1. Stelle sicher, dass Docker Desktop läuft.
2. Führe `npm run supabase:start` aus. Das Skript prüft Docker und den lokalen Supabase-Stack automatisch und startet beides bei Bedarf.
3. Die lokalen Werte werden automatisch in `.env.local` geschrieben:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<lokaler anon key>
   SUPABASE_SERVICE_ROLE_KEY=<lokaler service role key>
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
   SUPABASE_DB_SCHEMA=public
   ```
4. Führe `npm run db:reset` aus, um die lokale Datenbank strikt aus den Migrationen aufzubauen.

---

### 3. Supabase MCP & Schemas

#### Supabase MCP für Migrationen verwenden

Der Supabase MCP (Model Context Protocol) Server ermöglicht es deinem KI-Coding-Assistenten (z.B. GitHub Copilot, Cursor), Migrationen und Tabellen direkt zu erstellen und zu verwalten. So wird sichergestellt, dass alle Schema-Änderungen versioniert und reproduzierbar sind.

- Migrationen werden in `supabase/migrations/` gespeichert und immer timestamped angelegt.
- Neuer Workflow für jede Schema-Änderung:
   1. `npx supabase migration new <name>`
   2. SQL-Datei in `supabase/migrations/` bearbeiten
   3. `npm run db:check` ausführen
- Für Produktion werden hier keine manuellen Push-Befehle dokumentiert; lokal wird nur sichergestellt, dass die Migrationen fehlerfrei und vollständig für Supabase MCP sind.

#### Arbeiten mit mehreren Schemas

Standardmäßig macht Supabase nur das `public`-Schema über die API verfügbar. Wenn du eigene Schemas brauchst (z.B. `app`, `internal`, `reporting`):

**1. Schema erstellen:**
```sql
CREATE SCHEMA IF NOT EXISTS app;
```

**2. Berechtigungen vergeben, damit Supabase das Schema abfragen kann:**
```sql
-- Nutzung des Schemas gewähren
GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;

-- Zugriff auf alle Tabellen gewähren (aktuelle und zukünftige)
GRANT ALL ON ALL TABLES IN SCHEMA app TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- Zugriff auf Sequenzen gewähren
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
```

**3. Schema über die Supabase API zugänglich machen:**

Gehe zu `Project Settings ? API ? Exposed schemas` und füge deinen Schema-Namen hinzu.

> ?? Ohne diese Berechtigungen gibt Supabase PostgREST leere Ergebnisse oder Fehler zurück, wenn du Nicht-Public-Schemas abfragst.

---

### 4. GitHub Workflow Konfiguration

Dieses Projekt nutzt den **zentralen Wamocon CI/CD-Workflow** aus [`Wamocon/github_workflow`](https://github.com/Wamocon/github_workflow). Der Workflow übernimmt:

- **PR Pipeline** (`pr-pipeline.yml`): Behebt automatisch Lint-/Format-Probleme und validiert anschließend mit Typecheck + Lint.
- **Deploy** (`deploy.yml`): Erstellt Preview-Builds bei PRs und Produktions-Builds bei Merge auf `main`/`master`.

**Was du tun musst:**

1. Öffne `.github/workflows/deploy.yml` und `.github/workflows/pr-pipeline.yml`.
2. Überprüfe, dass `Wamocon/github_workflow` die korrekte Org/Repo-Referenz ist (sollte standardmäßig stimmen).
3. Füge **ein einziges Secret** zu deinem Repository hinzu:
   - Gehe zu `Repository ? Settings ? Secrets and variables ? Actions ? New repository secret`
   - Name: `VERCEL_PROJECT_ID`
   - Wert: *(siehe Abschnitt Vercel Deployment unten)*

> ? **Alle anderen benötigten Secrets** (`VERCEL_TOKEN`, `VERCEL_ORG_ID`) sind **bereits auf GitHub-Organisationsebene konfiguriert** — du musst sie nicht hinzufügen.

---

### 5. Vercel Deployment-Strategie

Aufgrund der Vercel-Anforderung, Zugriff auf den Repository-Code zu haben, gibt es einen initialen Deployment-Workaround:

#### Erstmalige Bereitstellung (Einmalig)

1. **Repo vorübergehend öffentlich machen**  
   (`Repository ? Settings ? General ? Change visibility ? Public`)
2. Gehe zu [vercel.com](https://vercel.com) ? **Add New Project** ? **Import** dein Repo.
3. Deploye das Projekt.
4. **Vercel Project ID kopieren**:
   - Gehe zu `Vercel Project ? Settings ? General ? Project ID`
   - Kopiere den ID-Wert.
5. **Zu GitHub Secrets hinzufügen**:
   - Gehe zu `Repository ? Settings ? Secrets and variables ? Actions ? New repository secret`
   - Name: `VERCEL_PROJECT_ID`
   - Wert: die soeben kopierte ID.
6. **Repo auf intern zurücksetzen**  
   (`Repository ? Settings ? General ? Change visibility ? Internal`)

#### CI/CD-Ablauf

| Auslöser | Ergebnis |
|---|---|
| Pull Request ? `main`/`master` | Vercel **Preview**-Deployment (einzigartige URL pro PR) |
| Merge / Push ? `main`/`master` | Vercel **Produktions**-Deployment |

> ?? **WICHTIG: Importiere deine `.env.local`-Variablen in Vercel!**
>
> Gehe zu `Vercel Project ? Settings ? Environment Variables` und füge **alle** Variablen aus deiner `.env.local` hinzu. Ohne diese wird der Build **fehlschlagen**.
>
> Stelle sicher, dass du den richtigen Geltungsbereich (Production, Preview, Development) für jede Variable wählst.

---

### 6. Domain-Verwaltung

1. **Sichere eine Domain** für deine Anwendung über [Strato](https://www.strato.de).
2. Gehe in den Vercel-Projekteinstellungen zu `Settings ? Domains` und füge deine Domain hinzu.
3. Konfiguriere die DNS-Einträge bei Strato wie von Vercel angegeben (typischerweise CNAME oder A-Record).

---

### 7. Projekt-Checkliste

- [ ] Landing Page
- [ ] Handbuch / Manual
- [ ] Hauptprozess (Kernfunktion)
- [ ] Video (Demo / Tutorial)
- [ ] Domain (über Strato gesichert)

---
---

## EN English

---

### Process Overview

Follow these steps in order to go from template to production:

1. **Create GitHub Repo** — Use this template to create a new repository in the Wamocon GitHub organisation.
2. **Clone Repo** — Clone to your local machine and run `npm install`.
3. **Update GitHub Workflow file** — Open `.github/workflows/deploy.yml` and `.github/workflows/pr-pipeline.yml`, replace `Wamocon/github_workflow` with your org/repo if different.
4. **Update `.env.local` & connect Supabase** — Copy `.env.example` ? `.env.local`, create a remote Supabase project, and fill in the credentials.
5. **Run locally & start development** — Run `npm run dev` and start building.
6. **Make repo public temporarily & Deploy to Vercel** — Temporarily set the repo to public, import it in Vercel, then deploy.
7. **Add domain from Strato** — Configure the domain purchased via Strato in Vercel.
8. **Get Vercel Project ID** — Copy the Vercel Project ID from the Vercel project settings.
9. **Add Vercel Project ID to GitHub secrets** — Add `VERCEL_PROJECT_ID` to your repository's GitHub Actions secrets.
10. **Make repo internal** — Revert the repository visibility from public to internal.

> ?? **For detailed information, read below.**

---

### 1. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/Wamocon/<your-repo-name>.git
cd <your-repo-name>

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start the development server (with Turbopack for fast refresh)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Available scripts:**

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack (hot reload) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

### 1b. Git Workflow & Branching Strategy

> ?? **After the first push, always work on a branch — never directly on `main`/`master`.**

**Recommended flow:**

```bash
# One-time: push the initial state to main/master
git add .
git commit -m "chore: initial setup"
git push origin <main-or-master>

# From now on: always work on a feature branch
git checkout -b feature/my-feature

# Test locally, then commit
npm run dev        # test in browser
npm run typecheck  # catch type errors
npm run lint       # catch lint issues

git add .
git commit -m "feat: description of change"
git push origin feature/my-feature
```

**Key rules:**

- **Test locally before pushing.** Always run `npm run typecheck` and `npm run lint` before pushing changes.
- **Push all changes before opening the PR.** Every new push to an open PR automatically triggers the GitHub Actions pipeline — this consumes GitHub Actions minutes. Only open the PR once all your changes are finished and pushed.
- **Keep only one PR open at a time** until it is merged. Then create a new branch.

> ?? **Why this matters:** Every push to an open PR triggers the full CI pipeline (Auto-Fix + Typecheck + Lint + Vercel Preview Deploy). Unnecessary pushes burn GitHub Actions minutes. Test locally first — then push, then open the PR.

---

### 2. Supabase Setup & Warning

> ?? **CRITICAL: Once you have a Supabase account, store all test data there directly.**
>
> **Do NOT store test data as local files inside the project directory** (e.g. JSON fixtures, SQL dumps, or manually maintained seed scripts). Instead, insert data directly into your Supabase project — via the Supabase Dashboard, an MCP tool, or a migration script. This keeps your data source consistent from day one and avoids manual sync overhead.

**Steps:**

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy the **Project URL**, **Anon Key**, and **Service Role Key** from  
   `Project Settings ? API`.
3. Paste them into your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

### 3. Supabase MCP & Schemas

#### Using Supabase MCP for Migrations

The Supabase MCP (Model Context Protocol) server allows your AI coding assistant (e.g. GitHub Copilot, Cursor) to create and manage migrations and tables directly. This ensures all schema changes are versioned and reproducible.

- Migrations are stored in `supabase/migrations/`.
- Use the MCP tools to create tables, alter schemas, and manage indexes.

#### Working with Multiple Schemas

By default, Supabase only exposes the `public` schema via the API. If you need custom schemas (e.g. `app`, `internal`, `reporting`):

**1. Create the schema:**
```sql
CREATE SCHEMA IF NOT EXISTS app;
```

**2. Grant permissions so Supabase can query the schema:**
```sql
-- Grant usage on the schema
GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;

-- Grant access to all tables (current and future)
GRANT ALL ON ALL TABLES IN SCHEMA app TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
```

**3. Expose the schema via the Supabase API:**

Go to `Project Settings ? API ? Exposed schemas` and add your custom schema name.

> ?? Without granting these permissions, Supabase PostgREST will return empty results or errors when querying non-public schemas.

---

### 4. GitHub Workflow Configuration

This project uses the **centralized Wamocon CI/CD workflow** from [`Wamocon/github_workflow`](https://github.com/Wamocon/github_workflow). The workflow handles:

- **PR Pipeline** (`pr-pipeline.yml`): Automatically fixes lint/format issues, then validates with typecheck + lint.
- **Deploy** (`deploy.yml`): Deploys preview builds on PRs, production builds on merge to `main`/`master`.

**What you need to do:**

1. Open `.github/workflows/deploy.yml` and `.github/workflows/pr-pipeline.yml`.
2. Verify that `Wamocon/github_workflow` is the correct org/repo reference (it should be by default).
3. Add **one single secret** to your repository:
   - Go to `Repository ? Settings ? Secrets and variables ? Actions ? New repository secret`
   - Name: `VERCEL_PROJECT_ID`
   - Value: *(see Vercel Deployment section below)*

> ? **All other required secrets** (`VERCEL_TOKEN`, `VERCEL_ORG_ID`) are **already configured at the GitHub Organisation level** — you do not need to add them.

---

### 5. Vercel Deployment Strategy

Due to Vercel's requirement of having access to the repository code, there is an initial deployment workaround:

#### Initial Deployment (One-Time)

1. **Make the repo public** temporarily  
   (`Repository ? Settings ? General ? Change visibility ? Public`)
2. Go to [vercel.com](https://vercel.com) ? **Add New Project** ? **Import** your repo.
3. Deploy the project.
4. **Copy the Vercel Project ID**:
   - Go to `Vercel Project ? Settings ? General ? Project ID`
   - Copy the ID value.
5. **Add it to GitHub secrets**:
   - Go to `Repository ? Settings ? Secrets and variables ? Actions ? New repository secret`
   - Name: `VERCEL_PROJECT_ID`
   - Value: the ID you just copied.
6. **Revert the repo to internal**  
   (`Repository ? Settings ? General ? Change visibility ? Internal`)

#### CI/CD Flow

| Trigger | Result |
|---|---|
| Pull Request ? `main`/`master` | Vercel **preview** deployment (unique URL per PR) |
| Merge / Push ? `main`/`master` | Vercel **production** deployment |

> ?? **CRUCIAL: Import your `.env.local` variables into Vercel!**
>
> Go to `Vercel Project ? Settings ? Environment Variables` and add **all** variables from your `.env.local`. Without these, the build **will fail**.
>
> Make sure to set the correct scope (Production, Preview, Development) for each variable.

---

### 6. Domain Management

1. **Secure a domain** for your application via [Strato](https://www.strato.de).
2. In the Vercel project settings, go to `Settings ? Domains` and add your domain.
3. Configure the DNS records at Strato as shown by Vercel (typically a CNAME or A record).

---

### 7. Project Checklist

- [ ] Landing Page
- [ ] Handbuch / Manual
- [ ] Main Process (core feature)
- [ ] Video (demo / tutorial)
- [ ] Domain (secured via Strato)
