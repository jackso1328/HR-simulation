/* ═══════════════════════════════════════════════════════════
   APP.JS — Bootstrapper & lifecycle management
═══════════════════════════════════════════════════════════ */
window.HRApp = {
  selectedScenarioId: null,
  selectedDifficulty: 'manager',
  _bound: false,

  init: function() {
    this.buildScenarioPicker();
    this.showJourney();
    this.bindIntroEvents();

    // Animate logo in
    setTimeout(function() {
      var logo = document.getElementById('intro-logo');
      if (logo) { logo.classList.remove('hidden'); logo.classList.add('anim-fadeup'); }
    }, 200);
    setTimeout(function() {
      var picker = document.getElementById('intro-scenario-picker');
      if (picker) { picker.classList.remove('hidden'); picker.classList.add('anim-fadeup-2'); }
    }, 600);
    setTimeout(function() {
      var journey = document.getElementById('intro-journey');
      if (journey) { journey.classList.remove('hidden'); journey.classList.add('anim-fadeup-3'); }
    }, 900);
  },

  buildScenarioPicker: function() {
    var grid     = document.getElementById('scenario-grid');
    var scenarios= window.HRScenarios.scenarios;
    if (!grid) return;

    var self = this;
    grid.innerHTML = scenarios.map(function(sc) {
      return '<div class="scenario-card" data-id="' + sc.id + '" onclick="window.HRApp.selectScenario(\'' + sc.id + '\')">' +
        '<div class="sc-tag ' + sc.tagClass + '">' + sc.tag + '</div>' +
        '<div class="sc-icon">' + sc.icon + '</div>' +
        '<div class="sc-name">' + sc.name + '</div>' +
        '<div class="sc-desc">' + sc.brief.substring(0, 100) + '…</div>' +
        '<div class="sc-meta">' +
          '<div class="sc-meta-item">⏱ <strong>' + sc.deadline + '</strong> months</div>' +
          '<div class="sc-meta-item">💰 <strong>₹' + (sc.budget/100000).toFixed(0) + 'L</strong> budget</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // Select first scenario by default
    if (scenarios.length > 0) {
      this.selectScenario(scenarios[0].id);
    }
  },

  selectScenario: function(id) {
    this.selectedScenarioId = id;
    var cards = document.querySelectorAll('.scenario-card');
    cards.forEach(function(c) {
      c.classList.toggle('selected', c.getAttribute('data-id') === id);
    });
  },

  showJourney: function() {
    var journey = window.HREngine.getJourney();
    var cont    = document.getElementById('journey-stats');
    if (!cont) return;

    if (journey.totalRuns === 0) {
      cont.innerHTML = '<div class="journey-stat"><div class="val">0</div><div class="lbl">Runs</div></div><div class="text-center c-muted" style="font-size:0.82rem; width:100%">Your HR journey begins here.</div>';
      return;
    }

    cont.innerHTML = [
      { val: journey.totalRuns, lbl: 'Total Runs' },
      { val: journey.bestScore, lbl: 'Best Score' },
      { val: journey.bestReadiness + '%', lbl: 'Best Readiness' },
      { val: journey.scenariosCompleted.length + '/5', lbl: 'Scenarios Done' }
    ].map(function(s) {
      return '<div class="journey-stat"><div class="val">' + s.val + '</div><div class="lbl">' + s.lbl + '</div></div>';
    }).join('');
  },

  bindIntroEvents: function() {
    if (this._bound) return;
    this._bound = true;
    var self = this;

    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.diff-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        self.selectedDifficulty = btn.getAttribute('data-diff');
      });
    });

    // Start button
    var startBtn = document.getElementById('btn-start-simulation');
    if (startBtn) startBtn.addEventListener('click', function() { self.startSimulation(); });

    // Random scenario button
    var randBtn = document.getElementById('btn-random-scenario');
    if (randBtn) randBtn.addEventListener('click', function() {
      var ids = window.HRScenarios.scenarios.map(function(s) { return s.id; });
      var randomId = ids[Math.floor(Math.random() * ids.length)];
      self.selectScenario(randomId);
      self.startSimulation();
    });

    // Skip button
    var skipBtn = document.getElementById('btn-skip-intro');
    if (skipBtn) skipBtn.addEventListener('click', function() {
      if (!self.selectedScenarioId) {
        self.selectScenario(window.HRScenarios.scenarios[0].id);
      }
      self.startSimulation();
    });
  },

  bindAppEvents: function() {
    // Terminal input
    var input = document.getElementById('command-input');
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && input.value.trim()) {
          window.HRTerminal.execute(input.value.trim());
          input.value = '';
        }
      });
    }

    // Modal close
    var closeBtn = document.getElementById('btn-close-modal');
    if (closeBtn) closeBtn.addEventListener('click', function() { window.HRUI.closeModal(); });

    var overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.addEventListener('click', function(e) {
      if (e.target === overlay) window.HRUI.closeModal();
    });

    // Terminal toggle
    var termBtn = document.getElementById('btn-toggle-terminal');
    if (termBtn) termBtn.addEventListener('click', function() {
      var term = document.getElementById('terminal');
      if (!term) return;
      term.classList.toggle('hidden');
      termBtn.classList.toggle('active', !term.classList.contains('hidden'));
    });

    // Classroom mode
    var classBtn = document.getElementById('btn-classroom-mode');
    if (classBtn) classBtn.addEventListener('click', function() {
      document.body.classList.toggle('classroom-mode');
      classBtn.classList.toggle('active', document.body.classList.contains('classroom-mode'));
    });

    // Restart button
    var resetBtn = document.getElementById('btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', function() {
      if (confirm('Restart simulation? Your current progress will be lost.')) {
        window.HRApp.reset();
      }
    });

    // Sidebar toggle for mobile
    var sidebarToggle = document.getElementById('btn-sidebar-toggle');
    if (sidebarToggle) sidebarToggle.addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('sidebar-open');
    });

    // Nav item clicks (only for completed phases)
    document.querySelectorAll('.nav-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        var phase = parseInt(item.getAttribute('data-phase'));
        var s = window.HRState;
        if (phase === s.phase || s.completedPhases.includes(phase)) {
          window.HRUI.renderPhase(phase);
          window.HRUI.updateNav();
          // Close sidebar on mobile
          document.getElementById('sidebar').classList.remove('sidebar-open');
        }
      });
    });
  },

  startSimulation: function() {
    var scenarioId = this.selectedScenarioId || window.HRScenarios.scenarios[0].id;
    var difficulty = this.selectedDifficulty || 'manager';

    // Init state
    window.HRState.init(scenarioId, difficulty);
    window.HREvents.reset();

    // Switch screens
    document.getElementById('intro-screen').classList.remove('active');
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('active');

    // Bind app events (idempotent)
    this.bindAppEvents();

    // Initial render
    window.HRUI.updateScenarioBadge();
    window.HRUI.updateNav();
    window.HRUI.updateKPIs();
    window.HRUI.updateScorecard();
    window.HRUI.updateTimeline();
    window.HRUI.renderPhase(1);

    // Welcome terminal message
    window.HRTerminal.print('NOVA HR COMMAND — ' + window.HRState.scenario.name, 't-success');
    window.HRTerminal.print('Type "help" for available commands.', 't-muted');
  },

  reset: function() {
    // Reset events
    window.HREvents.reset();

    // Clear terminal
    var out = document.getElementById('terminal-output');
    if (out) out.innerHTML = '';

    // Switch back to intro
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('intro-screen').classList.remove('hidden');
    document.getElementById('intro-screen').classList.add('active');

    // Remove classroom mode
    document.body.classList.remove('classroom-mode');

    // Refresh journey stats
    this.showJourney();
  },

  replayDifferent: function() {
    // Keep same scenario, reset everything else
    var oldScenario = window.HRState.scenarioId;
    window.HREvents.reset();

    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('intro-screen').classList.remove('hidden');
    document.getElementById('intro-screen').classList.add('active');

    this.selectScenario(oldScenario);
    this.showJourney();
  }
};

// Boot
document.addEventListener('DOMContentLoaded', function() {
  window.HRApp.init();
});
