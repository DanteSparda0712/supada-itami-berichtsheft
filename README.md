# Supada Itami · Shinobi-Berichtsheft

Interaktives Konoha-Buch für Supada Itami in Zenkai DE. Der grüne Buchdeckel mit Konoha-Symbol, Charakterporträt und Namen lässt sich öffnen. Das aufgeschlagene Buch zeigt links ein Inhaltsverzeichnis mit 13 Kapiteln und rechts den Steckbrief oder die gewählte Buchseite. Längere Kapitel werden vollständig auf mehrere Seiten verteilt; Pfeile, Pfeiltasten und Wischgesten blättern durch das Buch. Auf dem Handy wechseln die Ansichten Inhalt / Buchseite. Die vier ursprünglichen Musterberichte und alle 13 vollständigen Datensätze bleiben erhalten.

Die Öffnungsanimation startet exakt mit der sichtbaren Größe und Position des Buches, klappt den Deckel in 3D auf und fächert vier Papierblätter auf. Die Innenseiten beginnen in derselben Geometrie; zusätzlicher Zoom und Layoutsprünge sind entfernt. Anschließend erscheinen Inhaltsverzeichnis und Buchseite. Die Animation dauert 1,8 Sekunden, lässt sich mit Escape abbrechen und läuft bei jedem erneuten Öffnen. Reduzierte Bewegung und direkte Kapitellinks überspringen sie. Der Bewegungsschalter ist auch auf dem Handy erreichbar.

- Neuer Rang: Bestätigter Genin · 28.10.2026
- Neuer Rang: Chunin · 04.11.2026

Weitere Daten und Tätigkeiten sind als fiktive Textvorschläge gekennzeichnet und im Browser bearbeitbar. Die beiden bestätigten Rangtitel und Rangdaten bleiben erhalten. Eigene Texte bleiben unter demselben lokalen Speicherschlüssel wie in der vorherigen Version erhalten. Das Inhaltsverzeichnis bietet Suche und Kategoriefilter. Textdownload und Drucken / PDF enthalten alle 13 vollständigen aktuellen Kapitel. Bewegungen respektieren die Systemeinstellung und können zusätzlich abgeschaltet werden. Enter öffnet das Buch, links/rechts blättert, I zeigt den Inhalt, E öffnet den Editor und Escape klappt das Buch zu.

## Veröffentlichung

Buildlose HTML/CSS/JavaScript-Seite. index.html, style.css, reports.js, app.js und assets/ liegen im Hauptverzeichnis. Der vorhandene GitHub-Pages-Workflow veröffentlicht Änderungen an main automatisch. Kein Build-Schritt, keine zusätzlichen Pakete. reports.js enthält die 13 erhaltenen Originaldatensätze. #start zeigt den geschlossenen Buchdeckel. #inhalt öffnet das Inhaltsverzeichnis, #steckbrief die Titelseite. #bericht-1 bis #bericht-13 und die bisherigen #monat-1 bis #monat-13 öffnen das passende Kapitel direkt.

https://dantesparda0712.github.io/supada-itami-berichtsheft/
