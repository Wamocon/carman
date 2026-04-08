# CarMan – Pitch und Anforderungsrahmen für V1

Version: 3.0
Stand: 08.04.2026
Zweck: Kompakte Entscheidungsgrundlage für Produktbedarf, Zielgruppe und V1-Scope

---

## 1. Kurzpositionierung

CarMan soll die private Fahrzeugverwaltung deutlich einfacher machen: Kosten, Wartungen, Erinnerungen und Nachweise werden an einem Ort gebündelt, damit Halterinnen und Halter schneller verstehen, was ihr Fahrzeug wirklich kostet, was als Nächstes fällig ist und was sie beim Verkauf belegen können.

---

## 2. Warum das Thema relevant ist

Der Bedarf ist nicht theoretisch, sondern groß und alltagsnah:

- In Deutschland waren zum 1. Januar 2024 rund 49,1 Millionen Pkw zugelassen. Das Durchschnittsalter lag bei 10,3 Jahren. Ältere Fahrzeuge erhöhen den Bedarf an Wartung, Überblick und Nachweisen.[1]
- 2023 gab es 6,03 Millionen Pkw-Besitzumschreibungen; 93,4 Prozent davon entfielen auf private Halter. Eine saubere Fahrzeughistorie ist damit nicht nur Komfort, sondern direkt verkaufsrelevant.[2]
- Laut DAT Report 2026 ist das Auto für über 80 Prozent der Pkw-Halter im Alltag unverzichtbar. Gleichzeitig sind fast 90 Prozent der in Deutschland zugelassenen Automobile auf Privatpersonen registriert.[3]
- Der ADAC betrachtet bei seinen Autokostenberechnungen nicht nur Anschaffung und Verbrauch, sondern auch Versicherung, Steuer, Werkstatt, Reifen und insbesondere den Wertverlust als größten Kostenblock. Grundlage sind Berechnungen für rund 1.200 aktuelle Modelle über fünf Jahre und 75.000 Kilometer.[4]
- Der ADAC wurde 2024 zu über 3,6 Millionen Pannen gerufen. 44,9 Prozent der Pannen gingen auf die Starterbatterie zurück, 22,1 Prozent auf Motor- oder Motorelektronik. Wartung und Dokumentation sind also keine Randthemen.[5]

Die Konsequenz daraus ist klar: Wer sein Fahrzeug regelmäßig nutzt, trägt laufende Kosten, Wartungsrisiken und Wiederverkaufsverantwortung. Genau dort setzt CarMan an.

---

## 3. Zielgruppe

### Primäre Zielgruppe für V1

- private Fahrzeughalter mit Wunsch nach besserer Kostenkontrolle
- Haushalte mit mehreren Fahrzeugen
- Nutzer mit hohem Bedarf an Ordnung, Nachweisen und Werterhalt

### Sekundäre Zielgruppe für spätere Ausbaustufen

- Pendler und Selbstständige mit zusätzlichem Export- und Fahrtenbedarf
- besonders datenaffine Nutzer mit Interesse an Trends und Vergleichen

---

## 4. Welches Problem CarMan löst

Viele Fahrzeughalter organisieren Kosten, Werkstatttermine und Belege heute verteilt über Banking-Apps, Handschuhfach, Kalender und ihr Gedächtnis. Das führt im Alltag zu vier typischen Problemen:

- Die tatsächlichen Fahrzeugkosten bleiben unklar.
- Fällige Wartungen oder Fristen werden zu spät gesehen.
- Belege und Reparaturnachweise sind beim Verkauf oder bei Rückfragen nicht griffbereit.
- Rückblickend Ordnung zu schaffen kostet deutlich mehr Zeit als eine saubere laufende Erfassung.

CarMan soll daraus einen einfachen, wiederkehrend nützlichen Prozess machen.

---

## 5. Lösung und V1-Nutzen

CarMan soll als digitales Fahrzeugkonto funktionieren.

Der Kernnutzen in V1:

- Fahrzeugdaten, Kosten und Ereignisse werden je Fahrzeug in einer nachvollziehbaren Struktur zusammengeführt.
- Erinnerungen helfen, Wartungen und Fristen rechtzeitig anzugehen.
- Ein Dashboard macht Kostenentwicklung und offene Punkte sichtbar.
- Belege, Notizen und Historie schaffen Ordnung und stärken die Nachweisfähigkeit.

---

## 6. Funktionelle Anforderungen für V1

Die folgenden Punkte beschreiben bewusst das Zielbild für V1 und nicht den aktuellen Implementierungsstand.

### Konto und Zugang

- Das System soll Registrierung und Anmeldung per E-Mail und Passwort ermöglichen.
- Das System soll pro Nutzer ein persönliches Profil verwalten.

### Fahrzeuge

