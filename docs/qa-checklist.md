# QA-Checkliste Phase 6

- [x] 1. Sehr lange Namen — `break-words` + `max-w-full` auf Handoff/Vote/Result-Screens
- [x] 2. Unentschieden im Voting — Patt ergibt 1 Punkt statt 2 für den Blender
- [x] 3. 3 Spieler + Assoziation-Modus — Warnung im Config-Screen
- [x] 4. Zurück-Navigation — disabled-State während Handoff-Transition
- [x] 5. Landscape iOS — Diskussions-Timer mit `text-[min(8vw,6rem)]` responsiv
- [x] 6. Back-Button im Browser — `beforeunload`-Warnung während laufender Runde
- [x] 7. Double-Tap-Zoom — `touch-action: manipulation` auf allen Buttons
- [x] 8. Timer-State bei Abstimmung — Timer wird in startVoting gestoppt (bereits korrekt)
- [x] 9. Custom-Wörter ohne Assoziationen — Warnung im Config-Screen bei Assoziation-Modus
- [x] 10. Scores zurücksetzen — neuer Button im Scoreboard-Screen
