# Mission Control — Golden Ratio (Static)

**Purpose:** A/B comparison build. Same theme as William's existing pirate Mission Control, but every dimension is derived from φ (1.618…). No JS, no state, no logic — pure layout.

## How to compare

```bash
# original (functional) — port 8001
cd ~/.openclaw/workspace/projects/william-hq/mission-control && python3 -m http.server 8001 &

# golden ratio (static) — port 8002
cd ~/.openclaw/workspace/projects/william-hq/mission-control-golden && python3 -m http.server 8002 &
```

Then open both side-by-side:
- http://localhost:8001 — original
- http://localhost:8002 — φ build

## What's φ-derived

| Element | Ratio |
|---|---|
| Page columns (left:right) | 1 : φ → 38.2% / 61.8% |
| Left pane rows (streak:haki) | 1 : φ |
| Right pane rows (kanban:log) | φ : 1 |
| Topbar height | 16 × φ³ (~67.8 px) |
| Type scale | 10 → 13 → 16 → 26 → 42 → 68 (each ×φ) |
| Spacing tokens | 16 / φⁿ and 16 × φⁿ |
| Panel border-radius | 16 / φ |
| Watermark rectangle (bottom-right) | 1 : φ proof |

## What stayed the same
- Colour palette (parchment + navy + gold + red)
- Font (Pirata One)
- Pirate / One Piece theme
- Same content slots (bounty, level, streak, haki, fruits, kanban, log)

## What's different from original
- Original uses fluid `clamp()` and component-driven sizing
- φ build uses a strict mathematical scale — no clamps, no arbitrary px
- No animations, no JS — purely layout for visual comparison
