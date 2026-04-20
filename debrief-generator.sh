#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# William HQ — End-of-Day Debrief Generator
# USS Cerritos | Admiral's offline-first telemetry pattern
#
# Reads:  heartbeats.jsonl + receipts.jsonl + events.jsonl (in william-e2e-proof/)
# Writes: DEBRIEF-YYYY-MM-DD.md  (in william-hq/)
#
# Scheduled via launchd at 18:30 AEST daily.
# Safe to run manually: bash debrief-generator.sh
# ═══════════════════════════════════════════════════════════════════════════════

# Note: -o pipefail intentionally omitted — grep exits 1 on zero matches which is normal
set -eu

WORKSPACE="/Users/williamreinhard/.openclaw/workspace"
DATA_DIR="$WORKSPACE/projects/william-e2e-proof"
HQ_DIR="$WORKSPACE/projects/william-hq"
DEBRIEFS_DIR="$HQ_DIR/debriefs"

HEARTBEATS="$DATA_DIR/heartbeats.jsonl"
RECEIPTS="$DATA_DIR/receipts.jsonl"
EVENTS="$DATA_DIR/events.jsonl"

TODAY=$(date +%Y-%m-%d)
DEBRIEF_FILE="$DEBRIEFS_DIR/DEBRIEF-$TODAY.md"

# School hours: 08:00–15:30 AEST
SCHOOL_START="08:00"
SCHOOL_END="15:30"

mkdir -p "$DEBRIEFS_DIR"

echo "[DEBRIEF] Generating debrief for $TODAY..."

# ── Helper: parse JSONL and filter by today + time range ──────────────────────
# Filter entries for today (by received_at or timestamp field)
filter_today() {
  local file="$1"
  local field="${2:-received_at}"
  if [[ ! -f "$file" ]]; then echo "[]"; return; fi
  grep "\"$TODAY" "$file" 2>/dev/null || true
}

# ── Extract data ───────────────────────────────────────────────────────────────
HEARTBEAT_LINES=$(filter_today "$HEARTBEATS" "received_at")
RECEIPT_LINES=$(filter_today "$RECEIPTS" "received_at")
EVENT_LINES=$(filter_today "$EVENTS" "received_at")

# Count using awk filtering+counting in one pass — awk always exits 0
HB_COUNT=$(    echo "$HEARTBEAT_LINES" | awk '/"type":"heartbeat"/{n++} END{print n+0}')
RECEIPT_COUNT=$(echo "$RECEIPT_LINES"  | awk '/"type":"receipt"/{n++}  END{print n+0}')
EVENT_COUNT=$(  echo "$EVENT_LINES"    | awk '/"type":"event"/{n++}    END{print n+0}')

# ── School hours heartbeats ────────────────────────────────────────────────────
# Extract timestamps for school-hours analysis (08:00-15:30)
SCHOOL_HB=$(echo "$HEARTBEAT_LINES" | grep -E "\"(0[89]|1[0-5]):[0-5][0-9]:[0-5][0-9]" 2>/dev/null || true)
SCHOOL_HB_COUNT=$(echo "$SCHOOL_HB" | awk '/"type"/{n++} END{print n+0}')

# ── Pre-teach check ────────────────────────────────────────────────────────────
PRETEACH_RENDERED=$(echo "$RECEIPT_LINES" | grep '"event":"rendered"' | grep '"preteach-' 2>/dev/null || true)
PRETEACH_RENDER_TIME=""
if [[ -n "$PRETEACH_RENDERED" ]]; then
  # Extract time from first render event
  PRETEACH_RENDER_TIME=$(echo "$PRETEACH_RENDERED" | head -1 | grep -oE '"received_at":"[^"]*"' | cut -d'"' -f4 | cut -c12-16 || echo "unknown")
fi

