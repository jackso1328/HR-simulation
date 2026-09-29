/* ═══════════════════════════════════════════════════════════
   EVENTS.JS — Random HR Events System
═══════════════════════════════════════════════════════════ */
window.HREvents = {
  triggeredIds: [],

  checkAndTrigger: function(phase) {
    var state    = window.HRState;
    var events   = state.scenario.events || [];
    var self     = this;

    // Find eligible events for this phase that haven't fired
    var eligible = events.filter(function(ev) {
      return ev.triggerPhase === phase && !self.triggeredIds.includes(ev.id);
    });

    if (eligible.length === 0) return;

    // Only trigger one event per phase (pick randomly weighted by probability)
    eligible.sort(function() { return Math.random() - 0.5; });
    var ev = eligible[0];

    // Apply probability check
    var rand = Math.random();

    // Difficulty affects probability
    var probMultiplier = { beginner: 0.5, manager: 1.0, chro: 1.5 };
    var adjustedProb = ev.probability * (probMultiplier[state.difficulty] || 1);

    if (rand > adjustedProb) return; // Event didn't fire this run

    self.triggeredIds.push(ev.id);
    state.triggeredEvents.push(ev.id);

    // Apply the event
    if (ev.apply && typeof ev.apply === 'function') {
      ev.apply(state);
    }

    // Show event notification
    self.showEventNotification(ev);

    // Log to event feed
    self.addToFeed(ev);

    // Terminal
    window.HRTerminal.print('⚡ EVENT: ' + ev.title, 't-warning');
    window.HRTerminal.print('   ' + ev.desc, 't-muted');

    window.HRUI.updateKPIs();
  },

  showEventNotification: function(ev) {
    // Remove any existing event overlay
    var existing = document.getElementById('event-notification');
    if (existing) existing.remove();

    var typeClass = {
      danger: 'danger-insight',
      warning: 'warn-insight',
      success: 'success-insight'
    }[ev.type] || '';

    var effectClass = {
      danger: 'effect-bad',
      warning: 'effect-neutral',
      success: 'effect-good'
    }[ev.type] || 'effect-neutral';

    var div = document.createElement('div');
    div.id = 'event-notification';
    div.className = 'event-overlay';
    div.innerHTML =
      '<div class="event-overlay-icon">' + ev.icon + '</div>' +
      '<div class="event-overlay-type c-warning">⚡ HR EVENT</div>' +
      '<div class="event-overlay-title">' + ev.title + '</div>' +
      '<div class="event-overlay-desc">' + ev.desc + '</div>' +
      '<div class="event-overlay-effect ' + effectClass + '">' + ev.effectLabel + '</div>' +
      '<button class="btn btn-ghost btn-sm w-full" onclick="document.getElementById(\'event-notification\').remove()">Acknowledged ✓</button>';

    document.body.appendChild(div);

    // Auto-dismiss after 8 seconds
    setTimeout(function() {
      var el = document.getElementById('event-notification');
      if (el) el.remove();
    }, 8000);
  },

  addToFeed: function(ev) {
    var feed = document.getElementById('event-feed');
    if (!feed) return;

    var classMap = { danger: 'ev-danger', warning: 'ev-warn', success: 'ev-success' };
    var div = document.createElement('div');
    div.className = 'event-item ' + (classMap[ev.type] || '');
    div.innerHTML = '<div class="event-item-title">' + ev.icon + ' ' + ev.title + '</div>' +
                    '<div class="event-item-desc">' + ev.effectLabel + '</div>';
    feed.insertBefore(div, feed.firstChild);
  },

  reset: function() {
    this.triggeredIds = [];
  }
};
