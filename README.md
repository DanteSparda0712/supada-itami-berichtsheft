# Supada Itami · Das Konoha-Buch

Persönliches Naruto-Rollenspiel-Berichtsheft mit 13 vollständigen, bearbeitbaren Kapiteln. Statische Website auf GitHub Pages; keine Installation und kein Build notwendig.

## Bedienung

- Den grünen Einband oder „Mein Buch öffnen“ anklicken. Eine kurze, fest dimensionierte Einbandanimation führt zur Leseansicht.
- Im Inhaltsverzeichnis ein Kapitel auswählen, suchen oder nach Thema filtern. Jedes Kapitel wird vollständig angezeigt und kann vertikal gescrollt werden.
- „Zurück“ und „Weiter“ wechseln zwischen Kapiteln. Pfeiltasten funktionieren außerhalb von Eingabefeldern; Escape schließt das Buch.
- Auf kleinen Bildschirmen zwischen „Inhalt“ und „Lesen“ wechseln.
- Über „Bearbeiten“ eigene Texte, Titel und Daten eintragen. Änderungen liegen ausschließlich im Browser dieses Geräts, unter dem bestehenden Schlüssel `supada-itami-reports-v1`.
- „Text“ lädt alle Berichte inklusive Änderungen herunter. „Drucken / PDF“ enthält alle 13 vollständigen Kapitel.
- Die Animation kann am Desktop ausgeschaltet werden. Die Systemeinstellung für reduzierte Bewegung wird auf allen Geräten berücksichtigt.

Die Rangtitel und Daten sind fest: **Neuer Rang: Bestätigter Genin · 28.10.2026** und **Neuer Rang: Chunin · 04.11.2026**. Ihre Berichtstexte können bearbeitet werden. Andere Tätigkeiten und weitere Daten sind fiktive, bearbeitbare Textvorschläge. Die vier ursprünglichen ausführlichen Berichte sind unverändert in `reports.js` enthalten.

## Aufbau

- `index.html`: Einband, Buch, Editor und zugängliche Bedienelemente.
- `style.css`: responsives Layout, dezente Einbandanimation und Druckansicht.
- `app.js`: einfache Zustände für Einband, Öffnen und Lesen; Kapitelwahl, lokale Bearbeitung und Export.
- `reports.js`: alle 13 Originaleinträge.
- `assets/supada-itami.png`: Charakterbild von Supada Itami.
- `assets/konoha-emblem.svg`: Konoha-Blattsymbol als skalierbare Vektorgrafik.

Direktlinks wie `#start`, `#inhalt`, `#steckbrief`, `#bericht-13` und bestehende `#monat-13`-Links werden unterstützt. Browser-Zurück und -Vorwärts stellen die jeweilige Ansicht wieder her. Schriften und Bilder werden lokal ausgeliefert, ohne externe Schriftanfragen.

## Quellen und Lizenzen

Die Geometrie des Konoha-Blattsymbols stammt aus [Konohagakure.svg von Shisma auf Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Konohagakure.svg), als einfache geometrische Form gemeinfrei (PD-shape). Die Pfade wurden unverändert übernommen; Farben und Einbettung wurden angepasst. Es handelt sich um ein inoffizielles Fanprojekt.

Cormorant Garamond und DM Sans werden unter der SIL Open Font License ausgeliefert. Lizenztexte liegen in `assets/fonts/`.