# ── Canvas sync events ─────────────────────────────────────────────────────────
CANVAS_SYNCS=$(echo "$EVENT_LINES" | grep '"event_type":"canvas_sync"' 2>/dev/null || true)
CANVAS_SYNC_COUNT=$(echo "$CANVAS_SYNCS" | awk '/"event_type"/{n++} END{print n+0}')
CANVAS_FIRST_SYNC=""
if [[ -n "$CANVAS_SYNCS" ]]; then
  CANVAS_FIRST_SYNC=$(echo "$CANVAS_SYNCS" | head -1 | grep -oE '"received_at":"[^"]*"' | cut -d'"' -f4 | cut -c12-16 || echo "unknown")
fi

# ── Focus cam events ───────────────────────────────────────────────────────────
FOCUS_EVENTS=$(echo "$EVENT_LINES" | grep '"event_type":"focus_break"\|"event_type":"focus_cam"' 2>/dev/null || true)
FOCUS_COUNT=$(echo "$FOCUS_EVENTS" | awk '/"event_type"/{n++} END{print n+0}')

# ── Interactions ───────────────────────────────────────────────────────────────
INTERACTIONS=$(echo "$EVENT_LINES" | grep '"event_type":"interaction"' 2>/dev/null || true)
INTERACTION_COUNT=$(echo "$INTERACTIONS" | awk '/"event_type"/{n++} END{print n+0}')

# ── Task completions ───────────────────────────────────────────────────────────
TASK_COMPLETES=$(echo "$EVENT_LINES" | grep '"event_type":"task_complete"' 2>/dev/null || true)
TASK_COUNT=$(echo "$TASK_COMPLETES" | awk '/"event_type"/{n++} END{print n+0}')

