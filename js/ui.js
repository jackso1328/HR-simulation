/* ═══════════════════════════════════════════════════════════
   UI.JS — All rendering logic
   Renders each phase, updates KPIs, nav, scorecard.
   Does NOT contain simulation logic.
═══════════════════════════════════════════════════════════ */
window.HRUI = {

  // ── KPI BAR ────────────────────────────────────────────
  updateKPIs: function() {
    var s = window.HRState;
    var fmt = function(n) { return '₹' + n.toLocaleString('en-IN'); };

    var budgetEl    = document.getElementById('kpi-budget-val');
    var timeEl      = document.getElementById('kpi-time-val');
    var moraleEl    = document.getElementById('kpi-morale-val');
    var readinessEl = document.getElementById('kpi-readiness-val');
    var moralePill  = document.getElementById('kpi-morale');
    var budgetPill  = document.getElementById('kpi-budget');

    if (budgetEl)    budgetEl.innerText    = fmt(s.budget);
    if (timeEl)      timeEl.innerText      = (s.deadline - s.timeUsed).toFixed(1) + ' mo left';
    if (moraleEl)    moraleEl.innerText    = s.morale + '%';
    if (readinessEl) readinessEl.innerText = (window.HREngine.calculateReadiness()) + '%';

    // Color coding
    if (moralePill) {
      moralePill.classList.remove('kpi-success', 'kpi-warning', 'kpi-danger');
      if (s.morale >= 80)       moralePill.classList.add('kpi-success');
      else if (s.morale >= 50)  moralePill.classList.add('kpi-warning');
      else                      moralePill.classList.add('kpi-danger');
    }
    if (budgetPill) {
      var pct = s.budget / s.scenario.budget;
      budgetPill.classList.remove('kpi-success', 'kpi-warning', 'kpi-danger');
      if (pct >= 0.4)      budgetPill.classList.add('kpi-success');
      else if (pct >= 0.15) budgetPill.classList.add('kpi-warning');
      else                  budgetPill.classList.add('kpi-danger');
    }
  },

  // ── SCORECARD ──────────────────────────────────────────
  updateScorecard: function() {
    var s    = window.HRState;
    var cont = document.getElementById('scorecard-items');
    if (!cont) return;

    var totalReq   = s.totalRequired();
    var totalAvail = s.totalAvailable();
    var coveragePct = totalReq > 0 ? Math.round((totalAvail / totalReq) * 100) : 0;

    var budgetPct = s.scenario ? Math.round((s.budget / s.scenario.budget) * 100) : 100;

    var items = [
      { label: 'Workforce Coverage', val: coveragePct + '%', pct: coveragePct, color: coveragePct >= 80 ? '#059669' : coveragePct >= 60 ? '#d97706' : '#dc2626' },
      { label: 'Budget Remaining', val: Math.round((s.budget/1000)) + 'K', pct: budgetPct, color: budgetPct >= 40 ? '#059669' : budgetPct >= 15 ? '#d97706' : '#dc2626' },
      { label: 'Team Morale', val: s.morale + '%', pct: s.morale, color: s.morale >= 80 ? '#059669' : s.morale >= 50 ? '#d97706' : '#dc2626' },
      { label: 'Project Readiness', val: s.readiness + '%', pct: s.readiness, color: s.readiness >= 75 ? '#059669' : s.readiness >= 50 ? '#d97706' : '#dc2626' },
      { label: 'Hired', val: s.hiredCandidates.length + ' candidates', pct: Math.min(100, s.hiredCandidates.length * 25), color: '#4f46e5' },
      { label: 'Trained', val: s.trainedEmployees.length + ' employees', pct: Math.min(100, s.trainedEmployees.length * 33), color: '#0d9488' }
    ];

    cont.innerHTML = items.map(function(item) {
      return '<div class="scorecard-item">' +
        '<div class="sc-item-header">' +
          '<span class="sc-item-label">' + item.label + '</span>' +
          '<span class="sc-item-val">' + item.val + '</span>' +
        '</div>' +
        '<div class="sc-bar-track">' +
          '<div class="sc-bar-fill" style="width:' + Math.min(100, item.pct) + '%; background:' + item.color + '"></div>' +
        '</div>' +
      '</div>';
    }).join('');
  },

  // ── NAVIGATION ─────────────────────────────────────────
  updateNav: function() {
    var s    = window.HRState;
    var items = document.querySelectorAll('.nav-item');
    items.forEach(function(el) {
      var phase = parseInt(el.getAttribute('data-phase'));
      el.classList.remove('active', 'completed', 'locked');
      if (phase === s.phase) el.classList.add('active');
      else if (s.completedPhases.includes(phase)) el.classList.add('completed');
      else if (phase > s.phase && !s.completedPhases.includes(phase)) el.classList.add('locked');
    });

    // Update phase label
    var phaseNames = ['', 'Business Demand', 'Workforce Planning', 'Talent Intelligence', 'HR Strategy', 'Recruitment', 'Selection', 'Training & Dev', 'HR Events', 'Final Report'];
    var label = document.getElementById('phase-label');
    if (label) label.innerText = 'Phase ' + s.phase + ' — ' + (phaseNames[s.phase] || '');
  },

  // ── TIMELINE ───────────────────────────────────────────
  updateTimeline: function() {
    var s     = window.HRState;
    var track = document.getElementById('timeline-track');
    if (!track) return;

    var phaseMonths = { 1:0, 2:0.5, 3:0.5, 4:0.5, 5:1, 6:1, 7:1.5, 8:0, 9:0 };
    var cumulativeMonth = 1;
    var timelineData = [];

    for (var ph = 1; ph <= 9; ph++) {
      timelineData.push({
        phase: ph,
        label: 'Month ' + cumulativeMonth,
        tag: ['', 'Demand', 'Planning', 'Talent', 'Strategy', 'Recruit', 'Select', 'Train', 'Events', 'Report'][ph],
        month: cumulativeMonth
      });
      cumulativeMonth = Math.min(s.deadline, Math.ceil(cumulativeMonth + phaseMonths[ph]));
    }

    track.innerHTML = timelineData.map(function(td) {
      var dotClass = 'timeline-dot';
      if (s.completedPhases.includes(td.phase)) dotClass += ' done';
      else if (s.phase === td.phase) dotClass += ' active';
      else if (s.triggeredEvents.length > 0 && td.phase === 8) dotClass += ' event';

      return '<div class="timeline-month">' +
        '<div class="' + dotClass + '">' + (s.completedPhases.includes(td.phase) ? '✓' : td.phase) + '</div>' +
        '<div class="timeline-month-label">' + td.label + '</div>' +
        '<div class="timeline-month-tag">' + td.tag + '</div>' +
      '</div>';
    }).join('');
  },

  // ── OBJECTIVE BAR ──────────────────────────────────────
  setObjective: function(text) {
    var el = document.getElementById('objective-text');
    if (el) el.innerText = text;
  },

  // ── SCENARIO BADGE ─────────────────────────────────────
  updateScenarioBadge: function() {
    var s  = window.HRState;
    var el = document.getElementById('scenario-badge');
    if (el && s.scenario) el.innerText = s.scenario.icon + ' ' + s.scenario.name;
  },

  // ── TOAST ──────────────────────────────────────────────
  toast: function(msg, type, duration) {
    type     = type || '';
    duration = duration || 3000;
    var cont = document.getElementById('toast-container');
    if (!cont) return;
    var div = document.createElement('div');
    div.className = 'toast ' + type;
    div.innerText = msg;
    cont.appendChild(div);
    setTimeout(function() { if (div.parentNode) div.parentNode.removeChild(div); }, duration);
  },

  // ── MODAL ──────────────────────────────────────────────
  showModal: function(html) {
    var cont = document.getElementById('modal-content');
    var ov   = document.getElementById('modal-overlay');
    if (cont) cont.innerHTML = html;
    if (ov)   ov.classList.remove('hidden');
  },
  closeModal: function() {
    var ov = document.getElementById('modal-overlay');
    if (ov) ov.classList.add('hidden');
  },

  // ── SKILL BAR BUILDER ──────────────────────────────────
  skillBar: function(label, value, extraClass) {
    var cls = extraClass || (value >= 80 ? 'high' : value >= 60 ? 'med' : 'low');
    return '<div class="skill-row">' +
      '<span class="skill-name">' + label + '</span>' +
      '<div class="skill-track"><div class="skill-fill ' + cls + '" data-val="' + value + '" style="width:0"></div></div>' +
      '<span class="skill-val">' + value + '</span>' +
    '</div>';
  },

  animateSkillBars: function(container) {
    var fills = (container || document).querySelectorAll('.skill-fill[data-val]');
    setTimeout(function() {
      fills.forEach(function(el) {
        el.style.width = el.getAttribute('data-val') + '%';
      });
    }, 80);
  },

  // ── RENDER DISPATCHER ──────────────────────────────────
  renderPhase: function(phase) {
    var cont = document.getElementById('dynamic-content');
    if (!cont) return;
    cont.innerHTML = '';
    cont.className = '';
    cont.offsetHeight; // force reflow for animation
    cont.className = '';

    var phaseRenderers = {
      1: this.renderPhase1,
      2: this.renderPhase2,
      3: this.renderPhase3,
      4: this.renderPhase4,
      5: this.renderPhase5,
      6: this.renderPhase6,
      7: this.renderPhase7,
      8: this.renderPhase8,
      9: this.renderPhase9
    };

    if (phaseRenderers[phase]) {
      phaseRenderers[phase].call(this, cont);
    }

    this.animateSkillBars(cont);
  },

  // ══════════════════════════════════════════════════════
  // PHASE 1 — Business Demand
  // ══════════════════════════════════════════════════════
  renderPhase1: function(cont) {
    var s  = window.HRState;
    var sc = s.scenario;
    this.setObjective('Review the incoming business demand and understand what NovaTech needs.');

    var roleRows = Object.keys(sc.requirements).map(function(role) {
      var req = sc.requirements[role];
      return '<div class="flex-between" style="padding:10px 0; border-bottom:1px solid var(--border);">' +
        '<span class="font-medium">' + role + '</span>' +
        '<span class="font-bold c-accent">' + req.required + ' needed</span>' +
      '</div>';
    }).join('');

    var diffLabel = { beginner: '🟢 Beginner', manager: '🟡 Manager', chro: '🔴 Chief HR Officer' };

    cont.innerHTML =
      '<div class="phase-intro anim-fadeup">' +
        '<div class="phase-intro-num">Phase 1 — Business Demand</div>' +
        '<div class="phase-intro-title">' + sc.icon + ' ' + sc.name + '</div>' +
        '<div class="phase-intro-desc">' + sc.brief + '</div>' +
        '<div style="display:flex; gap:24px; margin-top:24px; flex-wrap:wrap">' +
          '<div><div style="color:rgba(255,255,255,0.5); font-size:0.75rem; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Client</div><div style="color:white; font-weight:600;">' + sc.client + '</div></div>' +
          '<div><div style="color:rgba(255,255,255,0.5); font-size:0.75rem; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Deadline</div><div style="color:white; font-weight:600;">' + sc.deadline + ' Months</div></div>' +
          '<div><div style="color:rgba(255,255,255,0.5); font-size:0.75rem; font-weight:700; text-transform:uppercase; margin-bottom:4px;">HR Budget</div><div style="color:white; font-weight:600;">₹' + s.budget.toLocaleString('en-IN') + '</div></div>' +
          '<div><div style="color:rgba(255,255,255,0.5); font-size:0.75rem; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Difficulty</div><div style="color:white; font-weight:600;">' + (diffLabel[s.difficulty] || s.difficulty) + '</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="grid-2 anim-fadeup-2">' +
        '<div class="panel">' +
          '<div class="panel-header"><div><div class="panel-title">Workforce Requirements</div><div class="panel-subtitle">Roles needed for the project</div></div></div>' +
          roleRows +
          '<div style="margin-top:16px; padding:12px; background:var(--surface-2); border-radius:var(--radius);">' +
            '<div class="text-sm c-muted">Total positions required</div>' +
            '<div class="text-2xl font-bold c-accent">' + s.totalRequired() + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="panel">' +
          '<div class="panel-header"><div><div class="panel-title">Business Context</div></div></div>' +
          '<p style="color:var(--text-muted); font-size:0.9rem; line-height:1.7; margin-bottom:16px;">' + sc.context + '</p>' +
          '<div class="insight-box">' +
            '<div class="insight-label">📘 HR Concept</div>' +
            '<div class="insight-text">HR Planning begins when a business demand creates a workforce requirement. The HR team must first understand <strong>what skills</strong>, <strong>how many people</strong>, and <strong>by when</strong> before making any hiring or training decisions.</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="text-center anim-fadeup-3" style="padding:16px 0">' +
        '<button class="btn btn-primary btn-lg" onclick="window.HREngine.advancePhase(2)">Analyze the Workforce →</button>' +
      '</div>';
  },

  // ══════════════════════════════════════════════════════
  // PHASE 2 — Workforce Planning & Gap Analysis
  // ══════════════════════════════════════════════════════
  renderPhase2: function(cont) {
    var s   = window.HRState;
    this.setObjective('Compare required vs available workforce and identify the skill gap.');

    var gapCards = Object.keys(s.requirements).map(function(role) {
      var req   = s.requirements[role];
      var avail = s.available[role] || 0;
      var gap   = req - avail;
      var statusClass = gap > 0 ? 'gap-shortage' : gap < 0 ? 'gap-surplus' : 'gap-ok';
      var statusText  = gap > 0 ? 'Shortage: ' + gap : gap < 0 ? 'Surplus: ' + Math.abs(gap) : 'Balanced';
      return '<div class="gap-indicator anim-fadeup">' +
        '<div class="role-name">' + role + '</div>' +
        '<div class="gap-numbers">' +
          '<span style="color:var(--coral)">' + avail + '</span>' +
          '<span class="gap-arrow">→</span>' +
          '<span style="color:var(--violet)">' + req + '</span>' +
        '</div>' +
        '<div class="text-xs c-muted">Available → Required</div>' +
        '<div class="gap-badge ' + statusClass + '">' + statusText + '</div>' +
      '</div>';
    }).join('');

    var analyzed = s.completedPhases.includes(2);

    cont.innerHTML =
      '<div class="phase-intro anim-fadeup" style="background:linear-gradient(135deg,#1e3a5f,#2d3f63)">' +
        '<div class="phase-intro-num">Phase 2 — Workforce Planning</div>' +
        '<div class="phase-intro-title">Gap Analysis</div>' +
        '<div class="phase-intro-desc">Compare available workforce capacity against project requirements to identify shortages and surpluses.</div>' +
      '</div>' +

      '<div class="grid-3 anim-fadeup-2">' + gapCards + '</div>' +

      '<div class="panel anim-fadeup-3">' +
        '<div class="panel-header"><div class="panel-title">Workforce Gap Summary</div></div>' +
        '<div class="grid-4">' +
          '<div class="kpi-card kpi-card-accent">' +
            '<div class="kpi-card-label">Total Required</div>' +
            '<div class="kpi-card-val c-accent">' + s.totalRequired() + '</div>' +
          '</div>' +
          '<div class="kpi-card kpi-card-danger">' +
            '<div class="kpi-card-label">Currently Available</div>' +
            '<div class="kpi-card-val c-danger">' + s.totalAvailable() + '</div>' +
          '</div>' +
          '<div class="kpi-card kpi-card-warning">' +
            '<div class="kpi-card-label">Critical Gap</div>' +
            '<div class="kpi-card-val c-warning">' + s.totalGap() + '</div>' +
          '</div>' +
          '<div class="kpi-card kpi-card-info">' +
            '<div class="kpi-card-label">Time to Fill</div>' +
            '<div class="kpi-card-val c-info">' + s.deadline + ' mo</div>' +
          '</div>' +
        '</div>' +

        '<div class="insight-box mt-2">' +
          '<div class="insight-label">📘 HR Planning Concept</div>' +
          '<div class="insight-text">' +
            'Human Resource Planning (HRP) is the process of determining the number and types of people needed by an organization, then comparing that with availability. ' +
            'The <strong>workforce gap</strong> tells HR whether to recruit, train, or restructure to meet business needs.' +
          '</div>' +
        '</div>' +

        (analyzed ? '' :
          '<div class="text-center mt-3">' +
            '<button class="btn btn-primary btn-lg" onclick="window.HREngine.analyzeWorkforce()">Run Gap Analysis →</button>' +
          '</div>'
        ) +
        (analyzed ?
          '<div class="text-center mt-3">' +
            '<button class="btn btn-navy" onclick="window.HRUI.renderPhase(3)">Inspect Talent Intelligence →</button>' +
          '</div>'
        : '') +
      '</div>';
  },

  // ══════════════════════════════════════════════════════
  // PHASE 3 — Talent Intelligence (Employee Profiles)
  // ══════════════════════════════════════════════════════
  renderPhase3: function(cont) {
    var s    = window.HRState;
    this.setObjective('Inspect your existing team to discover skills, training readiness, and promotion potential.');

    var empCards = s.employees.map(function(emp) {
      var riskColor = { LOW:'c-success', MEDIUM:'c-warning', HIGH:'c-danger' }[emp.retentionRisk] || 'c-muted';
      return '<div class="card card-interactive anim-fadeup" onclick="window.HRUI.showEmployeeProfile(\'' + emp.id + '\')">' +
        '<div class="flex-between mb-1">' +
          '<div>' +
            '<div class="font-bold">' + emp.name + '</div>' +
            '<div class="text-sm c-muted">' + emp.role + ' · ' + emp.experience + ' yrs exp</div>' +
          '</div>' +
          '<div class="text-right">' +
            '<div class="text-xs ' + riskColor + ' font-semibold">Retention Risk: ' + emp.retentionRisk + '</div>' +
            '<div class="text-xs c-muted">Potential: ' + emp.promotionPotential + '</div>' +
          '</div>' +
        '</div>' +
        window.HRUI.skillBar('Python', emp.python) +
        window.HRUI.skillBar('ML', emp.ml) +
        window.HRUI.skillBar('Cloud', emp.cloud) +
        window.HRUI.skillBar('AI', emp.ai) +
        '<div class="mt-1 text-xs c-muted">Click to open full profile & training options</div>' +
      '</div>';
    }).join('');

    cont.innerHTML =
      '<div class="phase-intro anim-fadeup" style="background:linear-gradient(135deg,#134e4a,#0d9488)">' +
        '<div class="phase-intro-num">Phase 3 — Talent Intelligence</div>' +
        '<div class="phase-intro-title">Your Team</div>' +
        '<div class="phase-intro-desc">Before deciding how to close the workforce gap, investigate your existing employees. Look for hidden talent, training readiness, and skills that can be developed.</div>' +
      '</div>' +

      '<div class="grid-2">' + empCards + '</div>' +

      '<div class="insight-box anim-fadeup-4">' +
        '<div class="insight-label">📘 HR Intelligence</div>' +
        '<div class="insight-text">Workforce intelligence involves understanding the <strong>skills, potential, and risks</strong> within your existing team before making external hiring decisions. Internal development is often more cost-effective and improves retention.</div>' +
      '</div>' +

      '<div class="text-center mt-2">' +
        '<button class="btn btn-primary btn-lg" onclick="window.HREngine.advancePhase(4)">Choose HR Strategy →</button>' +
      '</div>';

    this.animateSkillBars(cont);
  },

  // ══════════════════════════════════════════════════════
  // PHASE 4 — HR Strategy Choice
  // ══════════════════════════════════════════════════════
  renderPhase4: function(cont) {
    var s  = window.HRState;
    var sc = s.scenario;
    this.setObjective('Choose your primary HR strategy: Recruit, Train, or a Combination.');

    var strategies = [
      {
        id: 'recruit',
        icon: '🌐',
        name: 'Recruit Externally',
        desc: 'Hire external candidates to fill the workforce gap quickly.',
        pros: ['Fills gaps faster', 'Brings fresh external expertise', 'Scalable for large gaps'],
        cons: ['Higher cost per hire', 'Cultural integration risk', 'Onboarding time needed', 'Retention risk if not engaged'],
        timeImpact: 'Fast (2–4 weeks per hire)',
        costImpact: 'High — ₹' + (sc.budget * 0.3 / 100000).toFixed(1) + 'L+ estimated',
        moraleImpact: 'Neutral — may affect existing team'
      },
      {
        id: 'train',
        icon: '🎓',
        name: 'Train & Develop',
        desc: 'Invest in your existing employees by upskilling them to fill the skill gap.',
        pros: ['Lower total cost', 'Improves morale & loyalty', 'Preserves domain knowledge', 'Long-term capability building'],
        cons: ['Takes more time', 'May not fully close large gaps', 'Effectiveness varies by employee', 'Productivity dips during training'],
        timeImpact: 'Slow (3–8 weeks per program)',
        costImpact: 'Low — ₹20K–₹50K per program',
        moraleImpact: 'Positive +5–8%'
      },
      {
        id: 'combination',
        icon: '⚖️',
        name: 'Combination Strategy',
        desc: 'Train existing employees for some roles, and recruit externally for others.',
        pros: ['Balanced cost & speed', 'Flexible — use best approach per role', 'Reduces risk', 'Sustainable long-term approach'],
        cons: ['Requires careful coordination', 'Higher management complexity', 'Must prioritize which gaps to fill each way'],
        timeImpact: 'Moderate',
        costImpact: 'Moderate — optimized per role',
        moraleImpact: 'Positive +3%'
      }
    ];

    var cards = strategies.map(function(st) {
      var isSelected = s.strategyChosen === st.id;
      return '<div class="card card-interactive ' + (isSelected ? 'card-selected' : '') + '" onclick="window.HREngine.chooseStrategy(\'' + st.id + '\')">' +
        '<div style="font-size:2rem; margin-bottom:12px">' + st.icon + '</div>' +
        '<div class="font-bold text-lg mb-1">' + st.name + '</div>' +
        '<p class="text-sm c-muted mb-2">' + st.desc + '</p>' +
        '<div style="display:flex; flex-direction:column; gap:4px; margin-bottom:12px">' +
          st.pros.map(function(p) { return '<div class="text-xs c-success">✓ ' + p + '</div>'; }).join('') +
          st.cons.map(function(c) { return '<div class="text-xs c-danger">✗ ' + c + '</div>'; }).join('') +
        '</div>' +
        '<div style="background:var(--surface-2); border-radius:var(--radius-sm); padding:10px; display:flex; flex-direction:column; gap:4px;">' +
          '<div class="text-xs"><span class="c-muted">⏱ Time: </span><span class="font-semibold">' + st.timeImpact + '</span></div>' +
          '<div class="text-xs"><span class="c-muted">💰 Cost: </span><span class="font-semibold">' + st.costImpact + '</span></div>' +
          '<div class="text-xs"><span class="c-muted">💚 Morale: </span><span class="font-semibold">' + st.moraleImpact + '</span></div>' +
        '</div>' +
        (isSelected ? '<div class="text-center mt-2 font-bold c-success">✓ Selected</div>' : '') +
      '</div>';
    }).join('');

    cont.innerHTML =
      '<div class="phase-intro anim-fadeup" style="background:linear-gradient(135deg,#3730a3,#4f46e5)">' +
        '<div class="phase-intro-num">Phase 4 — HR Strategy</div>' +
        '<div class="phase-intro-title">How Will You Close the Gap?</div>' +
        '<div class="phase-intro-desc">Every strategy creates different trade-offs. There is no single correct answer — the best strategy depends on your budget, deadline, and team composition.</div>' +
      '</div>' +

      '<div class="grid-3 anim-fadeup-2">' + cards + '</div>' +

      '<div class="insight-box warn-insight anim-fadeup-3">' +
        '<div class="insight-label">⚡ Optimal Strategy Hint</div>' +
        '<div class="insight-text"><strong>For this scenario:</strong> ' + (sc.optimalStrategies ? (sc.optimalStrategies.combination || '') : '') + '</div>' +
      '</div>';
  },

  // ══════════════════════════════════════════════════════
  // PHASE 5 — Recruitment Channel
  // ══════════════════════════════════════════════════════
  renderPhase5: function(cont) {
    var s = window.HRState;
    this.setObjective('Choose a recruitment channel and post the job to attract candidates.');

    var channels = [
      { id: 'network', icon: '💼', name: 'Professional Network', desc: 'LinkedIn, Naukri, and professional job boards. Widest reach with experienced professionals.', cost: 20000, weeks: 2, reach: '1,000–1,500', quality: 'High', pros: ['Large pool', 'Experienced candidates', 'Brand visibility'], cons: ['High competition', 'Moderate cost', 'May need strong JD'] },
      { id: 'college', icon: '🎓', name: 'Campus Recruitment', desc: 'Visit colleges and hire fresh graduates. High volume, high potential, low cost.', cost: 12000, weeks: 3, reach: '300–500', quality: 'Medium (High potential)', pros: ['Low cost', 'High enthusiasm', 'Moldable to culture'], cons: ['Less experience', 'Needs mentoring investment', 'Slower ramp-up'] },
      { id: 'referral', icon: '🤝', name: 'Employee Referral', desc: 'Trust your team to recommend candidates. High culture fit, lower cost.', cost: 8000, weeks: 1, reach: '80–150', quality: 'High culture fit', pros: ['Fastest pipeline', 'Low cost', 'Pre-screened by team'], cons: ['Small pool', 'Limited diversity', 'Referral bias possible'] },
      { id: 'agency', icon: '🏢', name: 'Recruitment Agency', desc: 'Specialized recruiters who find niche talent. Expensive but fast for rare skills.', cost: 45000, weeks: 1, reach: '20–50', quality: 'Very High', pros: ['Specialized talent', 'Fast turnaround', 'Pre-screened'], cons: ['Highest cost', 'Lower culture fit', 'Retention risk'] }
    ];

    var selected  = s.recruitmentChannel;
    var cards = channels.map(function(ch) {
      var affordable = s.budget >= ch.cost;
      return '<div class="channel-card ' + (selected === ch.id ? 'selected' : '') + (affordable ? '' : ' card-danger') + '" onclick="' + (affordable ? 'window.HREngine.selectChannel(\'' + ch.id + '\')' : 'window.HRUI.toast(\'Insufficient budget\', \'error\')') + '">' +
        '<div class="channel-card-icon">' + ch.icon + '</div>' +
        '<div class="channel-card-name">' + ch.name + '</div>' +
        '<div class="channel-card-desc">' + ch.desc + '</div>' +
        '<div class="channel-stats">' +
          '<div class="ch-stat"><div class="ch-stat-lbl">Cost</div><div class="ch-stat-val">₹' + (ch.cost/1000).toFixed(0) + 'K</div></div>' +
          '<div class="ch-stat"><div class="ch-stat-lbl">Time</div><div class="ch-stat-val">' + ch.weeks + ' wks</div></div>' +
          '<div class="ch-stat"><div class="ch-stat-lbl">Reach</div><div class="ch-stat-val" style="font-size:0.78rem">' + ch.reach + '</div></div>' +
          '<div class="ch-stat"><div class="ch-stat-lbl">Quality</div><div class="ch-stat-val" style="font-size:0.78rem">' + ch.quality + '</div></div>' +
        '</div>' +
        '<div class="channel-pros-cons mt-1">' +
          ch.pros.map(function(p) { return '<div class="pro">✓ ' + p + '</div>'; }).join('') +
          ch.cons.map(function(c) { return '<div class="con">✗ ' + c + '</div>'; }).join('') +
        '</div>' +
        (selected === ch.id ? '<div class="text-center mt-2 font-bold c-success" style="font-size:0.82rem">✓ Channel Selected — ' + s.applications + ' applications received</div>' : '') +
        (!affordable ? '<div class="text-center mt-2 c-danger text-xs font-bold">Insufficient budget</div>' : '') +
      '</div>';
    }).join('');

    cont.innerHTML =
      '<div class="phase-intro anim-fadeup" style="background:linear-gradient(135deg,#065f46,#059669)">' +
        '<div class="phase-intro-num">Phase 5 — Recruitment</div>' +
        '<div class="phase-intro-title">Choose Your Channel</div>' +
        '<div class="phase-intro-desc">Different recruitment channels reach different talent pools. Each has unique trade-offs in cost, speed, candidate quality, and culture fit.</div>' +
      '</div>' +

      '<div class="grid-2 anim-fadeup-2">' + cards + '</div>' +

      '<div class="insight-box anim-fadeup-3">' +
        '<div class="insight-label">📘 Recruitment Theory</div>' +
        '<div class="insight-text">Recruitment is the process of identifying and attracting potential candidates. The choice of channel affects the <strong>quantity, quality, cost, and diversity</strong> of the candidate pool. Poor channel selection can lead to either too few candidates or high screening effort.</div>' +
      '</div>';
  },

  // ══════════════════════════════════════════════════════
  // PHASE 6 — Candidate Selection
  // ══════════════════════════════════════════════════════
  renderPhase6: function(cont) {
    var s = window.HRState;
    this.setObjective('Review candidates and select the best fit for your open positions.');

    if (!s.recruitmentChannel || s.candidatePool.length === 0) {
      cont.innerHTML = '<div class="panel"><div class="panel-title">No candidates yet</div><p class="c-muted">Go back to Recruitment and select a channel first.</p><button class="btn btn-primary mt-2" onclick="window.HREngine.advancePhase(5)">← Go to Recruitment</button></div>';
      return;
    }

    // Interview method selection if not chosen
    var interviewSection = '';
    if (!s.interviewMethod) {
      var methods = [
        { id: 'technical', icon: '💻', label: 'Technical Assessment', desc: 'Coding tests, problem-solving. Best for technical roles. High accuracy (90%).', time: '1 week' },
        { id: 'behavioral', icon: '🧠', label: 'Behavioral Interview', desc: 'Situation-based questions. Good for culture fit. Moderate accuracy (75%).', time: '1 week' },
        { id: 'structured', icon: '📋', label: 'Structured Interview', desc: 'Standardized questions. Reduces bias. Good balance (85%).', time: '1.5 weeks' },
        { id: 'panel', icon: '👥', label: 'Panel Interview', desc: 'Multiple interviewers. Highest accuracy (92%) but time-heavy.', time: '2 weeks' }
      ];
      interviewSection = '<div class="panel anim-fadeup">' +
        '<div class="panel-header"><div class="panel-title">🎙️ Choose Interview Method</div><div class="panel-subtitle">You have ' + s.candidatePool.length + ' candidates and limited time. Which method will you use?</div></div>' +
        '<div class="grid-2">' +
          methods.map(function(m) {
            return '<div class="card card-interactive" onclick="window.HREngine.selectInterviewMethod(\'' + m.id + '\'); window.HRUI.renderPhase(6);">' +
              '<div style="font-size:1.5rem">' + m.icon + '</div>' +
              '<div class="font-bold mt-1">' + m.label + '</div>' +
              '<div class="text-sm c-muted mt-1">' + m.desc + '</div>' +
              '<div class="text-xs c-warning mt-1">⏱ ' + m.time + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
    }

    // Funnel visualization
    var channel = s.recruitmentChannel;
    var funnelData = {
      network:  { short: Math.round(s.applications * 0.004), assessed: 12, interviewed: 6 },
      college:  { short: Math.round(s.applications * 0.02),  assessed: 15, interviewed: 8 },
      referral: { short: Math.round(s.applications * 0.05),  assessed: 8,  interviewed: 5 },
      agency:   { short: s.applications, assessed: Math.round(s.applications * 0.8), interviewed: Math.round(s.applications * 0.6) }
    };
    var fd = funnelData[channel] || { short: 10, assessed: 6, interviewed: s.candidatePool.length };

    var funnelHtml = '<div class="funnel-chart">' +
      '<div class="funnel-row"><span class="funnel-row-label">Applications</span><div class="funnel-bar-track"><div class="funnel-bar-fill" style="width:100%">' + s.applications + '</div></div><span class="funnel-row-count">' + s.applications + '</span></div>' +
      '<div class="funnel-row"><span class="funnel-row-label">Shortlisted</span><div class="funnel-bar-track"><div class="funnel-bar-fill" style="width:' + Math.min(100, Math.round(fd.short/s.applications*100)) + '%; background:var(--teal)">' + fd.short + '</div></div><span class="funnel-row-count">' + fd.short + '</span></div>' +
      '<div class="funnel-row"><span class="funnel-row-label">Assessed</span><div class="funnel-bar-track"><div class="funnel-bar-fill" style="width:' + Math.min(100, Math.round(fd.assessed/s.applications*100)) + '%; background:var(--amber)">' + fd.assessed + '</div></div><span class="funnel-row-count">' + fd.assessed + '</span></div>' +
      '<div class="funnel-row"><span class="funnel-row-label">Interviewed</span><div class="funnel-bar-track"><div class="funnel-bar-fill" style="width:' + Math.min(100, Math.round(fd.interviewed/s.applications*100)) + '%; background:var(--violet)">' + fd.interviewed + '</div></div><span class="funnel-row-count">' + fd.interviewed + '</span></div>' +
      '<div class="funnel-row"><span class="funnel-row-label">Final Pool</span><div class="funnel-bar-track"><div class="funnel-bar-fill" style="width:' + Math.min(100, Math.round(s.candidatePool.length/s.applications*100)) + '%; background:var(--emerald)">' + s.candidatePool.length + '</div></div><span class="funnel-row-count">' + s.candidatePool.length + '</span></div>' +
    '</div>';

    // Candidate cards
    var candCards = s.candidatePool.map(function(cand) {
      var isHired = s.hiredCandidates.find(function(h) { return h.id === cand.id; });
      var growthColor = { 'VERY HIGH':'#059669', 'HIGH':'#0d9488', 'MEDIUM':'#d97706', 'LOW':'#dc2626' }[cand.growthPotential] || '#94a3b8';
      var riskColor   = { 'LOW':'c-success', 'MEDIUM':'c-warning', 'HIGH':'c-danger', 'VERY HIGH':'c-danger' }[cand.risk] || 'c-muted';
      var badges = '';
      if (cand.assessment >= 88) badges += '<span class="cand-badge badge-high-skill">High Skill</span>';
      if (cand.cultureFit >= 85)  badges += '<span class="cand-badge badge-high-fit">Culture Fit</span>';
      if (cand.growthPotential === 'VERY HIGH') badges += '<span class="cand-badge badge-high-grow">High Growth</span>';
      if (cand.experience >= 5) badges += '<span class="cand-badge badge-high-exp">Senior</span>';
      if (cand.expectedSalary >= 180000) badges += '<span class="cand-badge badge-costly">High Cost</span>';
      if (cand.risk === 'HIGH' || cand.risk === 'VERY HIGH') badges += '<span class="cand-badge badge-risk">Retention Risk</span>';

      return '<div class="candidate-card ' + (isHired ? 'hired' : '') + '" onclick="window.HRUI.showCandidateProfile(\'' + cand.id + '\')">' +
        (isHired ? '<div class="hired-overlay">✓ HIRED</div>' : '') +
        '<div class="cand-name">' + cand.name + '</div>' +
        '<div class="cand-meta">Exp: ' + cand.experience + ' yrs · Assessment: <strong>' + cand.assessment + '/100</strong> · Salary: ₹' + (cand.expectedSalary/1000).toFixed(0) + 'K/mo</div>' +
        window.HRUI.skillBar('Python', cand.python) +
        window.HRUI.skillBar('ML', cand.ml) +
        window.HRUI.skillBar('Cloud', cand.cloud) +
        window.HRUI.skillBar('AI', cand.ai) +
        '<div class="cand-badges">' + badges + '</div>' +
        '<div class="text-xs mt-1" style="color:' + growthColor + '">Growth: ' + cand.growthPotential + '</div>' +
        '<div class="text-xs ' + riskColor + '">Retention Risk: ' + cand.risk + ' · Notice: ' + (cand.noticePeriod === 0 ? 'Immediate' : cand.noticePeriod + ' days') + '</div>' +
      '</div>';
    }).join('');

    cont.innerHTML =
      interviewSection +
      '<div class="panel anim-fadeup">' +
        '<div class="panel-header"><div><div class="panel-title">📊 Recruitment Funnel</div><div class="panel-subtitle">' + s.applications.toLocaleString('en-IN') + ' total applications via ' + channel.toUpperCase() + '</div></div>' +
          (s.interviewMethod ? '<div class="panel-badge badge-teal">Method: ' + window.HREngine.interviewConfig[s.interviewMethod].label + '</div>' : '') +
        '</div>' +
        funnelHtml +
      '</div>' +

      '<div class="panel anim-fadeup-2">' +
        '<div class="panel-header">' +
          '<div><div class="panel-title">👥 Final Candidate Pool</div><div class="panel-subtitle">Hired: ' + s.hiredCandidates.length + ' / ' + s.candidatePool.length + ' available. Click a candidate to see full profile and hire.</div></div>' +
        '</div>' +
        '<div class="grid-2">' + candCards + '</div>' +
      '</div>' +

      '<div class="insight-box anim-fadeup-3">' +
        '<div class="insight-label">📘 Selection Theory</div>' +
        '<div class="insight-text">Effective candidate selection balances <strong>technical skill, culture fit, growth potential, cost, and risk</strong>. A high-skill candidate with low culture fit may underperform. A fresh graduate with high potential may outperform an expensive senior hire in the long run.</div>' +
      '</div>' +

      (s.hiredCandidates.length > 0 ?
        '<div class="text-center mt-2"><button class="btn btn-navy btn-lg" onclick="window.HREngine.advancePhase(7)">Proceed to Training & Development →</button></div>'
      : '');

    this.animateSkillBars(cont);
  },

  // ══════════════════════════════════════════════════════
  // PHASE 7 — Training & Development
  // ══════════════════════════════════════════════════════
  renderPhase7: function(cont) {
    var s = window.HRState;
    this.setObjective('Design training programs for your existing employees to develop their skills.');

    var programs = window.HRScenarios.trainingPrograms;

    var empSection = s.employees.map(function(emp) {
      var trained = s.trainedEmployees.filter(function(t) { return t.empId === emp.id; });
      var trainedNames = trained.map(function(t) { return t.programId; });

      var eligiblePrograms = programs.filter(function(p) {
        return !trainedNames.includes(p.id) && (!p.eligibility || p.eligibility(emp));
      });

      var programBtns = eligiblePrograms.map(function(p) {
        var canAfford = s.budget >= p.cost;
        return '<button class="btn btn-sm ' + (canAfford ? 'btn-teal' : 'btn-ghost') + '" ' +
          'onclick="window.HRUI.confirmTraining(\'' + emp.id + '\',\'' + p.id + '\')" ' +
          'title="Cost: ₹' + p.cost.toLocaleString('en-IN') + ' | ' + p.weeks + ' weeks">' +
          p.icon + ' ' + p.name +
        '</button>';
      }).join('');

      var trainedBadges = trained.map(function(t) {
        return '<div class="text-xs c-success font-semibold">' + t.icon + ' ' + t.programName + ': ' + t.skill + ' ' + t.before + ' → ' + t.after + ' (+' + t.gain + ')</div>';
      }).join('');

      return '<div class="card anim-fadeup">' +
        '<div class="flex-between mb-1">' +
          '<div><div class="font-bold">' + emp.name + '</div><div class="text-sm c-muted">' + emp.role + ' · LP: ' + Math.round((emp.learningPotential || 0.7) * 100) + '% potential</div></div>' +
        '</div>' +
        window.HRUI.skillBar('Python', emp.python) +
        window.HRUI.skillBar('ML', emp.ml) +
        window.HRUI.skillBar('Cloud', emp.cloud) +
        window.HRUI.skillBar('AI', emp.ai) +
        (trainedBadges ? '<div style="margin:8px 0;">' + trainedBadges + '</div>' : '') +
        (eligiblePrograms.length > 0 ? '<div class="btn-group mt-2">' + programBtns + '</div>' : '<div class="text-xs c-muted mt-2">No eligible programs available</div>') +
      '</div>';
    }).join('');

    var programCards = programs.map(function(p) {
      return '<div class="training-card">' +
        '<div class="training-card-icon">' + p.icon + '</div>' +
        '<div class="training-card-name">' + p.name + '</div>' +
        '<div class="text-sm c-muted">' + p.desc + '</div>' +
        '<div class="training-card-meta">' +
          '<div class="training-meta-row"><span class="meta-lbl">Cost</span><span class="meta-val">₹' + (p.cost/1000).toFixed(0) + 'K</span></div>' +
          '<div class="training-meta-row"><span class="meta-lbl">Duration</span><span class="meta-val">' + p.weeks + ' weeks</span></div>' +
          '<div class="training-meta-row"><span class="meta-lbl">Morale Boost</span><span class="meta-val c-success">+' + p.moraleBoost + '%</span></div>' +
        '</div>' +
        '<div class="training-card-gain">Expected gain: +' + p.skillGain.min + ' to +' + p.skillGain.max + ' in ' + p.skillGain.skill.toUpperCase() + '</div>' +
      '</div>';
    }).join('');

    cont.innerHTML =
      '<div class="phase-intro anim-fadeup" style="background:linear-gradient(135deg,#1e3a5f,#0d9488)">' +
        '<div class="phase-intro-num">Phase 7 — Training & Development</div>' +
        '<div class="phase-intro-title">Develop Your Team</div>' +
        '<div class="phase-intro-desc"><strong>Training</strong> improves current job skills. <strong>Development</strong> prepares employees for future responsibilities. Both are essential for sustainable workforce capability.</div>' +
      '</div>' +

      '<div class="grid-2">' +
        '<div><div class="section-title">Available Training Programs</div><div style="display:flex; flex-direction:column; gap:12px;">' + programCards + '</div></div>' +
        '<div><div class="section-title">Your Team</div><div style="display:flex; flex-direction:column; gap:12px;">' + empSection + '</div></div>' +
      '</div>' +

      '<div class="insight-box success-insight anim-fadeup-3">' +
        '<div class="insight-label">📘 Training vs Development</div>' +
        '<div class="insight-text"><strong>Training</strong> focuses on current role performance (e.g., cloud skills for an existing engineer). <strong>Development</strong> focuses on future potential (e.g., leadership for a future team lead). Both must be measured by outcomes, not just completion.</div>' +
      '</div>' +

      '<div class="text-center mt-2">' +
        '<button class="btn btn-primary btn-lg" onclick="window.HREngine.advancePhase(8)">Evaluate Training & Check Events →</button>' +
      '</div>';

    this.animateSkillBars(cont);
  },

  // ══════════════════════════════════════════════════════
  // PHASE 8 — Training Evaluation (Kirkpatrick)
  // ══════════════════════════════════════════════════════
  renderPhase8: function(cont) {
    var s = window.HRState;
    this.setObjective('Evaluate the effectiveness of your training using the Kirkpatrick model.');

    var trainedSection = '';
    if (s.trainedEmployees.length > 0) {
      trainedSection = s.trainedEmployees.map(function(t) {
        var improvementPct = Math.round((t.gain / t.before) * 100);
        var levelScores = {
          level1: Math.round(70 + Math.random() * 25),
          level2: t.after,
          level3: Math.round(t.gain * 3.5),
          level4: Math.min(100, Math.round(t.gain * 2.8))
        };
        return '<div class="card anim-fadeup" style="margin-bottom:16px">' +
          '<div class="flex-between mb-2">' +
            '<div><div class="font-bold">' + t.empName + '</div><div class="text-sm c-muted">' + t.icon + ' ' + t.programName + '</div></div>' +
            '<div class="text-right"><div class="text-xs c-muted">Skill: ' + t.skill.toUpperCase() + '</div><div class="font-bold c-success">' + t.before + ' → ' + t.after + ' (+' + t.gain + ')</div></div>' +
          '</div>' +
          '<div class="kirkpatrick-grid">' +
            '<div class="kp-level achieved">' +
              '<div class="kp-num">Level 1</div>' +
              '<div class="kp-label">Reaction</div>' +
              '<div class="kp-desc">How did the learner feel?</div>' +
              '<div class="kp-score c-success">' + levelScores.level1 + '%</div>' +
            '</div>' +
            '<div class="kp-level achieved">' +
              '<div class="kp-num">Level 2</div>' +
              '<div class="kp-label">Learning</div>' +
              '<div class="kp-desc">New skill level achieved</div>' +
              '<div class="kp-score c-success">' + levelScores.level2 + '/100</div>' +
            '</div>' +
            '<div class="kp-level ' + (t.gain >= 10 ? 'achieved' : 'active') + '">' +
              '<div class="kp-num">Level 3</div>' +
              '<div class="kp-label">Behavior</div>' +
              '<div class="kp-desc">On-the-job performance change</div>' +
              '<div class="kp-score ' + (t.gain >= 10 ? 'c-success' : 'c-warning') + '">+' + levelScores.level3 + '%</div>' +
            '</div>' +
            '<div class="kp-level ' + (t.gain >= 15 ? 'achieved' : 'active') + '">' +
              '<div class="kp-num">Level 4</div>' +
              '<div class="kp-label">Results</div>' +
              '<div class="kp-desc">Business impact</div>' +
              '<div class="kp-score ' + (t.gain >= 15 ? 'c-success' : 'c-warning') + '">+' + levelScores.level4 + '% readiness</div>' +
            '</div>' +
          '</div>' +
          '<div class="insight-box success-insight mt-2">' +
            '<div class="insight-label">Training Verdict</div>' +
            '<div class="insight-text">' +
              (t.gain >= 15 ? '✅ <strong>Highly Effective.</strong> The training produced meaningful, measurable skill improvement that will directly impact project performance.' :
               t.gain >= 8  ? '⚠️ <strong>Moderately Effective.</strong> The training produced a solid improvement but fell slightly short of the maximum potential.' :
               '❌ <strong>Below Expectation.</strong> The employee\'s learning potential limited the training outcome. Consider a different program or approach.') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    } else {
      trainedSection = '<div class="panel"><p class="c-muted">No training programs were completed in this simulation.</p></div>';
    }

    cont.innerHTML =
      '<div class="phase-intro anim-fadeup" style="background:linear-gradient(135deg,#7c3aed,#4f46e5)">' +
        '<div class="phase-intro-num">Phase 8 — Training Evaluation</div>' +
        '<div class="phase-intro-title">Did Your Training Work?</div>' +
        '<div class="phase-intro-desc">The Kirkpatrick Model measures training effectiveness at 4 levels: Reaction → Learning → Behavior → Results. Completion alone does not prove effectiveness.</div>' +
      '</div>' +

      trainedSection +

      '<div class="insight-box anim-fadeup">' +
        '<div class="insight-label">📘 Kirkpatrick Model</div>' +
        '<div class="insight-text">Most organizations only measure Level 1 (satisfaction surveys) and Level 2 (test scores). True training ROI requires measuring <strong>Level 3 (behavior change on the job)</strong> and <strong>Level 4 (business impact)</strong>.</div>' +
      '</div>' +

      '<div class="text-center mt-2">' +
        '<button class="btn btn-primary btn-lg" onclick="window.HREngine.advancePhase(9)">View Final HR Report →</button>' +
      '</div>';
  },

  // ══════════════════════════════════════════════════════
  // PHASE 9 — Final Report
  // ══════════════════════════════════════════════════════
  renderPhase9: function(cont) {
    var s      = window.HRState;
    var scores = window.HREngine.calculateFinalScores();
    this.setObjective('Review your HR performance across all dimensions.');

    var totalColor = scores.total >= 80 ? 'c-success' : scores.total >= 60 ? 'c-warning' : 'c-danger';

    var dimConfigs = [
      { key: 'workforcePlanning',     label: 'Workforce Planning',     color: '#4f46e5' },
      { key: 'recruitmentStrategy',   label: 'Recruitment Strategy',   color: '#0d9488' },
      { key: 'selectionQuality',      label: 'Selection Quality',      color: '#059669' },
      { key: 'trainingEffectiveness', label: 'Training Effectiveness', color: '#7c3aed' },
      { key: 'budgetManagement',      label: 'Budget Management',      color: '#d97706' },
      { key: 'timeManagement',        label: 'Time Management',        color: '#dc2626' },
      { key: 'employeeWellbeing',     label: 'Employee Wellbeing',     color: '#06b6d4' },
      { key: 'businessReadiness',     label: 'Business Readiness',     color: '#1e3a5f' }
    ];

    var scoreDims = dimConfigs.map(function(d) {
      var val = scores[d.key] || 0;
      return '<div class="score-dimension">' +
        '<div class="score-dim-header">' +
          '<span class="score-dim-label">' + d.label + '</span>' +
          '<span class="score-dim-val" style="color:' + d.color + '">' + val + '</span>' +
        '</div>' +
        '<div class="score-dim-bar"><div class="score-dim-fill" style="width:' + val + '%; background:' + d.color + '"></div></div>' +
      '</div>';
    }).join('');

    var badgeHtml = s.badges.map(function(b) {
      return '<div class="achievement-badge earned">' +
        '<div class="badge-icon">' + b.icon + '</div>' +
        '<div class="badge-name">' + b.name + '</div>' +
      '</div>';
    }).join('') || '<p class="c-muted text-sm">No badges earned this run. Try a different strategy!</p>';

    var decisionRows = s.decisions.map(function(d, i) {
      return '<div class="decision-card anim-fadeup">' +
        '<div class="decision-num">' + (i + 1) + '</div>' +
        '<div class="decision-body">' +
          '<div class="decision-title">' + d.phase + ': ' + d.action + '</div>' +
          '<div class="decision-impact">' +
            'Impact: <span class="font-semibold">' + d.impact + '</span>' +
            (d.consequence ? '<br>Outcome: <span class="c-muted">' + d.consequence + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    cont.innerHTML =
      '<div class="phase-intro anim-fadeup">' +
        '<div class="phase-intro-num">Phase 9 — Final HR Report</div>' +
        '<div class="phase-intro-title">HR Performance Review</div>' +
        '<div class="phase-intro-desc">Review your HR performance across all dimensions. This is your executive BI report for ' + s.scenario.name + '.</div>' +
      '</div>' +

      '<div class="panel anim-fadeup-2 text-center">' +
        '<div class="section-title">TOTAL HR PERFORMANCE SCORE</div>' +
        '<div style="font-size:5rem; font-weight:800; line-height:1" class="' + totalColor + '">' + scores.total + '</div>' +
        '<div class="text-sm c-muted">out of 100</div>' +
        '<div class="mt-2 text-sm">' + (scores.total >= 80 ? '🏆 Excellent strategic HR leadership!' : scores.total >= 60 ? '👍 Solid HR performance with room to improve.' : '📚 Learning opportunity — try a different strategy.') + '</div>' +
      '</div>' +

      '<div class="panel anim-fadeup-2">' +
        '<div class="panel-header"><div class="panel-title">Performance Dimensions</div></div>' +
        '<div class="grid-2">' + scoreDims + '</div>' +
      '</div>' +

      '<div class="panel anim-fadeup-3">' +
        '<div class="panel-header"><div class="panel-title">🏅 Badges Earned</div></div>' +
        '<div class="achievement-grid">' + badgeHtml + '</div>' +
      '</div>' +

      '<div class="panel anim-fadeup-3">' +
        '<div class="panel-header"><div class="panel-title">Decision Review</div><div class="panel-subtitle">See how each decision shaped your outcome</div></div>' +
        '<div style="display:flex; flex-direction:column; gap:12px;">' + decisionRows + '</div>' +
      '</div>' +

      '<div class="panel anim-fadeup-4">' +
        '<div class="panel-header"><div class="panel-title">📘 What You Just Managed</div></div>' +
        '<div style="display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px 0;">' +
          ['Business Requirement', 'Workforce Planning', 'Gap Analysis', 'HR Strategy', 'Recruitment', 'Selection', 'Training & Development', 'Performance Evaluation', 'Business Outcome'].map(function(step, i) {
            return '<div class="font-semibold c-accent">' + step + '</div>' + (i < 8 ? '<div class="c-muted" style="font-size:1.2rem">↓</div>' : '');
          }).join('') +
        '</div>' +
        '<div class="grid-2 mt-2">' +
          '<div class="insight-box">' +
            '<div class="insight-label">Key HR Concepts</div>' +
            '<div class="insight-text"><strong>HRP:</strong> Matching workforce supply with business demand.<br><strong>Recruitment:</strong> Attracting the right talent through the right channels.<br><strong>Selection:</strong> Choosing candidates who balance skill, fit, and growth.<br><strong>Training:</strong> Improving current employee capability.<br><strong>Development:</strong> Preparing employees for future roles.</div>' +
          '</div>' +
          '<div class="insight-box success-insight">' +
            '<div class="insight-label">Business Intelligence Role</div>' +
            '<div class="insight-text">BI supports HR by answering: <em>How many? What skills? Which channel? Who to hire? Did training work?</em><br><br>Data-driven HR decisions reduce costs, improve quality, and accelerate project readiness.</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="panel anim-fadeup-4 text-center" style="background:var(--navy); color:white;">' +
        '<div style="font-size:1.2rem; font-weight:700; margin-bottom:16px;">What would you do differently?</div>' +
        '<div class="btn-group" style="justify-content:center; flex-wrap:wrap">' +
          '<button class="btn btn-teal btn-lg" onclick="window.HRApp.reset()">↩ Restart</button>' +
          '<button class="btn btn-outline" style="color:white; border-color:rgba(255,255,255,0.3)" onclick="window.HRApp.replayDifferent()">🎲 Try Different Strategy</button>' +
        '</div>' +
      '</div>';
  },

  // ══════════════════════════════════════════════════════
  // EMPLOYEE PROFILE MODAL
  // ══════════════════════════════════════════════════════
  showEmployeeProfile: function(empId) {
    var s   = window.HRState;
    var emp = s.employees.find(function(e) { return e.id === empId; });
    if (!emp) return;

    var trained = s.trainedEmployees.filter(function(t) { return t.empId === empId; });
    var trainedHtml = trained.length > 0 ? trained.map(function(t) {
      return '<div class="text-xs c-success font-bold">' + t.icon + ' ' + t.programName + ': ' + t.skill + ' +' + t.gain + '</div>';
    }).join('') : '<div class="text-xs c-muted">No training completed yet</div>';

    this.showModal(
      '<div class="modal-title">' + emp.name + '</div>' +
      '<div class="modal-sub">' + emp.role + ' · ' + emp.dept + ' · ' + emp.experience + ' years experience</div>' +
      '<div class="modal-divider"></div>' +
      '<div class="grid-2 mb-2">' +
        '<div><div class="text-xs c-muted font-bold mb-1">RETENTION RISK</div><div class="font-bold ' + ({'LOW':'c-success','MEDIUM':'c-warning','HIGH':'c-danger'}[emp.retentionRisk] || '') + '">' + emp.retentionRisk + '</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">PROMOTION POTENTIAL</div><div class="font-bold c-accent">' + emp.promotionPotential + '</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">PERFORMANCE</div><div class="font-bold">' + emp.performance + '/100</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">LEARNING POTENTIAL</div><div class="font-bold c-info">' + Math.round((emp.learningPotential || 0.7) * 100) + '%</div></div>' +
      '</div>' +
      '<div class="section-title">Skills</div>' +
      this.skillBar('Python', emp.python) + this.skillBar('ML', emp.ml) + this.skillBar('Cloud', emp.cloud) + this.skillBar('AI', emp.ai) +
      '<div class="section-title mt-2">Training History</div>' +
      trainedHtml +
      '<div class="modal-divider"></div>' +
      '<div style="text-align:center">' +
        '<button class="btn btn-ghost" onclick="window.HRUI.closeModal()">Close</button>' +
      '</div>'
    );
    this.animateSkillBars(document.getElementById('modal-box'));
  },

  // ══════════════════════════════════════════════════════
  // CANDIDATE PROFILE MODAL
  // ══════════════════════════════════════════════════════
  showCandidateProfile: function(candId) {
    var s    = window.HRState;
    var cand = s.candidatePool.find(function(c) { return c.id === candId; });
    if (!cand) return;

    var isHired    = s.hiredCandidates.find(function(h) { return h.id === candId; });
    var hireCost   = Math.round(cand.expectedSalary * 0.5) + 50000;
    var canAfford  = s.budget >= hireCost;

    this.showModal(
      '<div class="modal-title">' + cand.name + '</div>' +
      '<div class="modal-sub">Candidate ' + cand.id + ' · Exp: ' + cand.experience + ' yrs · Assessment: ' + cand.assessment + '/100</div>' +
      '<div class="modal-divider"></div>' +
      '<div class="grid-2 mb-2">' +
        '<div><div class="text-xs c-muted font-bold mb-1">EXPECTED SALARY</div><div class="font-bold">₹' + (cand.expectedSalary/1000).toFixed(0) + 'K/month</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">CULTURE FIT</div><div class="font-bold ' + (cand.cultureFit >= 80 ? 'c-success' : cand.cultureFit >= 60 ? 'c-warning' : 'c-danger') + '">' + cand.cultureFit + '%</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">GROWTH POTENTIAL</div><div class="font-bold c-accent">' + cand.growthPotential + '</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">RETENTION RISK</div><div class="font-bold ' + ({'LOW':'c-success','MEDIUM':'c-warning','HIGH':'c-danger','VERY HIGH':'c-danger'}[cand.risk] || '') + '">' + cand.risk + '</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">NOTICE PERIOD</div><div class="font-bold">' + (cand.noticePeriod === 0 ? 'Immediate' : cand.noticePeriod + ' days') + '</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">HIRE COST EST.</div><div class="font-bold">₹' + hireCost.toLocaleString('en-IN') + '</div></div>' +
      '</div>' +
      '<div class="section-title">Skills</div>' +
      this.skillBar('Python', cand.python) + this.skillBar('ML', cand.ml) + this.skillBar('Cloud', cand.cloud) + this.skillBar('AI', cand.ai) +
      '<div class="insight-box mt-2">' +
        '<div class="insight-label">HR Analysis</div>' +
        '<div class="insight-text"><strong>Strength:</strong> ' + (cand.strength || 'Good overall profile') + '<br><strong>Watch out for:</strong> ' + (cand.weakness || 'No significant concerns') + '</div>' +
      '</div>' +
      '<div class="modal-divider"></div>' +
      '<div style="text-align:center; display:flex; gap:12px; justify-content:center">' +
        (isHired ? '<div class="font-bold c-success">✓ Already Hired</div>' :
          (canAfford ?
            '<button class="btn btn-success btn-lg" onclick="var r=window.HREngine.hireCandidate(\'' + cand.id + '\'); if(r){window.HRUI.closeModal(); window.HRUI.toast(\'' + cand.name + ' hired! +' + (r.moraleEffect >= 0 ? '+' : '') + r.moraleEffect + '% morale\', \'success\');} window.HRUI.renderPhase(6);">✓ Hire ' + cand.name.split(' ')[0] + '</button>' :
            '<div class="c-danger font-bold">Insufficient budget</div>'
          )
        ) +
        '<button class="btn btn-ghost" onclick="window.HRUI.closeModal()">Close</button>' +
      '</div>'
    );
    this.animateSkillBars(document.getElementById('modal-box'));
  },

  // ══════════════════════════════════════════════════════
  // TRAINING CONFIRM MODAL
  // ══════════════════════════════════════════════════════
  confirmTraining: function(empId, programId) {
    var s    = window.HRState;
    var emp  = s.employees.find(function(e) { return e.id === empId; });
    var prog = window.HRScenarios.trainingPrograms.find(function(p) { return p.id === programId; });
    if (!emp || !prog) return;

    var expectedGainMin = Math.round(prog.skillGain.min * (emp.learningPotential || 0.7));
    var expectedGainMax = Math.round(prog.skillGain.max * (emp.learningPotential || 0.7));

    this.showModal(
      '<div class="modal-title">' + prog.icon + ' ' + prog.name + '</div>' +
      '<div class="modal-sub">Enrolling: ' + emp.name + '</div>' +
      '<div class="modal-divider"></div>' +
      '<div class="grid-2 mb-2">' +
        '<div><div class="text-xs c-muted font-bold mb-1">COST</div><div class="font-bold c-warning">₹' + prog.cost.toLocaleString('en-IN') + '</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">DURATION</div><div class="font-bold">' + prog.weeks + ' weeks</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">EXPECTED SKILL GAIN</div><div class="font-bold c-success">+' + expectedGainMin + ' to +' + expectedGainMax + '</div></div>' +
        '<div><div class="text-xs c-muted font-bold mb-1">MORALE BOOST</div><div class="font-bold c-success">+' + prog.moraleBoost + '%</div></div>' +
      '</div>' +
      '<div class="insight-box warn-insight mb-2">' +
        '<div class="insight-label">Note</div>' +
        '<div class="insight-text">Actual skill gain depends on ' + emp.name.split(' ')[0] + '\'s learning potential (' + Math.round((emp.learningPotential || 0.7) * 100) + '%). The outcome will vary.</div>' +
      '</div>' +
      '<div style="display:flex; gap:12px; justify-content:center">' +
        '<button class="btn btn-primary" onclick="var r=window.HREngine.startTraining(\'' + empId + '\',\'' + programId + '\'); if(r){window.HRUI.closeModal(); window.HRUI.toast(\'' + emp.name + ' completed ' + prog.name + '! Skill: +\'+r.gain, \'success\'); window.HRUI.renderPhase(7);}">Confirm Training</button>' +
        '<button class="btn btn-ghost" onclick="window.HRUI.closeModal()">Cancel</button>' +
      '</div>'
    );
  }
};
