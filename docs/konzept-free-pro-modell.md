# Konzept: CarMan Free / Pro Modell

## 1. Übersicht

CarMan bietet ein Freemium-Modell mit zwei klar abgegrenzten Stufen:

| Feature | **Free** | **Pro** |
| --- | --- | --- |
| Fahrzeuge verwalten | 1 Fahrzeug | Unbegrenzt |
| Kostenerfassung | ✅ | ✅ |
| Servicetermin-Planung | ✅ | ✅ |
| Dashboard & Auswertungen | Basis | Erweitert (Kostenverlauf, Kategorienmix) |
| CSV-Export | ❌ | ✅ |
| Erweiterte Filteroptionen | Basis | Vollständig |
| Signature-Themes | 3 (Standard Dark, Standard Light, 1 Bonus) | Alle 11 Themes |
| **KI-gestützte Funktionen** (Zukunft) | ❌ | ✅ |
| Prioritäts-Support | ❌ | ✅ |

---

## 2. Pricing-Modell

| Plan | Preis | Ersparnis |
| --- | --- | --- |
| **Pro Monatlich** | **€4,99 / Monat** | — |
| **Pro Jährlich** | **€39,99 / Jahr** (€3,33/Monat) | **~33 % gegenüber Monatstarif** |

### Begründung
- **€4,99/Monat** liegt unter der psychologischen 5-€-Schwelle und ist für eine Fahrzeugverwaltungs-App attraktiv.
- **€39,99/Jahr** bietet einen signifikanten Jahresrabatt und fördert langfristige Bindung.
- Der Preis ist wettbewerbsfähig im Vergleich zu ähnlichen Apps (Spritmonitor Pro, Fuelio Premium).

---

## 3. Upgrade-Mechanismus

### 3.1 Upgrade per Anfrage (MVP)
Da ein vollständiges Payment-Gateway (Stripe, etc.) eine eigene Implementierung erfordert, wird der Upgrade-Prozess zunächst über ein **Upgrade-Request-System** abgebildet:

1. User klickt auf "Upgrade auf Pro" in den Einstellungen oder einem CTA-Banner.
2. Eine Anfrage wird in der Datenbank gespeichert (`upgrade_requests`-Tabelle).
3. Der Admin erhält eine Benachrichtigung (z.B. per Supabase Edge Function → E-Mail).
4. Nach Zahlungseingang schaltet der Admin den User manuell auf Pro frei.

### 3.2 Zukünftige Integration
- Stripe Checkout / Stripe Billing für automatisierte Zahlungen
- Webhooks für automatische Tier-Änderung
- Self-Service Portal für Abo-Verwaltung

---

## 4. Upgrade-Aufforderungen (CTAs)

### 4.1 Standorte im UI

| Ort | Trigger | CTA-Typ |
| --- | --- | --- |
| **Einstellungen → Abonnement** | Immer sichtbar für Free-User | Detaillierte Planvergleichs-Karte |
| **Fahrzeug hinzufügen** | Limit (1 Fahrzeug) erreicht | Inline-Banner mit Upgrade-Link |
| **Costs → CSV Export** | Klick auf Export-Button | Modal-Hinweis mit Upgrade-Option |
| **Dashboard Widgets** | Erweiterte Widgets bei Free eingeschränkt | Dezenter Badge "Pro" |
| **Sidebar** | Für Free-User | Kleines Pro-Badge neben "Einstellungen" |

### 4.2 Design-Prinzipien
- **Nicht aggressiv**: Upgrade-Hinweise sind informativ, nicht blockierend.
- **Kontextuell**: Hinweis erscheint nur dort, wo das Feature eingeschränkt ist.
- **Dezent**: Passend zum bestehenden glassmorphen Design-System.

---

## 5. Einstellungen — Abonnement-Anzeige

Die bestehende Abo-Sektion in den Einstellungen wird um folgende Elemente erweitert:

1. **Aktueller Plan** mit visueller Badge (Free/Pro)
2. **Feature-Vergleich** als kompakte Tabelle im Glassmorphismus-Stil
3. **Pricing-Karten** für Monat/Jahr mit Rabatt-Hinweis
4. **Upgrade-Button** → Löst Upgrade-Request aus
5. **Bestätigung** nach erfolgreichem Request

---

## 6. KI-Zukunftsstrategie

Folgende KI-Features sind exklusiv für Pro geplant:

- **Intelligente Kostenprognose**: ML-basierte Vorhersage zukünftiger Kosten
- **Wartungsempfehlungen**: KI-gestützte Analyse optimaler Wartungszeitpunkte
- **Kraftstoff-Optimierung**: Personalisierte Tipps zur Senkung des Verbrauchs
- **Anomalie-Erkennung**: Automatische Warnung bei ungewöhnlichen Kostensteigerungen
- **Smart Reminder**: KI-basierte Erinnerungen basierend auf Fahrverhalten

Diese Features werden im UI bereits als "Bald verfügbar" gekennzeichnet, um den Mehrwert von Pro zu kommunizieren.

---

## 7. Technische Umsetzung

### 7.1 Datenmodell
- `profiles.subscription_tier` (bereits vorhanden: `free` | `pro`)
- Neue Tabelle `upgrade_requests` für Upgrade-Anfragen

### 7.2 Gating-Logik
- Bestehende `isProFeature()` und `canAddVehicle()` Funktionen in `src/lib/utils.ts`
- Neue `ProUpgradeBanner`-Komponente für kontextuelle CTAs
- Server-seitige Prüfung in allen Pro-gated Server Actions

### 7.3 Dateien

| Datei | Änderung |
| --- | --- |
| `src/types/domain.ts` | `UpgradeRequest` Interface |
| `src/lib/subscription.ts` | Subscription-Konstanten und Helpers |
| `src/app/(app)/settings/page.tsx` | Erweiterte Abo-Anzeige |
| `src/app/(app)/settings/actions.ts` | `requestUpgrade` Server Action |
| `src/components/ProUpgradeBanner.tsx` | Wiederverwendbarer CTA |
| `src/lib/i18n.ts` | Neue Übersetzungsschlüssel |
