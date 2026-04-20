/**
 * BOUNTY SYSTEM — XP, Devil Fruits, Haki, Level Progression
 * William's Mission Control — One Piece Theme
 */

'use strict';

const BountySystem = (() => {

  // ─── Constants ───────────────────────────────────────────────────
  const XP_TO_BERRY = 100000; // 10 XP = ฿100,000 (so 1 XP = ฿10,000)
  const LEVEL_THRESHOLDS = {
    'East Blue': { min: 0, max: 999, color: '#4488FF', emoji: '🌊' },
    'Grand Line': { min: 1000, max: 4999, color: '#E8762A', emoji: '⚓' },
    'Paradise': { min: 5000, max: 14999, color: '#CC2200', emoji: '☁️' },
    'New World': { min: 15000, max: Infinity, color: '#FFD700', emoji: '👑' }
  };

  const DEVIL_FRUITS = {
    gomu_gomu: {
      id: 'gomu_gomu',
      name: 'Gomu Gomu no Mi',
      nickname: 'Persistence Fruit',
      type: 'Paramecia',
      emoji: '🟡',
      color: '#E8762A',
      power: 'Stretch your limits — your body becomes rubber!',
      requirement: 'Finish 5 consecutive days of homework',
      target: 5
    },
    ope_ope: {
      id: 'ope_ope',
      name: 'Ope Ope no Mi',
      nickname: 'Room Fruit',
      type: 'Paramecia',
      emoji: '🔵',
      color: '#4488CC',
      power: 'Create a Room — everything in order!',
      requirement: 'Organise study space (toggle when done)',
      target: 1
    },
    mera_mera: {
      id: 'mera_mera',
      name: 'Mera Mera no Mi',
      nickname: 'Flame Fruit',
      type: 'Logia',
      emoji: '🔥',
      color: '#FF4400',
      power: 'Become fire itself — unstoppable focus!',
      requirement: '10 focus sessions without breaking early',
      target: 10
    },
    hana_hana: {
      id: 'hana_hana',
      name: 'Hana Hana no Mi',
      nickname: 'Bloom Fruit',
      type: 'Paramecia',
      emoji: '🌸',
      color: '#FF88AA',
      power: 'Bloom in all places — complete all 4 subjects!',
      requirement: 'Complete all 4 subjects in one day',
      target: 1
    },
    yami_yami: {
      id: 'yami_yami',
      name: 'Yami Yami no Mi',
      nickname: 'Dark Fruit',
      type: 'Logia',
      emoji: '🌑',
      color: '#6633CC',
      power: 'The will to push through darkness!',
      requirement: 'Finish a task when you really didn\'t want to',
      target: 1
    },
    gura_gura: {
      id: 'gura_gura',
      name: 'Gura Gura no Mi',
      nickname: 'Tremor Fruit',
      type: 'Paramecia',
      emoji: '⚡',
      color: '#FFDD00',
      power: 'The world TREMBLES before a 30-day streak!',
      requirement: '30-day study streak',
      target: 30
    }
  };

  // ─── State ────────────────────────────────────────────────────────
  let state = null;
  let soundsEnabled = true;

  // ─── Load state ───────────────────────────────────────────────────
  async function loadState() {
    try {
      const r = await fetch('mission-control-state.json?t=' + Date.now());
      state = await r.json();
    } catch (e) {
      console.warn('Could not load state, using defaults:', e);
      state = {
        captain: { name: 'William', xp: 0, streak: 0 },
        devil_fruits: {},
        haki: { observation: 0, armament: 0, conquerors: 0 },
        settings: { sounds_enabled: true }
      };
    }
    soundsEnabled = state.settings?.sounds_enabled ?? true;
    return state;
  }

  // ─── XP Calculations ─────────────────────────────────────────────
  function xpToBounty(xp) {
    return xp * XP_TO_BERRY;
  }

  function formatBounty(berries) {
    if (berries >= 1000000000) {
      return '฿' + (berries / 1000000000).toFixed(1) + 'B';
    }
    if (berries >= 1000000) {
      return '฿' + (berries / 1000000).toFixed(0) + 'M';
    }
    if (berries >= 1000) {
      return '฿' + (berries / 1000).toFixed(0) + 'K';
    }
    return '฿' + berries.toLocaleString();
  }

  function getLevel(xp) {
    for (const [name, data] of Object.entries(LEVEL_THRESHOLDS)) {
      if (xp >= data.min && xp <= data.max) {
        return { name, ...data };
      }
    }
    return { name: 'East Blue', ...LEVEL_THRESHOLDS['East Blue'] };
  }

  function getLevelProgress(xp) {
    const level = getLevel(xp);
    if (level.max === Infinity) return 100;
    const range = level.max - level.min;
    const progress = xp - level.min;
    return Math.min(100, Math.floor((progress / range) * 100));
  }

  function getNextLevel(currentLevel) {
    const levels = Object.keys(LEVEL_THRESHOLDS);
    const idx = levels.indexOf(currentLevel);
    return idx < levels.length - 1 ? levels[idx + 1] : null;
  }

  // ─── Render Bounty Poster (mini sidebar version) ──────────────────
  function renderBountyPosterMini(xp, captain) {
    const bounty = xpToBounty(xp);
    const level = getLevel(xp);
    const progress = getLevelProgress(xp);
    const jollyRoger = captain?.jolly_roger || 'skull-crossbones';
    const streak = captain?.streak || 0;
    const avatarEmoji = getJollyRogerEmoji(jollyRoger);

    const el = document.getElementById('bounty-poster-mini');
    if (!el) return;

    el.innerHTML = `
      <div class="bounty-poster-parchment">
        <div class="poster-wanted-header">WANTED</div>
        <div class="poster-dead-or-alive">DEAD OR ALIVE</div>
        <div class="bounty-avatar" id="poster-avatar">${avatarEmoji}</div>
        <div class="bounty-name">"STRAW HAT" ${(captain?.name || 'WILLIAM').toUpperCase()}</div>
        <div class="bounty-big-amount">${formatBounty(bounty)}</div>
        <div class="bounty-currency">WORLD GOVERNMENT BOUNTY</div>
        <div class="marine-stamp">MARINE INTELLIGENCE</div>
        <div class="poster-level" style="color: ${level.color}; font-family: var(--font-pirate); font-size:12px; margin:4px 0;">
          ${level.emoji} ${level.name.toUpperCase()} ${level.emoji}
        </div>
        <div class="xp-bar-container" style="width:100%; margin:4px 0;">
          <div class="xp-bar-fill" style="width:${progress}%"></div>
        </div>
        <div style="font-family:var(--font-mono);font-size:9px;color:var(--text-medium);">${xp} XP</div>
        <button class="poster-download-btn" onclick="BountySystem.downloadPoster()">⬇ Share Poster</button>
      </div>
    `;
  }

  // ─── Render Devil Fruits grid ─────────────────────────────────────
  function renderDevilFruits(fruitsState) {
    const container = document.getElementById('devil-fruits-grid');
    if (!container) return;

    container.innerHTML = '';

    Object.entries(DEVIL_FRUITS).forEach(([id, fruit]) => {
      const fruitState = fruitsState?.[id] || { unlocked: false, progress: 0 };
      const isUnlocked = fruitState.unlocked;
      const progress = fruitState.progress || 0;
      const pct = Math.min(100, Math.floor((progress / fruit.target) * 100));

      const item = document.createElement('div');
      item.className = `fruit-item ${isUnlocked ? 'unlocked' : 'locked'}`;
      item.setAttribute('title', `${fruit.name}\n${fruit.requirement}`);
      item.innerHTML = `
        <div class="fruit-icon" style="${isUnlocked ? `color:${fruit.color}; background: rgba(0,0,0,0.3);` : ''}">
          ${fruit.emoji}
        </div>
        <div class="fruit-name">${fruit.nickname || fruit.name.split(' ')[0]}</div>
        ${!isUnlocked ? `
          <div class="fruit-progress">
            <div class="fruit-progress-fill" style="width:${pct}%"></div>
          </div>
        ` : ''}
      `;

      item.addEventListener('click', () => showFruitDetail(id, fruit, fruitState));
      container.appendChild(item);
    });
  }

  // ─── Show fruit detail modal ──────────────────────────────────────
  function showFruitDetail(id, fruit, fruitState) {
    const isUnlocked = fruitState?.unlocked;
    const progress = fruitState?.progress || 0;
    const pct = Math.min(100, Math.floor((progress / fruit.target) * 100));

    const modal = document.getElementById('fruit-modal');
    const content = document.getElementById('fruit-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="text-align:center; padding:10px 0;">
        <div style="font-size:48px; margin-bottom:8px; ${isUnlocked ? `filter: drop-shadow(0 0 12px ${fruit.color});` : 'filter:grayscale(1);opacity:0.5;'}">${fruit.emoji}</div>
        <div style="font-family:var(--font-pirate);font-size:22px;color:var(--text-dark);">${fruit.name}</div>
        <div style="font-family:var(--font-pirate);font-size:13px;color:${fruit.color};margin:4px 0;">${fruit.type} • ${fruit.nickname}</div>
        <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-medium);margin:8px 0;font-style:italic;">"${fruit.power}"</div>
        <div style="border-top:1px solid var(--parchment-border);margin:12px 0;padding-top:12px;">
          <div style="font-family:var(--font-pirate);font-size:12px;color:var(--text-dark);margin-bottom:6px;">HOW TO UNLOCK:</div>
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-medium);">${fruit.requirement}</div>
        </div>
        ${!isUnlocked ? `
          <div style="margin:12px 0;">
            <div style="font-family:var(--font-pirate);font-size:11px;color:var(--text-medium);margin-bottom:4px;">Progress: ${progress}/${fruit.target}</div>
            <div style="background:rgba(0,0,0,0.1);height:8px;border-radius:4px;border:1px solid var(--parchment-border);overflow:hidden;">
              <div style="height:100%;background:linear-gradient(90deg,${fruit.color},${fruit.color}88);width:${pct}%;border-radius:4px;transition:width 0.5s;"></div>
            </div>
          </div>
        ` : `
          <div style="font-family:var(--font-pirate);font-size:16px;color:${fruit.color};margin:12px 0;text-shadow:0 0 10px ${fruit.color};">✨ UNLOCKED ✨</div>
        `}
        <button onclick="BountySystem.closeModal('fruit-modal')" style="margin-top:8px;background:var(--navy);color:var(--gold);border:1px solid var(--gold-dark);border-radius:6px;padding:8px 20px;font-family:var(--font-pirate);font-size:14px;cursor:pointer;">
          Back to Ship
        </button>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  // ─── Render Haki bars ─────────────────────────────────────────────
  function renderHaki(hakiState) {
    const types = {
      observation: { label: "Observation Haki", emoji: '👁️', class: 'haki-observation' },
      armament: { label: "Armament Haki", emoji: '⚫', class: 'haki-armament' },
      conquerors: { label: "Conqueror's Haki", emoji: '👑', class: 'haki-conquerors' }
    };

    Object.entries(types).forEach(([key, info]) => {
      const pct = Math.min(100, hakiState?.[key] || 0);
      const bar = document.querySelector(`.${info.class} .haki-fill`);
      const pctEl = document.querySelector(`.${info.class} .haki-pct`);
      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
    });
  }

  // ─── Jolly Roger design options ───────────────────────────────────
  const JOLLY_ROGERS = {
    'skull-crossbones': { emoji: '☠️', name: 'Classic' },
    'flaming-skull': { emoji: '💀🔥', name: 'Flaming' },
    'anchor': { emoji: '⚓', name: 'Anchor' },
    'crossed-swords': { emoji: '⚔️', name: 'Swords' },
    'dragon': { emoji: '🐉', name: 'Dragon' },
    'lightning': { emoji: '⚡', name: 'Lightning' }
  };

  function getJollyRogerEmoji(design) {
    return JOLLY_ROGERS[design]?.emoji || '☠️';
  }

  function showJollyRogerPicker() {
    const modal = document.getElementById('jolly-roger-modal');
    const grid = document.getElementById('jr-grid');
    if (!modal || !grid) return;

    const currentDesign = state?.captain?.jolly_roger || 'skull-crossbones';
    grid.innerHTML = '';

    Object.entries(JOLLY_ROGERS).forEach(([id, jr]) => {
      const opt = document.createElement('div');
      opt.className = `jr-option ${id === currentDesign ? 'selected' : ''}`;
      opt.innerHTML = `<span style="font-size:28px;">${jr.emoji}</span><span class="jr-name">${jr.name}</span>`;
      opt.addEventListener('click', () => selectJollyRoger(id, opt));
      grid.appendChild(opt);
    });

    modal.classList.remove('hidden');
  }

  function selectJollyRoger(id, el) {
    document.querySelectorAll('.jr-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');

    if (state?.captain) {
      state.captain.jolly_roger = id;
    }

    // Update badge in topbar
    const badge = document.getElementById('jolly-roger-emoji');
    if (badge) badge.textContent = JOLLY_ROGERS[id].emoji;

    // Update poster avatar
    const avatar = document.getElementById('poster-avatar');
    if (avatar) avatar.textContent = JOLLY_ROGERS[id].emoji;
  }

  // ─── Download poster as PNG ───────────────────────────────────────
  function downloadPoster() {
    const xp = state?.captain?.xp || 0;
    const name = state?.captain?.name || 'WILLIAM';
    const bounty = xpToBounty(xp);
    const level = getLevel(xp);
    const jollyRoger = getJollyRogerEmoji(state?.captain?.jolly_roger || 'skull-crossbones');

    // Create a canvas to draw the poster
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Parchment background
    const grad = ctx.createLinearGradient(0, 0, 0, 400);
    grad.addColorStop(0, '#F5EDD0');
    grad.addColorStop(0.5, '#E0C870');
    grad.addColorStop(1, '#D4B84A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 400);

    // Aged texture overlay
    ctx.fillStyle = 'rgba(100, 50, 0, 0.05)';
    for (let i = 0; i < 400; i += 4) {
      ctx.fillRect(0, i, 300, 2);
    }

    // Border
    ctx.strokeStyle = '#5C4410';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 280, 380);
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 268, 368);

    // WANTED header
    ctx.fillStyle = '#2a1a00';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('WANTED', 150, 70);

    ctx.font = '18px Georgia, serif';
    ctx.fillText('DEAD OR ALIVE', 150, 95);

    // Jolly Roger avatar area
    ctx.fillStyle = '#8B6914';
    ctx.strokeStyle = '#5C4410';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(75, 110, 150, 130);
    ctx.stroke();
    ctx.fillRect(75, 110, 150, 130);

    // Emoji in center of avatar area
    ctx.font = '64px serif';
    ctx.textAlign = 'center';
    ctx.fillText(jollyRoger.split('')[0] || '☠', 150, 195);

    // Name
    ctx.fillStyle = '#2a1a00';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"STRAW HAT" ${name.toUpperCase()}`, 150, 270);

    // Bounty
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillStyle = '#2a1a00';
    ctx.fillText(formatBounty(bounty), 150, 310);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#5a3a10';
    ctx.fillText('WORLD GOVERNMENT BOUNTY', 150, 328);

    // Level
    ctx.font = '13px Georgia, serif';
    ctx.fillStyle = level.color;
    ctx.fillText(`${level.emoji} ${level.name.toUpperCase()}`, 150, 348);

    // Marine stamp (rotated)
    ctx.save();
    ctx.translate(220, 360);
    ctx.rotate(-0.2);
    ctx.strokeStyle = 'rgba(204,34,0,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 45, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(204,34,0,0.4)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MARINE INTELLIGENCE', 0, 4);
    ctx.restore();

    // Trigger download
    const link = document.createElement('a');
    link.download = `wanted-${name.toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ─── Close modal ──────────────────────────────────────────────────
  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  }

  // ─── Level-up celebration ─────────────────────────────────────────
  function triggerLevelUpCelebration(levelName) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'level-up-overlay';
    overlay.innerHTML = `
      <div class="level-up-text">⚓ LEVEL UP! ⚓</div>
      <div style="font-family:var(--font-pirate);font-size:clamp(20px,4vw,32px);color:var(--parchment);text-align:center;">
        Welcome to<br><span style="color:var(--gold);font-size:1.3em;">${levelName}</span>
      </div>
      <div style="font-family:var(--font-pirate);font-size:18px;color:var(--parchment-dark);">Your bounty has increased!</div>
    `;
    document.body.appendChild(overlay);

    // Confetti
    const colours = ['#FFD700', '#E8762A', '#CC2200', '#4488FF', '#FF88AA', '#FFDD00'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        top: -10px;
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        background: ${colours[Math.floor(Math.random() * colours.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        --duration: ${2 + Math.random() * 2}s;
        --delay: ${Math.random() * 1.5}s;
      `;
      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }

    // Sound
    playSound('level_up');

    // Remove overlay after 3.5s
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.5s ease';
      setTimeout(() => overlay.remove(), 500);
    }, 3000);
  }

  // ─── Sound system ─────────────────────────────────────────────────
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundsEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume();

      switch (type) {
        case 'level_up': playLevelUpChime(ctx); break;
        case 'task_complete': playTaskComplete(ctx); break;
        case 'den_den': playDenDen(ctx); break;
        case 'achievement': playAchievement(ctx); break;
      }
    } catch (e) {
      console.warn('Sound error:', e);
    }
  }

  function playNote(ctx, freq, startTime, duration, type = 'square', volume = 0.15) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function playLevelUpChime(ctx) {
    const t = ctx.currentTime;
    // Triumphant 8-bit fanfare
    const melody = [
      [523.25, 0.0, 0.15], // C5
      [659.25, 0.15, 0.15], // E5
      [783.99, 0.3, 0.15],  // G5
      [1046.5, 0.45, 0.4],  // C6
      [783.99, 0.85, 0.1],
      [1046.5, 0.95, 0.5],
    ];
    melody.forEach(([freq, delay, dur]) => playNote(ctx, freq, t + delay, dur, 'square', 0.12));
  }

  function playTaskComplete(ctx) {
    const t = ctx.currentTime;
    // Coin collect chime
    [880, 1046.5, 1318.5].forEach((freq, i) =>
      playNote(ctx, freq, t + i * 0.08, 0.12, 'sine', 0.1)
    );
  }

  function playDenDen(ctx) {
    const t = ctx.currentTime;
    // Snail ring — two-tone alternating
    for (let i = 0; i < 4; i++) {
      playNote(ctx, 800, t + i * 0.25, 0.1, 'square', 0.08);
      playNote(ctx, 1000, t + i * 0.25 + 0.12, 0.1, 'square', 0.08);
    }
  }

  function playAchievement(ctx) {
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 880, 1046.5];
    notes.forEach((freq, i) => playNote(ctx, freq, t + i * 0.1, 0.15, 'sawtooth', 0.08));
  }

  // ─── Toggle sounds ────────────────────────────────────────────────
  function toggleSounds() {
    soundsEnabled = !soundsEnabled;
    if (state?.settings) state.settings.sounds_enabled = soundsEnabled;
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
      btn.textContent = soundsEnabled ? '🔊' : '🔇';
      btn.classList.toggle('muted', !soundsEnabled);
    }
    if (soundsEnabled) {
      // Unlock audio context on first user interaction
      const ctx = getAudioCtx();
      if (ctx?.state === 'suspended') ctx.resume();
    }
    return soundsEnabled;
  }

  // ─── Public API ───────────────────────────────────────────────────
  return {
    loadState,
    renderBountyPosterMini,
    renderDevilFruits,
    renderHaki,
    showJollyRogerPicker,
    downloadPoster,
    closeModal,
    triggerLevelUpCelebration,
    playSound,
    toggleSounds,
    formatBounty,
    xpToBounty,
    getLevel,
    getLevelProgress,
    getJollyRogerEmoji,
    JOLLY_ROGERS,
    DEVIL_FRUITS
  };
})();

window.BountySystem = BountySystem;
