# Supada Itami · Das Konoha-Buch

Persönliches Naruto-Rollenspiel-Berichtsheft mit 24 vollständigen, bearbeitbaren Kapiteln. Statische Website auf GitHub Pages; keine Installation und kein Build notwendig.

## Bedienung

- Den grünen Einband oder „Mein Buch öffnen“ anklicken. Eine kurze, fest dimensionierte Einbandanimation führt zur Leseansicht.
- Im Inhaltsverzeichnis ein Kapitel auswählen, suchen oder nach Thema filtern. Jedes Kapitel wird vollständig angezeigt und kann vertikal gescrollt werden.
- „Zurück“ und „Weiter“ wechseln zwischen Kapiteln. Pfeiltasten funktionieren außerhalb von Eingabefeldern; Escape schließt das Buch.
- Auf kleinen Bildschirmen zwischen „Inhalt“ und „Lesen“ wechseln.
- Über „Bearbeiten“ eigene Texte, Titel und Daten eintragen. Änderungen liegen ausschließlich im Browser dieses Geräts, unter dem bestehenden Schlüssel `supada-itami-reports-v1`.
- „Text“ lädt alle Berichte inklusive Änderungen herunter. „Drucken / PDF“ enthält alle 24 vollständigen Kapitel.
- Die Animation kann am Desktop ausgeschaltet werden. Die Systemeinstellung für reduzierte Bewegung wird auf allen Geräten berücksichtigt.

Die Rangtitel und Daten sind fest: **Neuer Rang: Bestätigter Genin · 28.10.2026**, **Neuer Rang: Chunin · 04.11.2026** und **Neuer Rang: Konin · 14.11.2026**. Ihre Berichtstexte können bearbeitet werden. Andere Tätigkeiten und weitere Daten sind fiktive, bearbeitbare Textvorschläge. Die vier ursprünglichen ausführlichen Berichte sind unverändert in `reports.js` enthalten.

## Neue Berichte vom 08.11.2026

Die Kapitel 14 bis 18 ergänzen die Erkundigungen zur Polizei, zur Sensei-Tätigkeit und zur Palastdivision sowie den Kontakt zu neuen Schülern über den früheren Lehrer und die Vermittlung von Taijutsu-Grundlagen. Alle fünf Einträge beziehen sich auf denselben Tag. Die bisherigen 13 Berichte bleiben unverändert.

## Tagesberichte vom 09. bis 14.11.2026

Die Kapitel 19 bis 24 setzen das Buch mit einem Eintrag pro Tag fort: Taijutsu mit den Schülern, Raiton-Training, der bewusste Umgang mit Daiton, weitere Orientierung im Dorf und ein Rückblick auf die eigene Verantwortung. Kapitel 24 hält den vom Nutzer angegebenen Aufstieg zum **Konin am 14.11.2026** fest. Konin ist auch auf Einband und Steckbrief der aktuelle Rang; alle drei Rangaufstiege bleiben in der persönlichen Zeitleiste erhalten. Die bisherigen 18 Berichte sind unverändert.

## Aufbau

- `index.html`: Einband, Buch, Editor und zugängliche Bedienelemente.
- `style.css`: responsives Layout, dezente Einbandanimation und Druckansicht.
- `app.js`: einfache Zustände für Einband, Öffnen und Lesen; Kapitelwahl, lokale Bearbeitung und Export.
- `reports.js`: alle 24 Berichte.
- `assets/supada-itami-red.webp`: freigestelltes Charakterbild von Supada Itami mit roten Haaren.
- `assets/konoha-emblem.svg`: Konoha-Blattsymbol als skalierbare Vektorgrafik.

Direktlinks wie `#start`, `#inhalt`, `#steckbrief`, `#bericht-13` und bestehende `#monat-13`-Links werden unterstützt. Browser-Zurück und -Vorwärts stellen die jeweilige Ansicht wieder her. Schriften und Bilder werden lokal ausgeliefert, ohne externe Schriftanfragen.

## Quellen und Lizenzen

Die Geometrie des Konoha-Blattsymbols stammt aus [Konohagakure.svg von Shisma auf Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Konohagakure.svg), als einfache geometrische Form gemeinfrei (PD-shape). Die Pfade wurden unverändert übernommen; Farben und Einbettung wurden angepasst. Es handelt sich um ein inoffizielles Fanprojekt.

Cormorant Garamond und DM Sans werden unter der SIL Open Font License ausgeliefert. Lizenztexte liegen in `assets/fonts/`.
