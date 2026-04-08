# Smart Car Manager — Testbenutzer

> Diese Benutzer werden direkt in Supabase angelegt, nicht als lokale Fixtures.
> Passwörter sind nur für die Testumgebung vorgesehen.

---

## Anlage in Supabase

### Schritt 1: Benutzer in Supabase Auth anlegen

Im Supabase Dashboard unter **Authentication → Users → Add User** (oder per SQL):

| E-Mail | Passwort | Display Name | Zweck |
|---|---|---|---|
| `free@testuser.local` | `Test1234!` | Anna Testfahrer | Free-Tier Nutzerin (1 Fahrzeug) |
| `pro@testuser.local` | `Test1234!` | Max Profifahrer | Pro-Tier Nutzer (mehrere Fahrzeuge) |

### Schritt 2: Subscription-Tier setzen

Nach dem Anlegen der Benutzer wird der Pro-User in der `profiles`-Tabelle hochgestuft:

```sql
UPDATE public.profiles
SET subscription_tier = 'pro'
WHERE email = 'pro@testuser.local';
```

Der Free-User bleibt automatisch auf `free` (Default).

---

## Testszenarien

### Free-User: `free@testuser.local`

| Szenario | Erwartetes Ergebnis |
|---|---|
| Login mit `free@testuser.local` / `Test1234!` | Erfolgreicher Login, Redirect zu /dashboard |
| Fahrzeug anlegen | Erstes Fahrzeug kann angelegt werden |
| Zweites Fahrzeug anlegen | Wird blockiert mit Upgrade-Hinweis |
| Kosten erfassen (Tanken, Wartung, Fixkosten) | Funktioniert ohne Limit |
| Erinnerung erstellen | Funktioniert |
| Dashboard anzeigen | Zeigt Zusammenfassung des einen Fahrzeugs |
| Export aufrufen (/export) | Zeigt Upgrade-Hinweis, kein Download möglich |
| Einstellungen → Abo | Zeigt „Free" mit Upgrade-Hinweis |

### Pro-User: `pro@testuser.local`

| Szenario | Erwartetes Ergebnis |
|---|---|
| Login mit `pro@testuser.local` / `Test1234!` | Erfolgreicher Login, Redirect zu /dashboard |
| Mehrere Fahrzeuge anlegen | Kein Limit |
| Kosten für verschiedene Fahrzeuge erfassen | Funktioniert, Zuordnung korrekt |
| Erinnerungen für alle Fahrzeuge | Funktioniert |
| Dashboard | Zeigt Übersicht über alle Fahrzeuge |
| Export (/export) | CSV-Download funktioniert |
| Filter auf Kosten-Seite | Fahrzeug- und Kategoriefilter korrekt |
| Einstellungen → Abo | Zeigt „Pro" Badge |

---

## Testdaten-Empfehlung

> Keine Mock-Daten in der App. Testdaten werden manuell über die App-Oberfläche oder direkt in Supabase erfasst.

### Empfohlene manuelle Testdaten nach Login:

**Free-User (Anna):**
- 1 Fahrzeug: VW Golf, 2019, Benzin, B-AB 1234, 45.000 km
- 3–5 Tankeinträge mit realistischen Werten
- 1 Wartungseintrag (Ölwechsel)
- 1 Fixkosteneintrag (Versicherung)
- 2 Erinnerungen (TÜV, Reifenwechsel)

**Pro-User (Max):**
- 2 Fahrzeuge: BMW 320d, 2020, Diesel + Tesla Model 3, 2022, Elektro
- 5–10 Kostenbuchungen pro Fahrzeug
- Verschiedene Kategorien (Tanken, Wartung, Versicherung, Steuer, Reparatur)
- 3+ Erinnerungen
- Export-Test mit verschiedenen Datumsbereichen
