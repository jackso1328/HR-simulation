/* ═══════════════════════════════════════════════════════════
   TERMINAL.JS — Advanced command mode
   Optional feature, hidden by default.
═══════════════════════════════════════════════════════════ */
window.HRTerminal = {
  print: function(msg, cls) {
    var out = document.getElementById('terminal-output');
    if (!out) return;
    var div = document.createElement('div');
    div.className = 't-line ' + (cls || '');
    div.innerText  = msg;
    out.appendChild(div);
    out.scrollTop  = out.scrollHeight;
  },

  execute: function(raw) {
    var cmd = raw.trim().toLowerCase();
    this.print('> ' + raw, 't-muted');

    var s = window.HRState;

    if (cmd === 'help') {
      this.print('Available commands:', '');
      this.print('  status          — Show simulation status', '');
      this.print('  show workforce  — Show workforce gap', '');
      this.print('  show budget     — Show budget details', '');
      this.print('  show employees  — List employees', '');
      this.print('  show candidates — List candidate pool', '');
      this.print('  show training   — Show training programs', '');
      this.print('  show hired      — Show hired candidates', '');
      this.print('  show scores     — Show current scores', '');
      this.print('  reset           — Restart simulation', '');
      return;
    }

    if (cmd === 'status') {
      this.print('Phase: ' + s.phase + ' | Budget: ₹' + s.budget.toLocaleString('en-IN') + ' | Morale: ' + s.morale + '% | Readiness: ' + s.readiness + '%', 't-success');
      return;
    }

    if (cmd === 'show workforce' || cmd === 'workforce') {
      this.print('=== WORKFORCE GAP ===', 't-success');
      var keys = Object.keys(s.requirements);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        this.print(k + ': Required=' + s.requirements[k] + ' Available=' + s.available[k] + ' Gap=' + s.gap[k], s.gap[k] > 0 ? 't-error' : 't-success');
      }
      return;
    }

    if (cmd === 'show budget' || cmd === 'budget') {
      this.print('Budget: ₹' + s.budget.toLocaleString('en-IN') + ' of ₹' + (s.scenario ? s.scenario.budget.toLocaleString('en-IN') : '?'), 't-success');
      this.print('Recruitment spent: ₹' + s.recruitmentCost.toLocaleString('en-IN'), '');
      this.print('Training spent: ₹' + s.trainingCost.toLocaleString('en-IN'), '');
      this.print('Hiring spent: ₹' + s.hiringCost.toLocaleString('en-IN'), '');
      return;
    }

    if (cmd === 'show employees' || cmd === 'employees') {
      this.print('=== EMPLOYEES ===', 't-success');
      s.employees.forEach(function(e) {
        window.HRTerminal.print(e.id + ': ' + e.name + ' | ' + e.role + ' | Cloud:' + e.cloud + ' ML:' + e.ml + ' AI:' + e.ai, '');
      });
      return;
    }

    if (cmd === 'show candidates' || cmd === 'candidates') {
      if (s.candidatePool.length === 0) { this.print('No candidates yet. Select a recruitment channel first.', 't-warning'); return; }
      this.print('=== CANDIDATE POOL (' + s.candidatePool.length + ') ===', 't-success');
      s.candidatePool.forEach(function(c) {
        window.HRTerminal.print(c.id + ': ' + c.name + ' | Score:' + c.assessment + ' Fit:' + c.cultureFit + '% Risk:' + c.risk, '');
      });
      return;
    }

    if (cmd === 'show training' || cmd === 'training') {
      this.print('=== TRAINING PROGRAMS ===', 't-success');
      window.HRScenarios.trainingPrograms.forEach(function(p) {
        window.HRTerminal.print(p.id + ': ' + p.name + ' | Cost:₹' + (p.cost/1000) + 'K | ' + p.weeks + ' weeks | +' + p.skillGain.min + '-' + p.skillGain.max + ' ' + p.skillGain.skill, '');
      });
      return;
    }

    if (cmd === 'show hired' || cmd === 'hired') {
      if (s.hiredCandidates.length === 0) { this.print('No candidates hired yet.', 't-warning'); return; }
      this.print('=== HIRED (' + s.hiredCandidates.length + ') ===', 't-success');
      s.hiredCandidates.forEach(function(c) {
        window.HRTerminal.print('✓ ' + c.name + ' | Score:' + c.assessment + ' | Cost:₹' + c.hireCost.toLocaleString('en-IN'), 't-success');
      });
      return;
    }

    if (cmd === 'show scores' || cmd === 'scores') {
      var sc = window.HREngine.calculateFinalScores();
      this.print('=== SCORES ===', 't-success');
      var keys2 = Object.keys(sc);
      for (var j = 0; j < keys2.length; j++) {
        this.print(keys2[j] + ': ' + sc[keys2[j]], '');
      }
      return;
    }

    if (cmd === 'reset' || cmd === 'restart') {
      window.HRApp.reset();
      return;
    }

    this.print('Unknown command. Type "help" for a list.', 't-error');
  }
};
