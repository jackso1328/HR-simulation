/* ═══════════════════════════════════════════════════════════
   APP.JS — Bootstrapper & lifecycle (minimal UI edition)
═══════════════════════════════════════════════════════════ */
window.HRApp = {
  selectedScenarioId: null,
  selectedDifficulty: 'beginner',
  _appBound: false,

  init: function() {
    this.buildScenarioPicker();
    this.showJourney();
    this.bindIntroEvents();
  },

  buildScenarioPicker: function() {
    var grid   = document.getElementById('scenario-grid');
    var scList = window.HRScenarios.scenarios;
    if (!grid) return;
    var self   = this;

    var tagClassMap = { URGENT:'', COMPLIANCE:'tag-scale', RESKILLING:'tag-growth', GROWTH:'tag-growth', CRISIS:'tag-crisis' };

    grid.innerHTML = scList.map(function(sc) {
      return '<div class="sc-card" data-id="' + sc.id + '" onclick="window.HRApp.selectScenario(\'' + sc.id + '\')">' +
        '<div class="sc-card-tag ' + (tagClassMap[sc.tag] || '') + '">' + sc.tag + '</div>' +
        '<div class="sc-card-icon">' + sc.icon + '</div>' +
        '<div class="sc-card-name">' + sc.name + '</div>' +
        '<div class="sc-card-sub">' + sc.brief + '</div>' +
        '<div class="sc-card-meta">' +
          '<span class="sc-card-meta-item">⏱ <strong>' + sc.deadline + '</strong>mo</span>' +
          '<span class="sc-card-meta-item">💰 <strong>₹' + (sc.budget/100000).toFixed(0) + 'L</strong></span>' +
        '</div>' +
      '</div>';
    }).join('');

    // Default select first
    if (scList.length > 0) this.selectScenario(scList[0].id);
  },

  selectScenario: function(id) {
    this.selectedScenarioId = id;
    document.querySelectorAll('.sc-card').forEach(function(c) {
      c.classList.toggle('selected', c.getAttribute('data-id') === id);
    });
  },

  showJourney: function() {
    var journey = window.HREngine.getJourney();
    var cont    = document.getElementById('intro-journey');
    if (!cont) return;
    if (journey.totalRuns === 0) {
      cont.innerHTML = '<span style="font-size:0.78rem; color:var(--gray-400)">Your HR journey begins here.</span>';
      return;
    }
    cont.innerHTML = [
      { val: journey.totalRuns,   lbl: 'Runs' },
      { val: journey.bestScore,   lbl: 'Best Score' },
      { val: journey.bestReadiness + '%', lbl: 'Best Readiness' },
      { val: journey.scenariosCompleted.length + '/5', lbl: 'Scenarios' }
    ].map(function(s) {
      return '<div class="j-stat"><span class="val">' + s.val + '</span><span class="lbl">' + s.lbl + '</span></div>';
    }).join('');
  },

  bindIntroEvents: function() {
    var self = this;

    // Difficulty
    document.querySelectorAll('.seg-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.seg-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        self.selectedDifficulty = btn.getAttribute('data-diff');
      });
    });

    // Start
    var startBtn = document.getElementById('btn-start-simulation');
    if (startBtn) startBtn.addEventListener('click', function() { self.startSimulation(); });

    // Random
    var randBtn = document.getElementById('btn-random-scenario');
    if (randBtn) randBtn.addEventListener('click', function() {
      var ids = window.HRScenarios.scenarios.map(function(s) { return s.id; });
      self.selectScenario(ids[Math.floor(Math.random() * ids.length)]);
      self.startSimulation();
    });
  },

  bindAppEvents: function() {
    if (this._appBound) return;
    this._appBound = true;
    var self = this;

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

    // Restart button (top bar)
    var resetBtn = document.getElementById('btn-reset-top');
    if (resetBtn) resetBtn.addEventListener('click', function() {
      if (confirm('Restart simulation?')) self.reset();
    });

    // Bottom nav
    document.querySelectorAll('.bnav-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var ph = parseInt(btn.getAttribute('data-phase'));
        var s  = window.HRState;
        if (ph === s.phase || s.completedPhases.indexOf(ph) !== -1) {
          window.HREngine.advancePhase(ph);
        }
      });
    });
  },

  startSimulation: function() {
    var scenarioId = this.selectedScenarioId || window.HRScenarios.scenarios[0].id;
    var difficulty = this.selectedDifficulty || 'beginner';

    window.HRState.init(scenarioId, difficulty);
    window.HREvents.reset();

    // Switch screens
    document.getElementById('intro-screen').classList.remove('active');
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('active');

    this.bindAppEvents();

    // Initial render
    window.HRUI.updateTopLabel();
    window.HRUI.renderPhase(1);

    // Terminal welcome
    window.HRTerminal.print('NOVA HR — ' + window.HRState.scenario.name, 't-success');
    window.HRTerminal.print('Type "help" for commands.', 't-muted');
  },

  reset: function() {
    this._appBound = false;
    window.HREvents.reset();

    var out = document.getElementById('terminal-output');
    if (out) out.innerHTML = '';

    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('intro-screen').classList.remove('hidden');
    document.getElementById('intro-screen').classList.add('active');

    this.showJourney();
  },

  replayDifferent: function() {
    var old = window.HRState.scenarioId;
    this.reset();
    this.selectScenario(old);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  window.HRApp.init();
});
