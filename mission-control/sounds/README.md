# Sounds — Den Den Mushi Audio

All sound effects are generated via the Web Audio API (no files needed).
See `bounty-system.js` → `playSound()` for implementation.

## Sound Events
- `level_up` — 8-bit triumphant fanfare (square wave melody)
- `task_complete` — coin-collect chime (3 ascending sine tones)
- `den_den` — snail ring (alternating 800Hz/1000Hz square wave)
- `achievement` — ascending sawtooth scale

## Why No Audio Files?
- Zero network requests = works offline
- No copyright risk (no downloaded One Piece audio)
- Parent can toggle in top bar (🔊 button)
- Web Audio API works in all modern browsers

## If You Want Real Sound Files
Legal 8-bit/chiptune sources:
- OpenGameArt.org (CC0 licence, free for all uses)
- freesound.org (filter: CC0)
- itch.io free game audio packs

Do NOT download any official One Piece music/sound effects.
