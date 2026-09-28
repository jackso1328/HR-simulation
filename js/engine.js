/* ═══════════════════════════════════════════════════════════
   ENGINE.JS — Simulation logic, formulas, and calculations
   All game logic lives here. UI calls these, never the reverse.
═══════════════════════════════════════════════════════════ */
window.HREngine = {

  // ── WORKFORCE GAP ANALYSIS ─────────────────────────────
  analyzeWorkforce: function() {
    var state = window.HRState;
    var gap   = {};
    var keys  = Object.keys(state.requirements);
    for (var i = 0; i < keys.length; i++) {
      gap[keys[i]] = state.requirements[keys[i]] - state.available[keys[i]];
    }
    state.gap = gap;
    state.morale = Math.max(0, state.morale - 5); // Tension rises during analysis

    state.logDecision('Workforce Planning', 'Workforce gap analysis', 'Shortages identified', 'Morale −5 — team aware of strain');
    this.advancePhase(2);
    return gap;
  },

  // ── HR STRATEGY CHOICE ─────────────────────────────────
  chooseStrategy: function(strategy) {
    var state = window.HRState;
    state.strategyChosen = strategy;

    var impacts = {
      recruit: { morale: 0, time: -0, budgetPct: -0.15, readiness: +8 },
      train:   { morale: +6, time: -2, budgetPct: -0.05, readiness: +4 },
      combination: { morale: +3, time: -1, budgetPct: -0.08, readiness: +6 }
    };
    var impact = impacts[strategy] || {};

    if (impact.morale)    state.morale   = Math.min(100, Math.max(0, state.morale + impact.morale));
    if (impact.readiness) state.readiness= Math.min(100, Math.max(0, state.readiness + impact.readiness));
    if (impact.time)      state.timeUsed += Math.abs(impact.time);

    var consequenceMap = {
      recruit:     'Faster hiring. Higher cost. External expertise. Cultural integration risk.',
      train:       'Lower cost. Stronger loyalty. Takes time. May not fully close skill gap.',
      combination: 'Balanced approach. Moderate cost. Moderate time. Most flexible.'
    };
    state.logDecision('HR Strategy', 'Strategy: ' + strategy.toUpperCase(), 'Morale ' + (impact.morale >= 0 ? '+' : '') + impact.morale, consequenceMap[strategy]);

    this.advancePhase(4); // Go to recruitment/training setup
    return impact;
  },

  // ── RECRUITMENT CHANNEL ────────────────────────────────
  channelConfig: {
    network:  { cost: 20000, weeks: 2, appRange: [1000, 1500], qualityMultiplier: 1.2, description: 'Professional Network' },
    college:  { cost: 12000, weeks: 3, appRange: [300, 500],   qualityMultiplier: 0.85, description: 'Campus Recruitment' },
    referral: { cost: 8000,  weeks: 1, appRange: [80, 150],    qualityMultiplier: 1.1,  description: 'Employee Referral' },
    agency:   { cost: 45000, weeks: 1, appRange: [20, 50],     qualityMultiplier: 1.35, description: 'Recruitment Agency' }
  },

  selectChannel: function(channel) {
    var state  = window.HRState;
    var config = this.channelConfig[channel];
    if (!config) return null;

    if (!state.spendBudget(config.cost, 'recruit')) {
      window.HRTerminal.print('Insufficient budget for this channel.', 't-error');
      return null;
    }

    state.recruitmentChannel = channel;
    state.timeUsed += config.weeks;

    // Generate application count using probability range
    var range = config.appRange;
    state.applications = Math.floor(Math.random() * (range[1] - range[0])) + range[0];

    // Build candidate pool from scenario data
    var pool = state.scenario.candidatePools[channel] || [];
    state.candidatePool = pool.map(function(c) { return Object.assign({}, c); });

    // Apply quality multiplier — boost assessment scores slightly
    var mult = config.qualityMultiplier;
    state.candidatePool.forEach(function(c) {
      c._qualityScore = Math.min(100, Math.round(c.assessment * mult));
    });

    state.logDecision('Recruitment', 'Channel: ' + config.description, 'Cost: ₹' + config.cost.toLocaleString('en-IN'), 'Pool of ' + pool.length + ' qualified candidates. ' + state.applications + ' total applications received.');

    this.advancePhase(5);
    return { channel: channel, applications: state.applications, pool: pool.length };
  },

  // ── INTERVIEW METHOD ───────────────────────────────────
  interviewConfig: {
    technical:   { label: 'Technical Assessment', timeWeeks: 1, accuracy: 0.9, moraleEffect: 0,  desc: 'Objective coding tests and problem-solving. High accuracy for technical roles.' },
    behavioral:  { label: 'Behavioral Interview',  timeWeeks: 1, accuracy: 0.75, moraleEffect: +3, desc: 'Situation-based questions. Good for culture fit and team dynamics.' },
    structured:  { label: 'Structured Interview',  timeWeeks: 1.5, accuracy: 0.85, moraleEffect: +1, desc: 'Standardized questions. Reduces bias. Good balance of accuracy and fairness.' },
    panel:       { label: 'Panel Interview',        timeWeeks: 2, accuracy: 0.92, moraleEffect: +2, desc: 'Multiple interviewers. Highest accuracy but time-intensive.' }
  },

  selectInterviewMethod: function(method) {
    var state   = window.HRState;
    var config  = this.interviewConfig[method];
    if (!config) return null;

    state.interviewMethod = method;
    state.timeUsed += config.timeWeeks;
    state.morale = Math.min(100, state.morale + config.moraleEffect);

    state.logDecision('Selection', 'Interview method: ' + config.label, 'Accuracy: ' + Math.round(config.accuracy * 100) + '%', config.desc);

    return config;
  },

  // ── HIRING ─────────────────────────────────────────────
  hireCandidate: function(candidateId) {
    var state = window.HRState;

    // Already hired?
    if (state.hiredCandidates.find(function(h) { return h.id === candidateId; })) {
      window.HRTerminal.print('Candidate already hired.', 't-warning');
      return false;
    }

    var cand = state.candidatePool.find(function(c) { return c.id === candidateId; });
    if (!cand) { window.HRTerminal.print('Candidate not found.', 't-error'); return false; }

    // Cost = candidate expected salary (prorated) + onboarding
    var hireCost = Math.round(cand.expectedSalary * 0.5) + 50000;

    if (!state.spendBudget(hireCost, 'hire')) {
      window.HRTerminal.print('Insufficient budget to hire ' + cand.name + '.', 't-error');
      return false;
    }

    state.hiredCandidates.push(Object.assign({}, cand, { hireCost: hireCost }));
    state.timeUsed += cand.noticePeriod / 30; // notice period in months

    // Morale effect based on culture fit
    var moraleEffect = cand.cultureFit > 80 ? 3 : cand.cultureFit > 60 ? 1 : -2;
    state.morale = Math.min(100, Math.max(0, state.morale + moraleEffect));

    // Improve available for the first role with gap
    var gapKeys = Object.keys(state.gap);
    for (var i = 0; i < gapKeys.length; i++) {
      if (state.gap[gapKeys[i]] > 0) {
        state.gap[gapKeys[i]]--;
        state.available[gapKeys[i]] = (state.available[gapKeys[i]] || 0) + 1;
        break;
      }
    }

    state.logDecision('Selection', 'Hired: ' + cand.name, 'Cost: ₹' + hireCost.toLocaleString('en-IN') + ' | Fit: ' + cand.cultureFit + '%', 'Growth potential: ' + cand.growthPotential + '. Risk: ' + cand.risk);

    window.HRTerminal.print('✓ ' + cand.name + ' hired. Cost: ₹' + hireCost.toLocaleString('en-IN'), 't-success');
    window.HRUI.updateKPIs();
    window.HRUI.updateScorecard();

    return { cand: cand, hireCost: hireCost, moraleEffect: moraleEffect };
  },

  // ── TRAINING ───────────────────────────────────────────
  startTraining: function(employeeId, programId) {
    var state   = window.HRState;
    var emp     = state.employees.find(function(e) { return e.id === employeeId; });
    var program = window.HRScenarios.trainingPrograms.find(function(p) { return p.id === programId; });

    if (!emp)     { window.HRTerminal.print('Employee not found.', 't-error'); return false; }
    if (!program) { window.HRTerminal.print('Training program not found.', 't-error'); return false; }

    // Check eligibility
    if (program.eligibility && !program.eligibility(emp)) {
      window.HRTerminal.print(emp.name + ' is not eligible for ' + program.name + '.', 't-warning');
      return false;
    }

    // Check if already trained in this program
    var alreadyTrained = state.trainedEmployees.find(function(t) { return t.empId === employeeId && t.programId === programId; });
    if (alreadyTrained) {
      window.HRTerminal.print(emp.name + ' has already completed this program.', 't-warning');
      return false;
    }

    if (!state.spendBudget(program.cost, 'training')) {
      window.HRTerminal.print('Insufficient budget for ' + program.name + '.', 't-error');
      return false;
    }

    // Calculate training outcome using employee's learning potential
    var baseGain = program.skillGain.min + Math.random() * (program.skillGain.max - program.skillGain.min);
    var actualGain = Math.round(baseGain * (emp.learningPotential || 0.7));

    var skill     = program.skillGain.skill;
    var beforeVal = emp[skill] || 0;
    var afterVal  = Math.min(100, beforeVal + actualGain);
    emp[skill]    = afterVal;

    state.trainedEmployees.push({
      empId: employeeId, empName: emp.name,
      programId: programId, programName: program.name,
      skill: skill, before: beforeVal, after: afterVal, gain: actualGain,
      icon: program.icon
    });

    state.timeUsed += program.weeks / 4; // convert weeks to months
    state.morale = Math.min(100, state.morale + program.moraleBoost);

    state.logDecision('Training & Dev', 'Trained ' + emp.name + ' → ' + program.name, skill + ': ' + beforeVal + ' → ' + afterVal + ' (+' + actualGain + ')', 'Morale +' + program.moraleBoost + ' | Cost: ₹' + program.cost.toLocaleString('en-IN'));

    window.HRTerminal.print('✓ ' + emp.name + ' completed ' + program.name + '. ' + skill + ': ' + beforeVal + ' → ' + afterVal, 't-success');
    window.HRUI.updateKPIs();
    window.HRUI.updateScorecard();

    return { emp: emp, program: program, before: beforeVal, after: afterVal, gain: actualGain };
  },

  // ── READINESS CALCULATION ──────────────────────────────
  calculateReadiness: function() {
    var state = window.HRState;
    var score = 0;

    // Workforce coverage (40 pts)
    var totalReq   = state.totalRequired();
    var totalAvail = state.totalAvailable();
    var coveragePct = totalReq > 0 ? Math.min(1, totalAvail / totalReq) : 1;
    score += coveragePct * 40;

    // Skill quality from hires (25 pts)
    if (state.hiredCandidates.length > 0) {
      var avgAssessment = 0;
      state.hiredCandidates.forEach(function(h) { avgAssessment += h.assessment; });
      avgAssessment /= state.hiredCandidates.length;
      score += (avgAssessment / 100) * 25;
    }

    // Training investment (20 pts)
    if (state.trainedEmployees.length > 0) {
      var avgGain = 0;
      state.trainedEmployees.forEach(function(t) { avgGain += t.gain; });
      avgGain /= state.trainedEmployees.length;
      score += Math.min(20, (avgGain / 30) * 20);
    }

    // Budget management (10 pts)
    var budgetUsedPct = 1 - (state.budget / state.scenario.budget);
    if (budgetUsedPct < 0.8) score += 10;
    else if (budgetUsedPct < 0.95) score += 5;

    // Morale bonus (5 pts)
    if (state.morale >= 80) score += 5;
    else if (state.morale >= 60) score += 2;

    // Difficulty modifier
    var diffMods = { beginner: 1.0, manager: 0.95, chro: 0.88 };
    score = Math.min(100, Math.round(score * (diffMods[state.difficulty] || 1)));

    state.readiness = score;
    return score;
  },

  // ── FINAL SCORING ──────────────────────────────────────
  calculateFinalScores: function() {
    var state = window.HRState;
    this.calculateReadiness();

    // Workforce Planning
    var gapsClosed = 0, totalGaps = 0;
    var gapKeys = Object.keys(state.gap);
    for (var i = 0; i < gapKeys.length; i++) {
      if (state.scenario.requirements[gapKeys[i]]) totalGaps++;
      if (state.gap[gapKeys[i]] <= 0) gapsClosed++;
    }
    state.scores.workforcePlanning = totalGaps > 0 ? Math.round((gapsClosed / totalGaps) * 100) : 80;

    // Recruitment Strategy
    var channelScore = { network: 75, college: 70, referral: 85, agency: 65 };
    var baseCS = channelScore[state.recruitmentChannel] || 50;
    if (state.applications > 500) baseCS += 5;
    if (state.hiredCandidates.length > 0) baseCS += 5;
    state.scores.recruitmentStrategy = Math.min(100, baseCS);

    // Selection Quality
    if (state.hiredCandidates.length > 0) {
      var avgFit = 0, avgAssessment = 0;
      state.hiredCandidates.forEach(function(h) { avgFit += h.cultureFit; avgAssessment += h.assessment; });
      avgFit /= state.hiredCandidates.length;
      avgAssessment /= state.hiredCandidates.length;
      state.scores.selectionQuality = Math.round((avgFit * 0.4 + avgAssessment * 0.6));
    } else {
      state.scores.selectionQuality = 40;
    }

    // Training Effectiveness
    if (state.trainedEmployees.length > 0) {
      var totalGain = 0;
      state.trainedEmployees.forEach(function(t) { totalGain += t.gain; });
      var avgGain2 = totalGain / state.trainedEmployees.length;
      state.scores.trainingEffectiveness = Math.min(100, Math.round(40 + (avgGain2 / 30) * 60));
    } else {
      state.scores.trainingEffectiveness = state.strategyChosen === 'train' ? 30 : 60;
    }

    // Budget Management
    var budgetRemainingPct = state.budget / (state.scenario.budget * (state.difficulty === 'beginner' ? 1.3 : 1));
    if (budgetRemainingPct >= 0.25) state.scores.budgetManagement = 90;
    else if (budgetRemainingPct >= 0.1) state.scores.budgetManagement = 70;
    else if (budgetRemainingPct >= 0) state.scores.budgetManagement = 50;
    else state.scores.budgetManagement = 20;

    // Time Management
    var timeUsedPct = state.timeUsed / (state.deadline);
    if (timeUsedPct <= 0.8) state.scores.timeManagement = 90;
    else if (timeUsedPct <= 1) state.scores.timeManagement = 70;
    else state.scores.timeManagement = 40;

    // Employee Wellbeing
    state.scores.employeeWellbeing = Math.round(state.morale * 0.9 + (100 - state.retentionRisk) * 0.1);

    // Business Readiness
    state.scores.businessReadiness = state.readiness;

    // Earn badges
    this._awardBadges();

    // Total score (weighted avg)
    var weights = { workforcePlanning:15, recruitmentStrategy:15, selectionQuality:15, trainingEffectiveness:15, budgetManagement:15, timeManagement:10, employeeWellbeing:10, businessReadiness:15 };
    var total = 0, totalWeight = 0;
    var keys  = Object.keys(weights);
    for (var j = 0; j < keys.length; j++) {
      total       += (state.scores[keys[j]] || 0) * weights[keys[j]];
      totalWeight += weights[keys[j]];
    }
    state.scores.total = Math.round(total / totalWeight);

    // Persist to localStorage
    this._saveJourney();

    return state.scores;
  },

  _awardBadges: function() {
    var state  = window.HRState;
    var badges = [];

    if (state.totalGap() <= 0) badges.push({ id: 'gap_detective',   icon: '🔎', name: 'Skill Gap Detective',    desc: 'Closed all workforce gaps.' });
    if (state.trainedEmployees.length >= 3) badges.push({ id: 'talent_builder', icon: '🌱', name: 'Internal Talent Builder', desc: 'Developed 3+ existing employees.' });
    if (state.hiredCandidates.length >= 2 && state.recruitmentChannel) badges.push({ id: 'smart_recruiter', icon: '🎯', name: 'Smart Recruiter', desc: 'Built an efficient hiring pipeline.' });
    if (state.scores.budgetManagement >= 80) badges.push({ id: 'budget_guardian', icon: '💰', name: 'Budget Guardian', desc: 'Maintained strong financial discipline.' });
    if (state.morale >= 80) badges.push({ id: 'people_first', icon: '💚', name: 'People-First Manager', desc: 'Kept employee morale high throughout.' });
    if (state.scores.total >= 80) badges.push({ id: 'strategic_hr', icon: '🏆', name: 'Strategic HR Partner', desc: 'Balanced people, time, money, and business.' });
    if (state.scores.selectionQuality >= 85) badges.push({ id: 'talent_spotter', icon: '👁️', name: 'Talent Spotter', desc: 'Excellent candidate selection quality.' });

    state.badges = badges;
  },

  _saveJourney: function() {
    var state = window.HRState;
    try {
      var journey = JSON.parse(localStorage.getItem('novaHRJourney') || '{"runs":[],"scenariosCompleted":[],"bestScore":0,"bestReadiness":0,"totalRuns":0}');
      journey.totalRuns++;
      journey.bestScore    = Math.max(journey.bestScore, state.scores.total || 0);
      journey.bestReadiness= Math.max(journey.bestReadiness, state.readiness || 0);
      if (state.scenarioId && !journey.scenariosCompleted.includes(state.scenarioId)) {
        journey.scenariosCompleted.push(state.scenarioId);
      }
      journey.runs.push({
        scenarioId: state.scenarioId,
        difficulty: state.difficulty,
        score: state.scores.total,
        readiness: state.readiness,
        badges: state.badges.map(function(b) { return b.id; }),
        date: new Date().toLocaleDateString('en-IN')
      });
      if (journey.runs.length > 10) journey.runs = journey.runs.slice(-10);
      localStorage.setItem('novaHRJourney', JSON.stringify(journey));
    } catch(e) { /* localStorage may not be available */ }
  },

  getJourney: function() {
    try {
      return JSON.parse(localStorage.getItem('novaHRJourney') || '{"runs":[],"scenariosCompleted":[],"bestScore":0,"bestReadiness":0,"totalRuns":0}');
    } catch(e) { return { runs:[], scenariosCompleted:[], bestScore:0, bestReadiness:0, totalRuns:0 }; }
  },

  // ── PHASE NAVIGATION ───────────────────────────────────
  advancePhase: function(targetPhase) {
    var state = window.HRState;
    var oldPhase = state.phase;

    if (!state.completedPhases.includes(oldPhase)) {
      state.completedPhases.push(oldPhase);
    }
    state.phase = targetPhase;

    window.HRUI.renderPhase(targetPhase);
    window.HRUI.updateNav();
    window.HRUI.updateKPIs();
    window.HRUI.updateTimeline();
    window.HREvents.checkAndTrigger(targetPhase);

    // Scroll to top of main panel
    var panel = document.getElementById('main-panel');
    if (panel) panel.scrollTop = 0;
  }
};
