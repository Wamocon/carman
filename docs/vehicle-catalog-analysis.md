# CarMan Fahrzeugkatalog Analyse

Stand: 2026-04-08

## Zielbild

Als Fahrzeugbesitzer möchte ich mein Fahrzeug möglichst detailliert digital abbilden und dabei möglichst wenig Zeit in die Dateneingabe investieren. Daraus ergeben sich zwei Anforderungen:

1. Geführte Dateneingabe mit Vorschlägen und Vorbefüllung.
2. Speicherung von mehr Fahrzeugdetails als nur Marke, Modell, Baujahr und Kraftstoff.

## Ausgangslage im Projekt

Vor der Erweiterung war der Fahrzeugdatensatz bewusst schlank:
- Marke
- Modell
- Baujahr
- Kraftstoff
- Kennzeichen
- Kilometerstand

Es gab keinen Referenzkatalog für Marken, Modelle, Varianten oder Motorisierungen. Die Eingabe war Vollständig manuell.

## Marktnahe Vollabdeckung: Realistische Einordnung

Eine Plattform wie mobile.de oder AutoScout24 wirkt auf den ersten Blick so, als liege dort ein kompletter Fahrzeugkatalog einfach offen vor. Praktisch ist die Lage deutlich komplexer:

- Die sichtbaren Daten sind nicht automatisch ein sauberer Masterkatalog.
- Marktplatzdaten bestehen aus Dealer-Feeds, Freitexten, internen Taxonomien und laufender Nachbearbeitung.
- Varianten, Sonderausstattungen und Motorisierungen sind oft marktspezifisch, historisch gewachsen und nicht konsistent benannt.
- Zusätzlich spielen rechtliche Fragen eine Rolle: AGB, Datenbankrechte, Nutzungsrechte, Caching und Weiterverwendung.

Fazit: Eine Vollständige, dauerhaft belastbare Datenbasis auf Marktplatz-Niveau ist keine einfache Copy-Paste-Aufgabe.

## Datenquellen: Was ist einfach und was nicht?

### Einfach und kostenlos nutzbar

Die praktikabelste kostenlose Quelle für einen schnellen Mehrwert ist NHTSA vPIC.

Stärken:
- freie API
- Marken und Modelle verfügbar
- Fahrzeugtypen verfügbar
- VIN-Decode verfügbar
- mehrere technische Felder koennen aus der VIN abgeleitet werden

Schwächen:
- stark US-/Nordamerika-lastig
- keine verlässliche Vollabdeckung für DACH-Varianten
- Sonderausstattungen sind nicht in der nötigen Tiefe verfügbar
- keine echte Marktplatz-Taxonomie für Trim-/Ausstattungslogik

### Professionell, aber nicht einfach

für hochwertige Daten in DACH kommen eher lizenzierte Anbieter in Frage, zum Beispiel TecDoc/TecAlliance, DAT, Schwacke, JATO oder spezialisierte VIN-/OEM-Datenlieferanten.

Stärken:
- deutlich bessere Abdeckung
- strukturiertere Varianten- und Motorisierungsdaten
- geeignet für spätere Produktreife

Schwächen:
- Kosten
- Vertrags- und Lizenzaufwand
- Integrations- und Sync-Komplexität

## Bewertung für CarMan

Die sinnvollste kurzfristige Strategie ist kein Vollkatalogprojekt, sondern ein geführter Eingabe-Assistent mit manuellem Fallback.

Das liefert schnell Nutzen:
- weniger Tipparbeit
- weniger Schreibfehler
- strukturiertere Daten
- mehr technische Details im Fahrzeugprofil

## Umgesetzte lösung

Im Projekt wurde daher eine pragmatische V1 implementiert:

### 1. Geführte Eingabe im Fahrzeugformular
- VIN-basierte Vorbefüllung
- Marken-Vorschläge
- Modell-Vorschläge abhängig von Marke und Baujahr
- Vorschläge für Fahrzeugtyp
- manuelle Überschreibung jederzeit möglich

### 2. Erweiterter Fahrzeugdatensatz
Es werden nun zusätzlich gespeichert:
- VIN
- Fahrzeugtyp
- Karosserieform
- Variante / Trim
- Motorisierung
- Getriebe
- Antrieb
- Tueren
- Leistung in kW
- Hubraum in ccm
- Sonderausstattung / Besonderheiten
- Datenquelle der Vorbefüllung

### 3. Architektur ohne komplexe Referenzdatenbank
Es wurde bewusst keine große lokale Fahrzeugkatalog-Datenbank aufgebaut.

Stattdessen wird eine einfache Integrationsarchitektur genutzt:
- Route Handler in Next.js als Server-seitige BFF-Schicht
- externe Datenquelle nur für Vorschläge und VIN-Decode
- Snapshot-Speicherung der relevanten Werte direkt am Fahrzeugdatensatz

Vorteil:
- schnell umsetzbar
- keine komplexe Katalogpflege
- trotzdem deutlicher UX-Gewinn

## Warum keine komplette lokale Katalog-DB in V1?

Eine lokale Voll-DB für alle Marken, Modelle, Varianten, Motorisierungen und Sonderausstattungen wäre nur dann sinnvoll, wenn mindestens einer dieser Punkte zutrifft:
- lizenzierte Datenquelle liegt bereits vor
- es gibt klare Produktanforderungen für Vollabdeckung
- ein Import-, Normalisierungs- und Updateprozess ist eingeplant

Ohne diese Voraussetzungen wäre eine solche DB eher Ballast:
- hoher Importaufwand
- unklare Datenqualitaet
- hoher Pflegebedarf
- rechtliches Risiko bei unklarer Herkunft

## Produktfazit

Es gibt eine einfache lösung für einen relevanten Teil des Problems:
- Marken-, Modell- und Typvorschlaege
- VIN-gestuetzte Vorbefüllung
- strukturierte Speicherung zusätzlicher Details

Es gibt keine einfache, seriöse und Vollständige Gratis-lösung für alle Modellvarianten, Motorisierungen und Sonderausstattungen auf mobile.de-/AutoScout24-Niveau.

## Empfohlene nächste Schritte

1. DACH-Fokus pruefen
- Wenn der Schwerpunkt Deutschland, Österreich, Schweiz ist, sollte ein späterer Anbieter für HSN/TSN, VIN und Variantenabdeckung evaluiert werden.

2. Matching verbessern
- später: gespeicherte Referenz-IDs für Marken/Modelle/Varianten einführen
- später: historisierte Snapshot-Felder beibehalten

3. Optionaler zweiter Einstieg
- HSN/TSN-Assistent für deutsche Fahrzeuge
- wäre für DACH oft hilfreicher als VIN allein

4. Sonderausstattung ausbauen
- V1: Freitext-Snapshot
- später: strukturierte Optionsbibliothek oder Anbieterintegration

5. Editierfluss nachziehen
- aktuell ist vor allem das Anlegen verbessert
- ein späterer Bearbeitungsdialog für bestehende Fahrzeuge ist sinnvoll



