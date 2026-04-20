/**
 * SHIP SCENE — Thousand Sunny Animated Crew Scene
 * DOM-based animation with CSS keyframes
 * Event-driven crew movement + speech bubbles
 */

'use strict';

const ShipScene = (() => {

  // ─── Crew config ──────────────────────────────────────────────────
  const CREW = {
    luffy: {
      id: 'luffy',
      name: 'Captain William',
      role: 'Captain',
      station: 'centre-deck',
      stationLabel: 'Captain\'s Spot',
      spriteId: 'sprite-luffy',
      defaultX: 48, // percent
      defaultY: 52,
      zIndex: 5,
      quotes: [
        "I'm gonna be King of the Pirates!",
        "Let's go on an adventure!",
        "My nakama are the best!",
        "I'm not gonna run away!",
        "Gomu Gomu no..."
      ]
    },
    zoro: {
      id: 'zoro',
      name: 'Jarvis',
      role: 'First Mate / Focus',
      station: 'crows-nest',
      stationLabel: 'Crow\'s Nest',
      spriteId: 'sprite-zoro',
      defaultX: 52,
      defaultY: 10,
      zIndex: 4,
      quotes: [
        "Nothing worth doing is easy.",
        "I will become the world's greatest swordsman.",
        "Focus. The mission is clear.",
        "One step at a time.",
        "Don't lose sight of your goal."
      ]
    },
    nami: {
      id: 'nami',
      name: 'Study Helper',
      role: 'Navigator',
      station: 'nav-table',
      stationLabel: 'Navigation Table',
      spriteId: 'sprite-nami',
      defaultX: 25,
      defaultY: 55,
      zIndex: 4,
      quotes: [
        "I've charted the course — stay on it!",
        "New assignment detected on the radar!",
        "The Log Pose is pointing forward!",
        "We're making progress, Captain!",
        "Study hard or I'll raise the price!"
      ]
    },
    chopper: {
      id: 'chopper',
      name: 'Mr Bean',
      role: 'Doctor / Support',
      station: 'infirmary',
      stationLabel: 'Ship\'s Infirmary',
      spriteId: 'sprite-chopper',
      defaultX: 20,
      defaultY: 72,
      zIndex: 4,
      quotes: [
        "You're doing amazing, William!",
        "Remember to take breaks!",
        "I made cotton candy! (brain food)",
        "You've got this! I believe in you!",
        "Point d'orgue... I mean, good job!"
      ]
    },
    usopp: {
      id: 'usopp',
      name: 'Focus Cam',
      role: 'Sniper',
      station: 'sniper-perch',
      stationLabel: 'Sniper Perch',
      spriteId: 'sprite-usopp',
      defaultX: 72,
      defaultY: 55,
      zIndex: 4,
      quotes: [
        "The great warrior Usopp sees your progress!",
        "Focus session ready — I've got eyes on the target!",
        "Stay on task! I'm watching!",
        "You're the bravest captain I know!",
        "MY FRIENDS ARE INVINCIBLE!"
      ]
    }
  };

  // Event type → station mapping
  const EVENT_ROUTES = {
    'sync_complete': { crew: 'nami', quote: "Canvas sync complete — course plotted!" },
    'task_completed': { crew: 'usopp', quote: "Target acquired and eliminated!" },
    'streak_milestone': { crew: 'zoro', quote: "Day after day. That's the way of the sword." },
    'focus_break': { crew: 'chopper', quote: "Time for a break! Doctor's orders!" },
    'new_assignment': { crew: 'nami', quote: "New island spotted on the radar!" },
    'crew_meeting': { crew: 'all', quote: "Crew meeting on deck!" },
    'level_up': { crew: 'luffy', quote: "I'm getting stronger!" }
  };

  // ─── State ────────────────────────────────────────────────────────
  let pollInterval = null;
  let lastEventId = null;
  let activeBubbles = {};
  let sceneReady = false;

  // ─── Build scene ──────────────────────────────────────────────────
  function init() {
    const container = document.getElementById('ship-scene-inner');
    if (!container) return;

    container.innerHTML = buildSceneHTML();
    sceneReady = true;

    // Attach crew click handlers
    Object.keys(CREW).forEach(id => {
      const el = document.getElementById(`crew-${id}`);
      if (el) {
        el.addEventListener('click', () => crewClicked(id));
      }
    });

    // Start idle breathing
    startIdleAnimations();

    // Start event polling
    startEventPolling();

    console.log('[ShipScene] Thousand Sunny ready. Crew at their stations.');
  }

  function buildSceneHTML() {
    return `
      <div id="sunny-ship" style="position:relative; width:100%; max-width:700px; margin:0 auto; min-height:260px;">

        <!-- The Thousand Sunny SVG -->
        <div id="ship-svg-wrapper" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
          <div id="ship-body" style="position:relative; width:min(500px,90%); margin:0 auto;">
            ${buildSunnySVG()}
          </div>
        </div>

        <!-- Sea waves under ship -->
        <div id="ship-sea" style="
          position:absolute; bottom:0; left:0; right:0; height:40px;
          background: linear-gradient(180deg, transparent 0%, rgba(26,58,138,0.6) 100%);
          border-radius: 0 0 8px 8px;
          pointer-events:none;
        ">
          <div class="wave" style="opacity:0.4; transform:scaleY(0.5);"></div>
        </div>

        <!-- Crew sprites positioned absolutely -->
        ${Object.entries(CREW).map(([id, c]) => `
          <div
            id="crew-${id}"
            class="crew-sprite crew-idle"
            style="
              position:absolute;
              left:${c.defaultX}%;
              top:${c.defaultY}%;
              transform:translate(-50%,-50%);
              z-index:${c.zIndex};
              cursor:pointer;
              transition: left 0.8s ease, top 0.8s ease;
            "
            title="${c.name} — ${c.role}"
          >
            ${getCrewSVG(id)}
            <div class="crew-label" style="
              text-align:center;
              font-family:var(--font-pirate);
              font-size:9px;
              color:var(--gold);
              text-shadow:1px 1px 2px rgba(0,0,0,0.9);
              margin-top:2px;
              white-space:nowrap;
            ">${c.name}</div>
          </div>
        `).join('')}

      </div>
    `;
  }

  function buildSunnySVG() {
    // Use the ship SVG from sprites module or inline it
    if (window.CREW_SVGS?.ship) {
      return window.CREW_SVGS.ship;
    }
    // Fallback: simple ship outline
    return `<svg viewBox="0 0 500 220" style="width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="woodG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#8B6914"/>
          <stop offset="100%" style="stop-color:#5C4410"/>
        </linearGradient>
        <linearGradient id="sailG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#F5F0E0"/>
          <stop offset="100%" style="stop-color:#EDE5C0"/>
        </linearGradient>
      </defs>

      <!-- Hull -->
      <path d="M60 150 L440 150 L420 200 L80 200 Z" fill="url(#woodG)" stroke="#3a2a00" stroke-width="2"/>
      <line x1="80" y1="165" x2="420" y2="165" stroke="#5C4410" stroke-width="1"/>
      <line x1="90" y1="180" x2="410" y2="180" stroke="#5C4410" stroke-width="1"/>
      <line x1="95" y1="193" x2="405" y2="193" stroke="#5C4410" stroke-width="1"/>

      <!-- Green deck -->
      <rect x="55" y="130" width="390" height="22" fill="#3A8A3A" stroke="#1a5a1a" stroke-width="1.5"/>

      <!-- Deck details - grass -->
      <path d="M80 138 Q90 130 100 138 Q110 130 120 138" stroke="#2a6a2a" stroke-width="1" fill="none"/>
      <path d="M180 138 Q190 130 200 138 Q210 130 220 138" stroke="#2a6a2a" stroke-width="1" fill="none"/>
      <path d="M280 138 Q290 130 300 138 Q310 130 320 138" stroke="#2a6a2a" stroke-width="1" fill="none"/>
      <path d="M370 138 Q380 130 390 138 Q400 130 410 138" stroke="#2a6a2a" stroke-width="1" fill="none"/>

      <!-- Railing -->
      <rect x="55" y="118" width="390" height="12" fill="#8B6914" stroke="#5C4410" stroke-width="1" rx="2"/>

      <!-- Railing posts -->
      ${[80,110,140,200,260,320,370,400,430].map(x => `<rect x="${x}" y="108" width="5" height="22" fill="#5C4410"/>`).join('')}

      <!-- Main mast -->
      <rect x="243" y="10" width="14" height="125" fill="#5C4410" stroke="#3a2a00" stroke-width="1.5"/>

      <!-- Crow's nest -->
      <path d="M210 38 L290 38 L283 68 L217 68 Z" fill="#8B6914" stroke="#5C4410" stroke-width="2"/>
      <rect x="213" y="58" width="74" height="12" fill="#6B4A10"/>

      <!-- Main sail -->
      <path d="M257 15 L257 118 L370 112 L370 22 Z" fill="url(#sailG)" stroke="#C0B080" stroke-width="1.5"/>

      <!-- Sail marking - Sun face style -->
      <circle cx="313" cy="67" r="32" fill="none" stroke="#CC2200" stroke-width="3"/>
      <circle cx="313" cy="67" r="22" fill="none" stroke="#CC2200" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="313" cy="67" r="8" fill="#E8762A" opacity="0.7"/>

      <!-- Fore mast -->
      <rect x="133" y="28" width="10" height="100" fill="#5C4410" stroke="#3a2a00" stroke-width="1.5"/>

      <!-- Fore sail -->
      <path d="M143 35 L143 120 L220 115 L220 42 Z" fill="url(#sailG)" stroke="#C0B080" stroke-width="1.5" opacity="0.9"/>

      <!-- Lion figurehead -->
      <ellipse cx="45" cy="152" rx="38" ry="30" fill="#F5A020" stroke="#8B5E3C" stroke-width="3"/>
      <circle cx="45" cy="152" rx="34" ry="28" fill="none" stroke="#C07010" stroke-width="8"/>
      <ellipse cx="45" cy="152" rx="26" ry="24" fill="#F5C050"/>
      <!-- Lion face -->
      <circle cx="36" cy="148" r="4" fill="#2a1a00"/>
      <circle cx="54" cy="148" r="4" fill="#2a1a00"/>
      <circle cx="37.5" cy="146.5" r="1.5" fill="white"/>
      <circle cx="55.5" cy="146.5" r="1.5" fill="white"/>
      <path d="M36 156 Q45 162 54 156" stroke="#2a1a00" stroke-width="2" fill="none"/>
      <ellipse cx="45" cy="157" rx="8" ry="5" fill="#F08060"/>

      <!-- Jolly Roger flag -->
      <rect x="243" y="2" width="60" height="34" fill="#1a1a1a" stroke="#333"/>
      <ellipse cx="273" cy="14" rx="12" ry="10" fill="white"/>
      <circle cx="268" cy="12" r="3" fill="#1a1a1a"/>
      <circle cx="278" cy="12" r="3" fill="#1a1a1a"/>
      <path d="M267 18 L278 18" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="262" y1="26" x2="284" y2="26" stroke="white" stroke-width="3"/>
      <line x1="262" y1="22" x2="264" y2="26" stroke="white" stroke-width="2"/>
      <line x1="284" y1="22" x2="282" y2="26" stroke="white" stroke-width="2"/>

      <!-- Portholes -->
      <circle cx="160" cy="175" r="14" fill="none" stroke="#8B6914" stroke-width="3"/>
      <circle cx="160" cy="175" r="10" fill="#88AABB" opacity="0.5"/>
      <circle cx="250" cy="175" r="14" fill="none" stroke="#8B6914" stroke-width="3"/>
      <circle cx="250" cy="175" r="10" fill="#88AABB" opacity="0.5"/>
      <circle cx="340" cy="175" r="14" fill="none" stroke="#8B6914" stroke-width="3"/>
      <circle cx="340" cy="175" r="10" fill="#88AABB" opacity="0.5"/>

      <!-- Anchor rope -->
      <path d="M450 140 Q460 160 455 190" stroke="#888" stroke-width="3" fill="none" stroke-dasharray="4,2"/>
    </svg>`;
  }

  function getCrewSVG(id) {
    if (window.CREW_SVGS?.[id]) {
      return window.CREW_SVGS[id];
    }
    // CSS fallback sprites
    const colors = {
      luffy: { body: '#CC2200', skin: '#FDBCB4', hat: '#D4800A', hair: '#1a1a1a', shorts: '#1A3B8A' },
      zoro: { body: '#2D7A2D', skin: '#FDBCB4', hat: '#1a1a1a', hair: '#2D7A2D', shorts: '#2a2a5a' },
      nami: { body: '#E8762A', skin: '#FDBCB4', hat: '#E8762A', hair: '#E8762A', shorts: '#1A3B8A' },
      chopper: { body: '#C8956C', skin: '#C8956C', hat: '#E87A8A', hair: '#8B5E3C', shorts: '#4a3020' },
      usopp: { body: '#4A8A6A', skin: '#C8956C', hat: '#1a1a1a', hair: '#1a1a1a', shorts: '#4A8A6A' }
    };
    const c = colors[id] || colors.luffy;
    return `<div style="
      width:40px;height:56px;
      position:relative;
      display:flex;flex-direction:column;align-items:center;
    ">
      <div style="width:20px;height:10px;background:${c.hat};border-radius:2px 2px 0 0;border:1px solid rgba(0,0,0,0.4);"></div>
      <div style="width:22px;height:18px;background:${c.skin};border-radius:50% 50% 40% 40%;border:1px solid rgba(0,0,0,0.3);position:relative;">
        <div style="position:absolute;top:6px;left:4px;width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div>
        <div style="position:absolute;top:6px;right:4px;width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div>
        <div style="position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:8px;height:2px;background:#CC6666;border-radius:1px;"></div>
      </div>
      <div style="width:18px;height:14px;background:${c.body};border:1px solid rgba(0,0,0,0.3);"></div>
      <div style="width:18px;height:10px;background:${c.shorts};border:1px solid rgba(0,0,0,0.3);border-radius:0 0 3px 3px;"></div>
    </div>`;
  }

  // ─── Idle animations ──────────────────────────────────────────────
  function startIdleAnimations() {
    Object.keys(CREW).forEach((id, i) => {
      const el = document.getElementById(`crew-${id}`);
      if (!el) return;

      // Stagger breathing
      el.style.animationDelay = `${i * 0.3}s`;

      // Random micro-movement every 3-8s
      scheduleIdleMove(id, 1000 + Math.random() * 2000);
    });
  }

  function scheduleIdleMove(id, delay) {
    setTimeout(() => {
      const el = document.getElementById(`crew-${id}`);
      if (!el || el.dataset.moving === 'true') {
        scheduleIdleMove(id, 3000 + Math.random() * 5000);
        return;
      }

      const crew = CREW[id];
      const jitterX = (Math.random() - 0.5) * 3;
      const jitterY = (Math.random() - 0.5) * 2;
      el.style.left = `${crew.defaultX + jitterX}%`;
      el.style.top = `${crew.defaultY + jitterY}%`;

      scheduleIdleMove(id, 3000 + Math.random() * 5000);
    }, delay);
  }

  // ─── Crew clicked → random quote ─────────────────────────────────
  function crewClicked(id) {
    const crew = CREW[id];
    if (!crew) return;

    const quote = crew.quotes[Math.floor(Math.random() * crew.quotes.length)];
    showSpeechBubble(id, quote, 2500);

    // Play den den sound
    if (window.BountySystem) window.BountySystem.playSound('den_den');
  }

  // ─── Speech bubbles ───────────────────────────────────────────────
  function showSpeechBubble(crewId, text, duration = 3000) {
    // Remove existing bubble for this crew member
    const existing = activeBubbles[crewId];
    if (existing?.el) {
      existing.el.remove();
      clearTimeout(existing.timer);
    }

    const crewEl = document.getElementById(`crew-${crewId}`);
    if (!crewEl) return;

    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.textContent = text;

    // Position near crew sprite
    const rect = crewEl.getBoundingClientRect();
    const sceneEl = document.getElementById('ship-scene-inner');
    const sceneRect = sceneEl?.getBoundingClientRect();

    if (sceneRect) {
      const relX = rect.left - sceneRect.left;
      const relY = rect.top - sceneRect.top;
      bubble.style.cssText = `
        position:absolute;
        left:${Math.max(0, Math.min(relX - 40, sceneRect.width - 160))}px;
        top:${Math.max(0, relY - 60)}px;
        z-index:20;
        max-width:160px;
      `;
      sceneEl.appendChild(bubble);
    }

    const timer = setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transition = 'opacity 0.3s ease';
      setTimeout(() => bubble.remove(), 300);
      delete activeBubbles[crewId];
    }, duration);

    activeBubbles[crewId] = { el: bubble, timer };
  }

  // ─── Animate crew walk to location ───────────────────────────────
  function animateCrewToLocation(crewId, targetX, targetY, duration = 800) {
    const el = document.getElementById(`crew-${crewId}`);
    if (!el) return;

    el.dataset.moving = 'true';
    el.style.transition = `left ${duration}ms ease-in-out, top ${duration}ms ease-in-out`;
    el.style.left = `${targetX}%`;
    el.style.top = `${targetY}%`;

    setTimeout(() => {
      el.dataset.moving = 'false';
      el.style.transition = 'left 0.8s ease, top 0.8s ease';
    }, duration + 100);
  }

  // Meeting positions
  const MEETING_POSITIONS = [
    { x: 40, y: 58 }, { x: 46, y: 60 }, { x: 52, y: 58 },
    { x: 43, y: 64 }, { x: 49, y: 64 }
  ];

  function triggerCrewMeeting(message) {
    Object.keys(CREW).forEach((id, i) => {
      const pos = MEETING_POSITIONS[i] || MEETING_POSITIONS[0];
      setTimeout(() => {
        animateCrewToLocation(id, pos.x, pos.y);
      }, i * 150);
    });

    setTimeout(() => {
      showSpeechBubble('luffy', message || 'Crew meeting on deck!', 4000);
    }, 1200);

    // Return to stations after meeting
    setTimeout(() => {
      Object.keys(CREW).forEach(id => {
        const crew = CREW[id];
        animateCrewToLocation(id, crew.defaultX, crew.defaultY, 600);
      });
    }, 6000);
  }

  // ─── Event processing ─────────────────────────────────────────────
  function processEvent(event) {
    const route = EVENT_ROUTES[event.type];
    if (!route) return;

    const quote = event.message || route.quote;

    if (route.crew === 'all') {
      triggerCrewMeeting(quote);
    } else {
      const crewId = route.crew;
      const crew = CREW[crewId];
      if (!crew) return;

      // Walk toward centre deck and back
      animateCrewToLocation(crewId, 48, 50, 600);
      setTimeout(() => {
        showSpeechBubble(crewId, quote, 4000);
        // Sound
        if (window.BountySystem) {
          if (event.type === 'task_completed') window.BountySystem.playSound('task_complete');
          else if (event.type === 'level_up') window.BountySystem.playSound('level_up');
          else window.BountySystem.playSound('den_den');
        }
        // Return to station
        setTimeout(() => {
          animateCrewToLocation(crewId, crew.defaultX, crew.defaultY, 600);
        }, 4500);
      }, 700);
    }

    // Update den den notification
    updateDenDen(true);
  }

  function updateDenDen(hasNew) {
    const btn = document.getElementById('den-den-btn');
    const badge = document.querySelector('.notification-badge');
    if (btn) btn.classList.toggle('ringing', hasNew);
    if (badge) {
      badge.classList.toggle('visible', hasNew);
      if (hasNew && window.BountySystem) window.BountySystem.playSound('den_den');
    }
  }

  // ─── State polling ────────────────────────────────────────────────
  async function pollState() {
    try {
      const r = await fetch('mission-control-state.json?t=' + Date.now());
      const newState = await r.json();

      if (!newState?.events?.length) return;

      // Find new events
      const newEvents = newState.events.filter(e => !e.read && e.id !== lastEventId);

      if (newEvents.length > 0) {
        const latest = newEvents[0];
        lastEventId = latest.id;
        processEvent(latest);

        // Dispatch to activity feed
        document.dispatchEvent(new CustomEvent('newCrewEvent', { detail: latest }));
      }
    } catch (e) {
      // Silent fail - network unavailable
    }
  }

  function startEventPolling() {
    pollInterval = setInterval(pollState, 15000);
    // Initial check after 2s
    setTimeout(pollState, 2000);
  }

  function stopEventPolling() {
    if (pollInterval) clearInterval(pollInterval);
  }

  // ─── Public API ───────────────────────────────────────────────────
  return {
    init,
    crewClicked,
    showSpeechBubble,
    triggerCrewMeeting,
    processEvent,
    updateDenDen,
    stopEventPolling,
    CREW
  };

})();

window.ShipScene = ShipScene;
