/* ═══════════════════════════════════════════════════════════
   STATE.JS — Central simulation state
═══════════════════════════════════════════════════════════ */
window.HRState = {
  // ── SCENARIO & DIFFICULTY ──────────────────
  scenarioId: null,
  scenario: null,
  difficulty: 'manager', // beginner | manager | chro

  // ── TIME & RESOURCES ───────────────────────
  phase: 1,           // 1–9
  month: 1,
  budget: 0,
  deadline: 0,
  timeUsed: 0,        // weeks consumed by actions

  // ── METRICS (0–100) ────────────────────────
  morale: 85,
  productivity: 70,
  readiness: 0,
  retentionRisk: 20,

  // ── WORKFORCE ──────────────────────────────
  employees: [],
  requirements: {},
  available: {},
  gap: {},

  // ── DECISIONS & FLOW ───────────────────────
  strategyChosen: null,       // 'recruit' | 'train' | 'combination'
  recruitmentChannel: null,   // 'network' | 'college' | 'referral' | 'agency'
  interviewMethod: null,      // 'technical' | 'behavioral' | 'structured' | 'panel'
  hiredCandidates: [],        // [{id, name, scenario data}]
  trainedEmployees: [],       // [{empId, programId, before, after, gain}]
  activeTraining: [],         // currently-in-progress programs
  decisions: [],              // log [{phase, action, impact, consequence}]
  completedPhases: [],        // [1,2,3...]

  // ── EVENTS ─────────────────────────────────
  triggeredEvents: [],

  // ── SCORING ────────────────────────────────
  scores: {
    workforcePlanning: 0,
    recruitmentStrategy: 0,
    selectionQuality: 0,
    trainingEffectiveness: 0,
    budgetManagement: 0,
    timeManagement: 0,
    employeeWellbeing: 0,
    businessReadiness: 0
  },
  badges: [],

  // ── RECRUITMENT PIPELINE ───────────────────
  candidatePool: [],          // filtered by channel
  rejectedCandidates: [],
  applications: 0,

  // ── COSTS ──────────────────────────────────
  recruitmentCost: 0,
  trainingCost: 0,
  hiringCost: 0,

  // ──────────────────────────────────────────
  init: function(scenarioId, difficulty) {
    var sc = window.HRScenarios.scenarios.find(function(s) { return s.id === scenarioId; });
    if (!sc) sc = window.HRScenarios.scenarios[0];

    this.scenarioId = sc.id;
    this.scenario   = sc;
    this.difficulty = difficulty || 'manager';

    // Apply difficulty modifiers
    var mods = { beginner: 1.3, manager: 1.0, chro: 0.75 };
    var mod  = mods[this.difficulty];

    this.phase        = 1;
    this.month        = 1;
    this.budget       = Math.round(sc.budget * mod);
    this.deadline     = sc.deadline;
    this.timeUsed     = 0;
    this.morale       = 85;
    this.productivity = 70;
    this.readiness    = 0;
    this.retentionRisk= 20;

    // Clone employees (deep copy)
    this.employees = sc.employees.map(function(e) {
      return Object.assign({}, e);
    });

    // Parse requirements
    this.requirements = {};
    this.available    = {};
    this.gap          = {};
    var roleKeys = Object.keys(sc.requirements);
    for (var i = 0; i < roleKeys.length; i++) {
      var rk = roleKeys[i];
      this.requirements[rk] = sc.requirements[rk].required;
      this.available[rk]    = sc.requirements[rk].available;
      this.gap[rk]          = sc.requirements[rk].required - sc.requirements[rk].available;
    }

    this.strategyChosen    = null;
    this.recruitmentChannel = null;
    this.interviewMethod   = null;
    this.hiredCandidates   = [];
    this.trainedEmployees  = [];
    this.activeTraining    = [];
    this.decisions         = [];
    this.completedPhases   = [];
    this.triggeredEvents   = [];
    this.candidatePool     = [];
    this.rejectedCandidates = [];
    this.applications      = 0;
    this.recruitmentCost   = 0;
    this.trainingCost      = 0;
    this.hiringCost        = 0;
    this.scores            = { workforcePlanning:0, recruitmentStrategy:0, selectionQuality:0, trainingEffectiveness:0, budgetManagement:0, timeManagement:0, employeeWellbeing:0, businessReadiness:0 };
    this.badges            = [];
  },

  // ── HELPERS ────────────────────────────────
  spendBudget: function(amount, category) {
    if (this.budget < amount) return false;
    this.budget -= amount;
    if (category === 'recruit')  this.recruitmentCost += amount;
    if (category === 'training') this.trainingCost    += amount;
    if (category === 'hire')     this.hiringCost      += amount;
    return true;
  },

  totalRequired: function() {
    return Object.values(this.requirements).reduce(function(a, b) { return a + b; }, 0);
  },

  totalAvailable: function() {
    return Object.values(this.available).reduce(function(a, b) { return a + b; }, 0);
  },

  totalGap: function() {
    var g = 0;
    var keys = Object.keys(this.gap);
    for (var i = 0; i < keys.length; i++) {
      if (this.gap[keys[i]] > 0) g += this.gap[keys[i]];
    }
    return g;
  },

  logDecision: function(phase, action, impact, consequence) {
    this.decisions.push({ phase: phase, action: action, impact: impact, consequence: consequence });
  }
};
