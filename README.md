# Supada Itami · Das Konoha-Buch

Persönliche Naruto-Rollenspiel-Chronik mit 31 Berichten, gegliedert nach Spielmonaten. Statische Website auf GitHub Pages, ohne Build.

## Zeitrechnung

**Ein realer Servertag entspricht einem Spielmonat.** Der vom Nutzer angegebene Stand am 15.11.2026 ist Servertag 22 und damit Spielmonat 22. Bei inklusiver Zählung ergibt sich der 25.10.2026 als erster Servertag. Diese Zuordnung steht in `serverTimeline` in `reports.js`.

Die ersten beiden früheren Datierungsvorschläge wurden auf den ersten Servertag gelegt. Die bisherigen 24 Berichtstexte, Titel und IDs bleiben erhalten. Mehrere Berichte vom selben realen Datum stehen zusammen in einem Spielmonat. Monate ohne Bericht werden als solche angezeigt; es werden keine Tätigkeiten ergänzt. Die Spielzeit ist die seit dem Beitritt vergangene Zeit, keine Angabe zum Alter des Charakters.

Die Monatszählung wächst beim Laden mit dem realen Datum in Europe/Berlin weiter. Der aktuelle Dokumentationsstand am 21.11.2026 entspricht Servertag 28 und Spielmonat 28. Ein früher eingestelltes Geräte-Datum lässt den belegten Stand nicht zurückfallen.

| Rangaufstieg | Reales Datum | Spielmonat |
| --- | --- | --- |
| Bestätigter Genin | 28.10.2026 | 4 |
| Chunin | 04.11.2026 | 11 |
| Konin | 14.11.2026 | 21 |

## Berichte vom 15. bis 21.11.2026

Die Berichte 25 bis 31 ergänzen die Spielmonate 22 bis 28. Für den 15. bis 19.11. stehen allgemeine, bearbeitbare Entwürfe zu Training und Vorbereitung im Personenschutz. Die beiden letzten Einträge beruhen auf den Angaben des Nutzers: Am **20.11.2026** wurde bei einer Mission die Diplomatenführung geschützt; am **21.11.2026** wurde der Kampftest für die Personenschutz-Untereinheit der Diplomatie-Division gemeinsam mit dem Bruder **Hogiki** bestanden. Eine formelle Aufnahme in die Untereinheit wird damit nicht behauptet.

## Bedienung

- Den Einband oder „Mein Buch öffnen“ anklicken. Die flüssige Überblendung respektiert reduzierte Bewegung.
- In der Monatsübersicht einen Spielmonat auswählen, nach Begriffen suchen oder nach Thema filtern. Jeder Monatsabschnitt enthält alle zugehörigen Berichte.
- „Zurück“ und „Weiter“ sowie die Pfeiltasten wechseln zwischen Spielmonaten; Escape schließt das Buch.
- Auf dem Handy zwischen „Monate“ und „Lesen“ wechseln.
- „Bearbeiten“ ändert einzelne Berichte. Das reale Datum bestimmt ihren Spielmonat. Rangtitel und Rangdaten bleiben fest.
- Vorhandene Änderungen bleiben unter `supada-itami-reports-v1` erhalten. Frühere Datierungsvorschläge außerhalb der Serverzeit werden für die Zuordnung auf deren Grenzen begrenzt; gespeicherte Texte werden nicht überschrieben.
- „Text“ und „Drucken / PDF“ exportieren alle Spielmonate und alle 31 Berichte mit der Zeitregel und den realen Daten.

Berichte sind fiktive, bearbeitbare Textvorschläge für das Rollenspiel. Charakterbild, Daiton, Konin-Rang und Nindō „Der Tod ist keine Schande.“ bleiben erhalten.

## Aufbau und Direktlinks

- `index.html`: Einband, Monatsübersicht, Buch und Editor.
- `style.css`: responsives Layout, Animation und Druckansicht.
- `app.js`: Zeitzuordnung, Monatsnavigation, Suche, lokale Bearbeitung und Export.
- `reports.js`: Zeitbezug und alle Berichte mit stabilen IDs.
- `assets/supada-itami-white-20261121.webp`: freigestelltes Charakterbild mit weißen Haaren und Schulterschutz.

`#monat-9` führt jetzt tatsächlich zum neunten Spielmonat. Bestehende Links wie `#bericht-24` öffnen weiterhin den passenden Bericht innerhalb seines Spielmonats. `#start`, `#steckbrief` und `#inhalt` bleiben erhalten. Browser-Zurück und -Vorwärts werden unterstützt.

## Quellen und Lizenzen

Die Geometrie des Konoha-Blattsymbols stammt aus [Konohagakure.svg von Shisma auf Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Konohagakure.svg), gemeinfrei als einfache geometrische Form (PD-shape). Farben und Einbettung wurden angepasst. Inoffizielles Fanprojekt.

Cormorant Garamond und DM Sans werden unter der SIL Open Font License ausgeliefert; Lizenztexte liegen in `assets/fonts/`.