# ── Silent periods during school hours ────────────────────────────────────────
# A "silent period" = 30+ min gap between heartbeats during school hours
# Extract school-hours timestamps sorted
SILENT_PERIODS=()
if [[ -n "$SCHOOL_HB" ]]; then
  PREV_MINS=""
  while IFS= read -r line; do
    TS=$(echo "$line" | grep -oE '"received_at":"[^"]*"' | cut -d'"' -f4 | cut -c12-16 || true)
    if [[ -n "$TS" ]]; then
      H=$(echo "$TS" | cut -d: -f1)
      M=$(echo "$TS" | cut -d: -f2)
      CURR_MINS=$(( 10#$H * 60 + 10#$M ))
      if [[ -n "$PREV_MINS" ]]; then
        GAP=$(( CURR_MINS - PREV_MINS ))
        if (( GAP >= 30 )); then
          PREV_TS_H=$(( PREV_MINS / 60 ))
          PREV_TS_M=$(( PREV_MINS % 60 ))
          PREV_TS=$(printf "%02d:%02d" $PREV_TS_H $PREV_TS_M)
          SILENT_PERIODS+=("$PREV_TS → $TS (${GAP} min silence)")
        fi
      fi
      PREV_MINS=$CURR_MINS
    fi
  done <<< "$SCHOOL_HB"
fi

# ── Build timeline ─────────────────────────────────────────────────────────────
# Collect all today's events with timestamps, sorted
ALL_EVENTS_SORTED=""
if [[ -f "$HEARTBEATS" ]] || [[ -f "$RECEIPTS" ]] || [[ -f "$EVENTS" ]]; then
  ALL_EVENTS_SORTED=$(
    { [[ -f "$HEARTBEATS" ]] && cat "$HEARTBEATS" || true; 
      [[ -f "$RECEIPTS" ]] && cat "$RECEIPTS" || true;
      [[ -f "$EVENTS" ]] && cat "$EVENTS" || true; } \
    | grep "\"$TODAY" \
    | sort -t'"' -k4 2>/dev/null \
    || true
  )
fi

# ── Overall status ─────────────────────────────────────────────────────────────
if (( SCHOOL_HB_COUNT > 10 )); then
  STATUS="🟢 GREEN — App active throughout school"
  STATUS_DETAIL="Strong engagement: $SCHOOL_HB_COUNT heartbeats during school hours"
elif (( SCHOOL_HB_COUNT > 3 )); then
  STATUS="🟡 AMBER — Limited school activity"
  STATUS_DETAIL="Some gaps detected: only $SCHOOL_HB_COUNT school-hours heartbeats"
else
  STATUS="🔴 RED — No school activity detected"
  STATUS_DETAIL="App was not open during school hours, or data not yet uploaded"
fi

# ── Write debrief ──────────────────────────────────────────────────────────────
cat > "$DEBRIEF_FILE" << DEBRIEF_EOF
# 📊 William's School Day Debrief — $TODAY
*Generated: $(date '+%Y-%m-%d %H:%M AEST') | USS Cerritos*

---

## Overall Status: $STATUS
$STATUS_DETAIL

---

## 📡 Telemetry Summary

| Metric | Count |
|--------|-------|
| Total heartbeats today | $HB_COUNT |
| Heartbeats during school (${SCHOOL_START}–${SCHOOL_END}) | $SCHOOL_HB_COUNT |
| Delivery receipts logged | $RECEIPT_COUNT |
| Events logged | $EVENT_COUNT |
| Interactions | $INTERACTION_COUNT |
| Task completions | $TASK_COUNT |
| Canvas sync events | $CANVAS_SYNC_COUNT |
| Focus cam sessions | $FOCUS_COUNT |

---

## 🧠 Pre-Teach Check

DEBRIEF_EOF

if [[ -n "$PRETEACH_RENDERED" ]]; then
  echo "✅ **Pre-teach rendered** at $PRETEACH_RENDER_TIME" >> "$DEBRIEF_FILE"
  echo "" >> "$DEBRIEF_FILE"
  echo "William had tomorrow's subjects loaded before school. Good prep." >> "$DEBRIEF_FILE"
else
  echo "⚠️ **Pre-teach NOT rendered today**" >> "$DEBRIEF_FILE"
  echo "" >> "$DEBRIEF_FILE"
  echo "No pre-teach render receipt received. Either the app wasn't opened before school" >> "$DEBRIEF_FILE"
  echo "or data hasn't synced yet (check again after home Wi-Fi upload)." >> "$DEBRIEF_FILE"
fi

cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF

---

## 📚 Canvas Sync Activity

DEBRIEF_EOF

if [[ "$CANVAS_SYNC_COUNT" -gt 0 ]]; then
  echo "✅ Canvas synced **$CANVAS_SYNC_COUNT time(s)** today. First sync at **$CANVAS_FIRST_SYNC**." >> "$DEBRIEF_FILE"
  echo "" >> "$DEBRIEF_FILE"
  echo "Canvas assignment feed was live during the day." >> "$DEBRIEF_FILE"
else
  echo "⚠️ No Canvas sync events detected today." >> "$DEBRIEF_FILE"
fi

cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF

---

## 🎯 Focus Activity

DEBRIEF_EOF

if [[ "$FOCUS_COUNT" -gt 0 ]]; then
  echo "✅ **$FOCUS_COUNT focus session(s)** detected (Focus Cam or focus break events)." >> "$DEBRIEF_FILE"
else
  echo "No Focus Cam events recorded today." >> "$DEBRIEF_FILE"
fi

cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF

---

## ⚠️ Silent Periods (school hours)

DEBRIEF_EOF

if [[ ${#SILENT_PERIODS[@]} -eq 0 ]]; then
  echo "✅ No significant silent periods — app was consistently active." >> "$DEBRIEF_FILE"
else
  echo "The following gaps (30+ min) were detected during school hours:" >> "$DEBRIEF_FILE"
  echo "" >> "$DEBRIEF_FILE"
  for period in "${SILENT_PERIODS[@]}"; do
    echo "- ⏸ $period" >> "$DEBRIEF_FILE"
  done
  echo "" >> "$DEBRIEF_FILE"
  echo "*(Could be class without laptop, lunch break, or device off)*" >> "$DEBRIEF_FILE"
fi

cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF

---

## 📋 Timeline (school hours only)

| Time | Event |
|------|-------|
DEBRIEF_EOF

# Build timeline table from sorted events, school hours only
if [[ -n "$ALL_EVENTS_SORTED" ]]; then
  while IFS= read -r line; do
    if [[ -z "$line" ]]; then continue; fi
    TS=$(echo "$line" | grep -oE '"received_at":"[^"]*"' | cut -d'"' -f4 | cut -c12-16 || true)
    if [[ -z "$TS" ]]; then continue; fi
    
    # Only school hours
    H=$(echo "$TS" | cut -d: -f1 || true)
    if (( 10#$H < 8 || 10#$H > 15 )); then continue; fi
    
    ETYPE=$(echo "$line" | grep -oE '"type":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "unknown")
    
    case "$ETYPE" in
      heartbeat)
        BATT=$(echo "$line" | grep -oE '"battery":[0-9]+' | cut -d: -f2 || echo "?")
        LABEL="💓 Heartbeat (battery: ${BATT}%)"
        ;;
      receipt)
        EV=$(echo "$line" | grep -oE '"event":"[^"]*"' | cut -d'"' -f4 || echo "?")
        MID=$(echo "$line" | grep -oE '"message_id":"[^"]*"' | cut -d'"' -f4 || echo "?")
        LABEL="📬 Receipt: $EV ($MID)"
        ;;
      event)
        EV=$(echo "$line" | grep -oE '"event_type":"[^"]*"' | cut -d'"' -f4 || echo "?")
        LABEL="📌 Event: $EV"
        ;;
      *)
        LABEL="📍 $ETYPE"
        ;;
    esac
    
    echo "| $TS | $LABEL |" >> "$DEBRIEF_FILE"
  done <<< "$ALL_EVENTS_SORTED"
else
  echo "| – | No events recorded during school hours |" >> "$DEBRIEF_FILE"
fi

cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF

---

## 💬 Recommended Notes for Parents

DEBRIEF_EOF

# Generate contextual recommendations
if [[ "$STATUS" == *"GREEN"* ]]; then
  cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF
- ✅ App was actively used during school — good engagement
DEBRIEF_EOF
fi

if [[ "${#SILENT_PERIODS[@]}" -gt 2 ]]; then
  cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF
- ⚠️ Multiple silent periods detected — worth checking with William if he encountered difficulties
DEBRIEF_EOF
fi

if [[ -n "$PRETEACH_RENDERED" ]]; then
  cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF
- ✅ William viewed tomorrow's pre-teach content — he arrived prepared
DEBRIEF_EOF
fi

if [[ "$CANVAS_SYNC_COUNT" -eq 0 ]]; then
  cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF
- ⚠️ Canvas didn't sync today — check if there are upcoming assignments not showing
DEBRIEF_EOF
fi

if [[ "$TASK_COUNT" -gt 0 ]]; then
  cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF
- ✅ William completed $TASK_COUNT task(s) — worth acknowledging this evening
DEBRIEF_EOF
fi

if [[ "$HB_COUNT" -eq 0 ]]; then
  cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF
- ⚠️ No telemetry data received today — app may not have been used, or hasn't synced from school yet
- Try running this script again after William gets home and connects to home Wi-Fi
DEBRIEF_EOF
fi

cat >> "$DEBRIEF_FILE" << DEBRIEF_EOF

---

## 🛠️ Debug Info
- Data source: \`$DATA_DIR\`
- heartbeats.jsonl lines today: $HB_COUNT
- receipts.jsonl lines today: $RECEIPT_COUNT
- events.jsonl lines today: $EVENT_COUNT
- Report generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

*USS Cerritos — William's AI Support System*
DEBRIEF_EOF

echo "[DEBRIEF] ✅ Done → $DEBRIEF_FILE"
echo "[DEBRIEF] Summary: $STATUS"
