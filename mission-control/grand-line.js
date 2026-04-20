/**
 * GRAND LINE — Kanban Board + Activity Feed
 * Loads tasks from canvas-feed.json + pre-teach-tomorrow.json + william-tasks.jsonl
 * Activity feed tails cerritos-activity.jsonl
 */

'use strict';

const GrandLine = (() => {

  // ─── Column config ────────────────────────────────────────────────
  const COLUMNS = {
    todo: {
      id: 'todo',
      title: 'THE GRAND LINE',
      subtitle: 'Reverse Mountain',
      icon: '🏔️',
      statuses: ['todo', 'not_started', null, undefined, '']
    },
    sailing: {
      id: 'sailing',
      title: 'SAILING',
      subtitle: 'Open Sea',
      icon: '⛵',
      statuses: ['sailing', 'in_progress', 'started']
    },
    blocked: {
      id: 'blocked',
      title: 'WAITING FOR WIND',
      subtitle: 'Calm Belt',
      icon: '🌫️',
      statuses: ['blocked', 'waiting', 'stuck']
    },
    done: {
      id: 'done',
      title: 'TREASURE CLAIMED',
      subtitle: 'Skypiea',
      icon: '☁️✨',
      statuses: ['done', 'complete', 'completed', 'submitted']
    }
  };

  // ─── State ────────────────────────────────────────────────────────
  let tasks = [];
  let draggedTask = null;
  let activityEntries = [];

  // ─── Init ─────────────────────────────────────────────────────────
  async function init() {
    await loadTasks();
    renderKanban();
    await loadActivityFeed();
    renderActivityFeed();
    startActivityPolling();

    // Listen for new crew events
    document.addEventListener('newCrewEvent', e => {
      addActivityEntry({
        ts: new Date().toISOString(),
        crew: e.detail.crew_id || 'nami',
        icon: getCrewIcon(e.detail.crew_id),
        message: e.detail.message,
        detail: '',
        type: e.detail.type
      });
    });

    console.log('[GrandLine] Kanban and activity feed ready.');
  }

  // ─── Load tasks ───────────────────────────────────────────────────
  async function loadTasks() {
    tasks = [];

    // 1. william-tasks.jsonl
    try {
      const r = await fetch('william-tasks.jsonl?t=' + Date.now());
      const text = await r.text();
      text.trim().split('\n').forEach(line => {
        try {
          if (line.trim()) tasks.push(JSON.parse(line));
        } catch (e) {}
      });
    } catch (e) {
      console.warn('Could not load william-tasks.jsonl');
    }

    // 2. ../canvas-feed.json (Canvas assignments)
    try {
      const r = await fetch('../canvas-feed.json?t=' + Date.now());
      const data = await r.json();

      if (data?.todo?.length) {
        data.todo.forEach(item => {
          // Deduplicate by ID
          if (!tasks.find(t => t.canvas_id === item.id || t.id === String(item.id))) {
            tasks.push(canvasItemToTask(item, 'todo'));
          }
        });
      }

      if (data?.submitted?.length) {
        data.submitted.forEach(item => {
          if (!tasks.find(t => t.canvas_id === item.id)) {
            tasks.push(canvasItemToTask(item, 'done'));
          }
        });
      }
    } catch (e) {
      console.warn('Could not load canvas-feed.json:', e.message);
    }

    // 3. ../pre-teach-tomorrow.json (upcoming subjects as tasks)
    try {
      const r = await fetch('../pre-teach-tomorrow.json?t=' + Date.now());
      const data = await r.json();

      if (data?.cards?.length) {
        data.cards.forEach((card, i) => {
          if (card.assignments?.length) {
            card.assignments.forEach(a => {
              if (!tasks.find(t => t.canvas_id === a.id)) {
                tasks.push({
                  id: `pt_${i}_${Date.now()}`,
                  canvas_id: a.id,
                  title: a.name || card.subject,
                  subject: card.subject,
                  course: a.course_name || '',
                  status: 'todo',
                  due_at: a.due_at,
                  xp: 30,
                  priority: 'medium',
                  description: card.hook || '',
                  source: 'pre-teach'
                });
              }
            });
          }
        });
      }
    } catch (e) {
      console.warn('Could not load pre-teach-tomorrow.json');
    }

    console.log(`[GrandLine] Loaded ${tasks.length} tasks`);
  }

  function canvasItemToTask(item, status) {
    return {
      id: `canvas_${item.id}`,
      canvas_id: item.id,
      title: item.name,
      subject: item.course_name?.replace('Year 7', '').replace('Year7', '').trim() || 'Study',
      course: item.course_name || '',
      status,
      due_at: item.due_at,
      xp: item.points > 0 ? Math.ceil(item.points) : 30,
      priority: isPriorityHigh(item.due_at) ? 'high' : 'medium',
      description: stripHTML(item.description || '').substring(0, 120),
      source: 'canvas',
      canvas_url: item.html_url || ''
    };
  }

  function stripHTML(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function isPriorityHigh(dueAt) {
    if (!dueAt) return false;
    const due = new Date(dueAt);
    const now = new Date();
    const diffDays = (due - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 2;
  }

  // ─── Render Kanban ────────────────────────────────────────────────
  function renderKanban() {
    const board = document.getElementById('kanban');
    if (!board) return;

    board.innerHTML = '';

    Object.values(COLUMNS).forEach(col => {
      const colTasks = getTasksForColumn(col);
      const colEl = createColumnEl(col, colTasks);
      board.appendChild(colEl);
    });
  }

  function getTasksForColumn(col) {
    return tasks.filter(t => {
      const status = (t.status || '').toLowerCase().trim();
      if (col.id === 'todo') {
        // Default catch-all for unknown statuses
        const knownStatuses = ['sailing', 'in_progress', 'started', 'blocked', 'waiting', 'stuck', 'done', 'complete', 'completed', 'submitted'];
        return col.statuses.includes(status) || (!knownStatuses.includes(status));
      }
      return col.statuses.includes(status);
    });
  }

  function createColumnEl(col, colTasks) {
    const div = document.createElement('div');
    div.className = `kanban-column col-${col.id}`;
    div.id = `col-${col.id}`;
    div.setAttribute('data-column', col.id);

    div.innerHTML = `
      <div class="col-header">
        <span class="col-icon">${col.icon}</span>
        <div>
          <div class="col-title">${col.title}</div>
          <div style="font-family:var(--font-mono);font-size:8px;color:rgba(255,215,0,0.4);">${col.subtitle}</div>
        </div>
        <span class="col-count">${colTasks.length}</span>
      </div>
      <div class="col-cards" id="cards-${col.id}">
        ${colTasks.length === 0
          ? `<div class="kanban-empty">Clear waters ahead ⛵</div>`
          : colTasks.map(t => createCardHTML(t)).join('')
        }
      </div>
    `;

    // Drag-and-drop drop target
    const cardsEl = div.querySelector('.col-cards');
    cardsEl.addEventListener('dragover', e => {
      e.preventDefault();
      div.style.background = 'rgba(255,215,0,0.05)';
    });
    cardsEl.addEventListener('dragleave', () => {
      div.style.background = '';
    });
    cardsEl.addEventListener('drop', e => {
      e.preventDefault();
      div.style.background = '';
      if (draggedTask) {
        moveTask(draggedTask, col.id);
      }
    });

    return div;
  }

  function createCardHTML(task) {
    const daysUntil = getDaysUntil(task.due_at);
    const dueTxt = formatDueDate(daysUntil);
    const isUrgent = daysUntil !== null && daysUntil <= 2;
    const subjectColour = getSubjectColour(task.subject);

    return `
      <div class="kanban-card priority-${task.priority || 'medium'}"
           draggable="true"
           data-task-id="${task.id}"
           onclick="GrandLine.cardClicked('${task.id}')"
           ondragstart="GrandLine.dragStart('${task.id}')"
           ondragend="GrandLine.dragEnd()"
           style="border-left-color: ${subjectColour};"
      >
        <div class="card-subject-badge" style="background:${subjectColour};">${task.subject || 'Study'}</div>
        <div class="card-xp">+${task.xp || 30}xp ⚡</div>
        <div class="card-title">${escapeHTML(task.title)}</div>
        ${dueTxt ? `<div class="card-due ${isUrgent ? 'urgent' : ''}">
          🧭 ${dueTxt}
          ${isUrgent ? ' ⚠️' : ''}
        </div>` : ''}
      </div>
    `;
  }

  // ─── Due date formatting ──────────────────────────────────────────
  function getDaysUntil(dueAt) {
    if (!dueAt) return null;
    const due = new Date(dueAt);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  }

  function formatDueDate(days) {
    if (days === null) return null;
    if (days < 0) return `${Math.abs(days)} suns OVERDUE`;
    if (days === 0) return 'Due TODAY — SAIL NOW!';
    if (days === 1) return '1 sun until horizon';
    return `Log Pose: ${days} suns`;
  }

  // ─── Subject colours ──────────────────────────────────────────────
  const SUBJECT_COLOURS = {
    'English': '#E8762A',
    'Mathematics': '#4488CC',
    'Maths': '#4488CC',
    'Science': '#2DA86A',
    'History': '#CC8822',
    'Christian': '#8855CC',
    'PE': '#CC2200',
    'Sport': '#CC2200',
    'Study': '#888',
    'Pre-teach': '#555'
  };

  function getSubjectColour(subject) {
    if (!subject) return '#888';
    for (const [key, colour] of Object.entries(SUBJECT_COLOURS)) {
      if (subject.toLowerCase().includes(key.toLowerCase())) return colour;
    }
    return '#5a3a10';
  }

  // ─── Drag and drop ────────────────────────────────────────────────
  function dragStart(taskId) {
    draggedTask = taskId;
  }

  function dragEnd() {
    draggedTask = null;
    document.querySelectorAll('.kanban-column').forEach(c => c.style.background = '');
  }

  function moveTask(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;
    task.status = newStatus;

    // Re-render
    renderKanban();

    // Trigger sound and animation if completing
    if (newStatus === 'done') {
      if (window.BountySystem) window.BountySystem.playSound('task_complete');

      // Update XP
      addXP(task.xp || 30, task.title);

      // Crew animation
      if (window.ShipScene) {
        window.ShipScene.showSpeechBubble('usopp', `"${task.title}" — TREASURE CLAIMED! +${task.xp || 30}XP!`, 3000);
      }

      addActivityEntry({
        ts: new Date().toISOString(),
        crew: 'usopp',
        icon: '🎯',
        message: `Task completed: "${task.title}" — +${task.xp || 30}XP!`,
        detail: `Moved from ${oldStatus} to done. Great work, Captain!`,
        type: 'task_completed'
      });
    }
  }

  // ─── XP system ───────────────────────────────────────────────────
  function addXP(amount, taskTitle) {
    // Update displayed bounty
    const xpEl = document.getElementById('captain-xp');
    if (!xpEl) return;

    const currentXP = parseInt(xpEl.dataset.xp || '0');
    const newXP = currentXP + amount;
    xpEl.dataset.xp = newXP;

    const oldLevel = window.BountySystem?.getLevel(currentXP);
    const newLevel = window.BountySystem?.getLevel(newXP);

    if (window.BountySystem) {
      const bounty = window.BountySystem.xpToBounty(newXP);
      const bountyEl = document.getElementById('bounty-amount-display');
      if (bountyEl) bountyEl.textContent = window.BountySystem.formatBounty(bounty);

      const progress = window.BountySystem.getLevelProgress(newXP);
      const progressEl = document.querySelector('.xp-bar-fill');
      if (progressEl) progressEl.style.width = progress + '%';

      // Level up?
      if (oldLevel?.name !== newLevel?.name) {
        window.BountySystem.triggerLevelUpCelebration(newLevel.name);
        const levelBadge = document.getElementById('level-badge');
        if (levelBadge) {
          levelBadge.textContent = `${newLevel.emoji} ${newLevel.name}`;
          levelBadge.style.color = newLevel.color;
        }
      }

      window.BountySystem.renderBountyPosterMini(newXP, { name: 'William', xp: newXP });
    }
  }

  // ─── Card clicked ─────────────────────────────────────────────────
  function cardClicked(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('task-modal');
    const content = document.getElementById('task-modal-content');
    if (!modal || !content) return;

    const daysUntil = getDaysUntil(task.due_at);
    const dueTxt = formatDueDate(daysUntil);
    const subjectColour = getSubjectColour(task.subject);

    content.innerHTML = `
      <div style="border-left:4px solid ${subjectColour};padding-left:12px;margin-bottom:12px;">
        <div style="font-family:var(--font-pirate);font-size:20px;color:var(--text-dark);">${escapeHTML(task.title)}</div>
        <div style="font-family:var(--font-mono);font-size:11px;color:${subjectColour};margin-top:2px;">${task.subject} — ${task.course}</div>
      </div>

      ${task.description ? `
        <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-medium);margin:8px 0;line-height:1.5;background:rgba(0,0,0,0.05);padding:8px;border-radius:4px;">
          ${escapeHTML(task.description.substring(0, 200))}${task.description.length > 200 ? '...' : ''}
        </div>
      ` : ''}

      ${dueTxt ? `
        <div style="font-family:var(--font-pirate);font-size:14px;color:${daysUntil <= 2 ? 'var(--red-accent)' : 'var(--text-dark)'};margin:8px 0;">
          🧭 ${dueTxt}
        </div>
      ` : ''}

      <div style="font-family:var(--font-pirate);font-size:13px;color:var(--gold-dark);margin:8px 0;">
        ⚡ +${task.xp || 30} XP when claimed
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
        ${task.canvas_url ? `
          <a href="${task.canvas_url}" target="_blank" style="background:var(--navy);color:var(--gold);border:1px solid var(--gold-dark);border-radius:6px;padding:8px 14px;font-family:var(--font-pirate);font-size:12px;text-decoration:none;">
            📚 Open in Canvas
          </a>
        ` : ''}
        <button onclick="GrandLine.moveTask('${task.id}','sailing');GrandLine.closeModal('task-modal');"
                style="background:var(--navy-light);color:white;border:1px solid var(--navy-light);border-radius:6px;padding:8px 14px;font-family:var(--font-pirate);font-size:12px;cursor:pointer;">
          ⛵ Start Sailing
        </button>
        <button onclick="GrandLine.moveTask('${task.id}','done');GrandLine.closeModal('task-modal');"
                style="background:var(--gold-dark);color:var(--text-dark);border:none;border-radius:6px;padding:8px 14px;font-family:var(--font-pirate);font-size:12px;cursor:pointer;">
          ✨ Claim Treasure!
        </button>
        <button onclick="GrandLine.closeModal('task-modal')"
                style="background:rgba(0,0,0,0.1);color:var(--text-medium);border:1px solid var(--parchment-border);border-radius:6px;padding:8px 14px;font-family:var(--font-pirate);font-size:12px;cursor:pointer;">
          Back to Ship
        </button>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  }

  // ─── Activity feed ────────────────────────────────────────────────
  async function loadActivityFeed() {
    try {
      const r = await fetch('cerritos-activity.jsonl?t=' + Date.now());
      const text = await r.text();
      activityEntries = text.trim().split('\n')
        .filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch(e) { return null; } })
        .filter(Boolean)
        .reverse(); // newest first
    } catch (e) {
      console.warn('Could not load activity feed');
      activityEntries = [];
    }
  }

  function renderActivityFeed() {
    const list = document.getElementById('activity-list');
    if (!list) return;

    list.innerHTML = '';

    const entries = activityEntries.slice(0, 20);

    if (entries.length === 0) {
      list.innerHTML = '<div style="font-family:var(--font-pirate);font-size:12px;color:rgba(255,215,0,0.3);text-align:center;padding:16px;">Den Den Mushi is quiet... for now 🐌</div>';
      return;
    }

    entries.forEach(entry => {
      list.appendChild(createActivityEntry(entry));
    });

    // Auto-scroll to top
    list.scrollTop = 0;
  }

  function createActivityEntry(entry) {
    const div = document.createElement('div');
    div.className = 'activity-entry';
    div.innerHTML = `
      <div class="activity-crew-icon">${entry.icon || getCrewIcon(entry.crew)}</div>
      <div class="activity-content">
        <div class="activity-time">[Den Den 🐌 ${formatTime(entry.ts)}]</div>
        <div class="activity-text">${escapeHTML(entry.message)}</div>
        ${entry.detail ? `<div class="activity-detail">${escapeHTML(entry.detail)}</div>` : ''}
      </div>
    `;

    div.addEventListener('click', () => {
      div.classList.toggle('expanded');
    });

    return div;
  }

  function addActivityEntry(entry) {
    activityEntries.unshift(entry);
    const list = document.getElementById('activity-list');
    if (!list) return;

    const el = createActivityEntry(entry);
    el.style.background = 'rgba(255,215,0,0.08)';
    list.insertBefore(el, list.firstChild);

    // Remove oldest if > 20
    while (list.children.length > 20) {
      list.removeChild(list.lastChild);
    }

    // Ring den den
    if (window.ShipScene) window.ShipScene.updateDenDen(true);
  }

  function formatTime(ts) {
    if (!ts) return '??:??';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return ts.substring(11, 16);
    }
  }

  // ─── Activity polling (tails the JSONL file) ──────────────────────
  let lastActivityCount = 0;
  function startActivityPolling() {
    lastActivityCount = activityEntries.length;
    setInterval(async () => {
      await loadActivityFeed();
      if (activityEntries.length > lastActivityCount) {
        const newEntries = activityEntries.slice(0, activityEntries.length - lastActivityCount);
        newEntries.forEach(e => addActivityEntry(e));
        lastActivityCount = activityEntries.length;
      }
    }, 30000);
  }

  // ─── Helpers ──────────────────────────────────────────────────────
  function getCrewIcon(crewId) {
    const icons = {
      luffy: '👒', zoro: '⚔️', nami: '🗺️',
      chopper: '🦌', usopp: '🎯', sanji: '🍳',
      cerritos: '🐌', system: '⚙️'
    };
    return icons[crewId] || '🐌';
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─── Public API ───────────────────────────────────────────────────
  return {
    init,
    renderKanban,
    dragStart,
    dragEnd,
    moveTask,
    cardClicked,
    closeModal,
    addActivityEntry,
    tasks: () => tasks
  };

})();

window.GrandLine = GrandLine;
