/**
 * William HQ — Offline-First Telemetry
 * ═══════════════════════════════════════════
 * Admiral Adam's pattern: queue at school, flush when home.
 *
 * AT SCHOOL  → All events written to localStorage queue only.
 *              Zero network calls. Silent fail. App never blocked.
 * AT HOME    → Detect Cerritos :3401, batch-upload everything, clear queue.
 *
 * RULES:
 *  - NEVER throws or propagates errors to the parent app
 *  - No third-party libraries — vanilla JS only
 *  - Privacy: metadata only (timestamps, device IDs, event types)
 *    Never uploads content of William's actual work
 *  - Max queue: 5000 entries (oldest dropped when full)
 *  - Queue is always persisted to localStorage
 */
(function () {
  'use strict';

  var APP_VERSION          = '1.0.0';
  var CERRITOS_URL         = 'http://192.168.50.9:3401';
  var HEALTH_URL           = CERRITOS_URL + '/health';
  var BATCH_URL            = CERRITOS_URL + '/api/telemetry/batch';
  var QUEUE_KEY            = 'telemetry_queue';
  var DEVICE_KEY           = 'telemetry_device_id';
  var MAX_QUEUE            = 5000;
  var HOME_TIMEOUT_MS      = 2000;   // 2 s to detect Cerritos
  var FLUSH_INTERVAL_MS    = 2 * 60 * 1000;   // auto-flush every 2 min
  var HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;  // heartbeat every 5 min

  // ── UUID ──────────────────────────────────────────────────────────────────
  function genUUID() {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback for older browsers
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    }
  }

  // ── Device ID ──────────────────────────────────────────────────────────────
  var _deviceId = null;

  function getDeviceId() {
    if (_deviceId) return _deviceId;
    try {
      var stored = localStorage.getItem(DEVICE_KEY);
      if (!stored) {
        stored = genUUID();
        localStorage.setItem(DEVICE_KEY, stored);
      }
      _deviceId = stored;
    } catch (e) {
      if (!_deviceId) _deviceId = 'device-' + genUUID();
    }
    return _deviceId;
  }

  function getDeviceType() {
    try {
      var ua = navigator.userAgent || '';
      if (/iPad/.test(ua))    return 'ipad';
      if (/iPhone/.test(ua))  return 'iphone';
      if (/Android/.test(ua)) return 'android';
      return 'school_laptop';
    } catch (e) {
      return 'school_laptop';
    }
  }

  // ── localStorage queue ────────────────────────────────────────────────────
  function loadQueue() {
    try {
      var raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function saveQueue(q) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch (e) {
      // Storage full — silently drop oldest half and retry
      try {
        var trimmed = q.slice(Math.floor(q.length / 2));
        localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
      } catch (e2) {}
    }
  }

  function enqueue(entry) {
    try {
      var q = loadQueue();
      q.push(entry);
      if (q.length > MAX_QUEUE) {
        q.splice(0, q.length - MAX_QUEUE); // Drop oldest
      }
      saveQueue(q);
    } catch (e) {}
  }

  // ── Home WiFi detection ───────────────────────────────────────────────────
  // Try to reach Cerritos :3401 /health — success = we're home
  function isAtHome() {
    return new Promise(function (resolve) {
      try {
        var controller = new AbortController();
        var timer = setTimeout(function () {
          controller.abort();
          resolve(false);
        }, HOME_TIMEOUT_MS);

        fetch(HEALTH_URL, {
          signal: controller.signal,
          mode: 'cors',
          cache: 'no-store'
        }).then(function (res) {
          clearTimeout(timer);
          resolve(res.ok);
        }).catch(function () {
          clearTimeout(timer);
          resolve(false);
        });
      } catch (e) {
        resolve(false);
      }
    });
  }

  // ── Flush queue to Cerritos ───────────────────────────────────────────────
  var _flushing = false;

  function flushQueue() {
    if (_flushing) return Promise.resolve();
    _flushing = true;

    return isAtHome().then(function (home) {
      if (!home) {
        var q = loadQueue();
        if (q.length > 0) {
          console.debug('[Telemetry] Not at home. Queue size:', q.length);
        }
        _flushing = false;
        return;
      }

      var q = loadQueue();
      if (q.length === 0) {
        _flushing = false;
        return;
      }

      var payload = JSON.stringify({ device_id: getDeviceId(), entries: q });
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 8000);

      return fetch(BATCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: controller.signal
      }).then(function (res) {
        clearTimeout(timer);
        if (res.ok) {
          return res.json().then(function (result) {
            console.debug('[Telemetry] Flushed', (result && result.accepted) || q.length, 'entries to Cerritos');
            saveQueue([]); // Clear on success
          });
        }
      }).catch(function (e) {
        clearTimeout(timer);
        console.debug('[Telemetry] Flush error (silent):', e.message);
      }).then(function () {
        _flushing = false;
      });
    }).catch(function () {
      _flushing = false;
    });
  }

  // ── Beacon flush (page unload — best-effort) ──────────────────────────────
  function beaconFlush() {
    try {
      var q = loadQueue();
      if (q.length === 0) return;
      if (!navigator.sendBeacon) return;
      var payload = JSON.stringify({ device_id: getDeviceId(), entries: q });
      var blob = new Blob([payload], { type: 'application/json' });
      var sent = navigator.sendBeacon(BATCH_URL, blob);
      if (sent) {
        saveQueue([]);
        console.debug('[Telemetry] Beacon flush sent (' + q.length + ' entries)');
      }
    } catch (e) {}
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * initTelemetry()
   * Call once on page load. Mints device UUID, starts timers,
   * registers online/unload listeners. Safe to call multiple times.
   */
  function initTelemetry() {
    try {
      getDeviceId(); // Mint UUID on first load

      // Send initial heartbeat
      sendHeartbeat();

      // Heartbeat every 5 min
      setInterval(function () {
        sendHeartbeat();
      }, HEARTBEAT_INTERVAL_MS);

      // Auto-flush every 2 min
      setInterval(function () {
        flushQueue().catch(function () {});
      }, FLUSH_INTERVAL_MS);

      // Flush attempt shortly after load (in case we just got home)
      setTimeout(function () {
        flushQueue().catch(function () {});
      }, 8000);

      // Flush on coming back online
      window.addEventListener('online', function () {
        console.debug('[Telemetry] Online event — attempting flush');
        flushQueue().catch(function () {});
      });

      // Beacon on page unload (best-effort)
      window.addEventListener('pagehide', beaconFlush);
      window.addEventListener('beforeunload', beaconFlush);

      // Also beacon when tab goes hidden (iOS background / tab switch)
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') beaconFlush();
      });

      console.debug('[Telemetry] Initialised. Device:', getDeviceId(), '| Queue:', loadQueue().length);
    } catch (e) {
      // Never propagate
    }
  }

  /**
   * sendHeartbeat()
   * Writes {device_id, device_type, timestamp, battery, url, app_version}
   * to the queue. Auto-called every 5 min by initTelemetry().
   */
  function sendHeartbeat() {
    try {
      var entry = {
        type: 'heartbeat',
        device_id: getDeviceId(),
        device_type: getDeviceType(),
        timestamp: new Date().toISOString(),
        battery: null,
        url: (window.location && window.location.href) || null,
        app_version: APP_VERSION
      };

      // Battery API (async — update entry if available)
      try {
        if (navigator.getBattery) {
          navigator.getBattery().then(function (b) {
            entry.battery = Math.round(b.level * 100);
            enqueue(entry);
            console.debug('[Telemetry] Heartbeat queued (battery:', entry.battery + '%)');
          }).catch(function () {
            enqueue(entry);
            console.debug('[Telemetry] Heartbeat queued (no battery)');
          });
          return; // Will enqueue inside the promise
        }
      } catch (e) {}

      enqueue(entry);
      console.debug('[Telemetry] Heartbeat queued');
    } catch (e) {}
  }

  /**
   * logReceipt(messageId, event)
   * event ∈ ['received', 'rendered', 'opened', 'dismissed']
   * Privacy: message content is NEVER included — only IDs and timestamps.
   */
  function logReceipt(messageId, event) {
    try {
      var valid = ['received', 'rendered', 'opened', 'dismissed'];
      if (!messageId || !event || valid.indexOf(event) === -1) return;

      enqueue({
        type: 'receipt',
        device_id: getDeviceId(),
        message_id: String(messageId),
        event: event,
        timestamp: new Date().toISOString()
      });
      console.debug('[Telemetry] Receipt queued:', messageId, event);
    } catch (e) {}
  }

  /**
   * logEvent(type, data)
   * Generic event logger. data should be small metadata only — no content.
   * Examples: logEvent('canvas_sync', {count:3}), logEvent('interaction', {button_id:'tasks'})
   */
  function logEvent(type, data) {
    try {
      if (!type) return;
      enqueue({
        type: 'event',
        device_id: getDeviceId(),
        event_type: String(type),
        data: data || {},
        timestamp: new Date().toISOString()
      });
      console.debug('[Telemetry] Event queued:', type);
    } catch (e) {}
  }

  // ── Expose globals ────────────────────────────────────────────────────────
  // Namespaced object
  window.WilliamTelemetry = {
    initTelemetry: initTelemetry,
    sendHeartbeat: sendHeartbeat,
    logReceipt: logReceipt,
    logEvent: logEvent,
    flushQueue: flushQueue,
    getDeviceId: getDeviceId,
    getQueueSize: function () { return loadQueue().length; }
  };

  // Top-level convenience aliases (so calling code doesn't need prefix)
  window.initTelemetry = initTelemetry;
  window.sendHeartbeat = sendHeartbeat;
  window.logReceipt    = logReceipt;
  window.logEvent      = logEvent;

})();