- Das System soll ein oder mehrere Fahrzeugprofile mit Kern- und Detaildaten verwalten.
- Das System soll Fahrzeugdaten bearbeiten und löschen können.

### Kosten und Tankvorgänge

- Das System soll Kosten in standardisierten Kategorien erfassen.
- Das System soll Tankvorgänge mit Mengen-, Preis- und Datumsangaben unterstützen.
- Das System soll Kosten nach Fahrzeug, Zeitraum und Kategorie filterbar machen.

### Wartung und Erinnerungen

- Das System soll Erinnerungen nach Datum, Kilometerstand oder kombinierter Logik verwalten.
- Das System soll offene und erledigte Erinnerungen klar kennzeichnen.

### Dokumentation und Nachweise

- Das System soll Notizen und Belege an Vorgängen oder Fahrzeugen speichern können.
- Das System soll eine nachvollziehbare Fahrzeughistorie aufbauen.

### Auswertung und Export

- Das System soll eine übersichtliche Kosten- und Statusauswertung bereitstellen.
- Das System soll Exportfunktionen in einem standardisierten Format unterstützen.

### Tarife, Sprache und Sicherheit

- Das System soll einen klaren Free- und Pro-Rahmen abbilden.
- Das System soll mindestens Deutsch und Englisch unterstützen.
- Das System soll Daten strikt nutzerbezogen schützen.

---

## 7. Bewusst nicht Teil von V1

- vollständiges GPS-Fahrtenbuch
- OBD2- oder Telemetrie-Integration
- B2B-Flottenmanagement
- komplexe Vorhersagemodelle für Wartung oder Kosten

Diese Themen sind strategisch interessant, erhöhen aber Komplexität, Supportaufwand und Datenanforderungen zu früh.

---

## 8. KI-gestützte Erweiterungen

Die folgenden Punkte sind ausdrücklich als KI-Ausbau markiert und nicht als Kernversprechen von V1.

### KI-THEMA: OCR für Belege

- Belegdaten sollen automatisch erkannt und zur Erfassung vorbefüllt werden.

### KI-THEMA: Kategorisierungsvorschläge

- Das System soll auf Basis historischer Einträge passende Kategorien vorschlagen.

### KI-THEMA: Wartungshinweise mit Kontext

- Das System soll aus Historie, Kilometerstand und Nutzungsmustern sinnvolle Hinweise auf bevorstehende Wartungen ableiten.

### KI-THEMA: Auffällige Kostenentwicklungen erkennen

- Das System soll ungewöhnliche Ausgabenverläufe markieren und zur Prüfung hervorheben.

Wichtig: KI soll hier kein Selbstzweck sein. Sie ist erst dann sinnvoll, wenn sie Eingabeaufwand spürbar reduziert oder bessere Entscheidungen ermöglicht.

---

## 9. Produktlogik für das Geschäftsmodell

CarMan soll als Freemium-Produkt funktionieren.

- Free soll den sinnvollen Einstieg ermöglichen und früh Nutzen zeigen.
- Pro soll Komfort, Mehrfahrzeugnutzung, Export und tiefere Dokumentation monetarisieren.

Die stärkste Conversion-Hypothese ist nicht „mehr Funktionen“, sondern weniger Aufwand bei gleichzeitig besserem Überblick.

---

## 10. Kritische Einordnung

Die App ist gut begründbar, aber nur mit einem klaren Fokus:

- Das stärkste V1-Versprechen ist nicht KI, sondern Ordnung, Transparenz und rechtzeitige Erinnerung.
- Der größte Nutzungshebel liegt in niedriger Erfassungsfriktion.
- Dokumentation und Nachweis sind vor allem deshalb relevant, weil Fahrzeuge teuer sind, lange genutzt werden und häufig privat weiterverkauft werden.

Die ausführliche Herleitung, Nutzwertanalyse und Quellenlage steht in [docs/analyse-smart-car-manager.md](analyse-smart-car-manager.md).

---

## Quellen

[1] Kraftfahrt-Bundesamt: Fahrzeugbestand zum 1. Januar 2024, https://www.kba.de/DE/Statistik/Fahrzeuge/Bestand/bestand_node.html, Abruf 08.04.2026.

[2] Kraftfahrt-Bundesamt: Besitzumschreibungen 2023, https://www.kba.de/DE/Statistik/Fahrzeuge/Besitzumschreibungen/besitzumschreibungen_node.html, Abruf 08.04.2026.

[3] DAT Report 2026 / DAT News, https://www.dat.de/news/dat-report-2026/ und https://www.dat.de/report/, Abruf 08.04.2026.

[4] ADAC Autokostenübersicht, https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/autokosten/uebersicht/, Abruf 08.04.2026.

[5] ADAC Pannenstatistik 2025, https://www.adac.de/rund-ums-fahrzeug/unfall-schaden-panne/adac-pannenstatistik/, Abruf 08.04.2026.





