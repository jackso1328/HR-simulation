/* ═══════════════════════════════════════════════════════════
   UI.JS — Minimal rendering, one decision at a time
═══════════════════════════════════════════════════════════ */
window.HRUI = {

  /* ── KPIs ─────────────────────────────────────────────── */
  /* Render 2–3 relevant KPIs for the current phase */
  updateKPIs: function(phase) {
    var s   = window.HRState;
    var fmt = function(n) { return '₹' + (n >= 100000 ? (n/100000).toFixed(1) + 'L' : n.toLocaleString('en-IN')); };
    var tb  = document.getElementById('tb-kpis');
    if (!tb) return;

    phase = phase || s.phase;

    var budgetPct = s.scenario ? (s.budget / s.scenario.budget) : 1;
    var budgetCls = budgetPct >= 0.4 ? 'good' : budgetPct >= 0.15 ? 'warn' : 'danger';

    var moraleCls = s.morale >= 70 ? 'good' : s.morale >= 50 ? 'warn' : 'danger';
    var timeLeft  = (s.deadline - s.timeUsed).toFixed(1);
    var timeCls   = parseFloat(timeLeft) >= (s.deadline * 0.4) ? 'good' : parseFloat(timeLeft) >= (s.deadline * 0.15) ? 'warn' : 'danger';

    var readiness = window.HREngine.calculateReadiness();

    var kpiSets = {
      1: [{ icon:'💰', val: fmt(s.budget), cls: budgetCls }, { icon:'⏱', val: timeLeft + 'mo', cls: timeCls }],
      2: [{ icon:'💰', val: fmt(s.budget), cls: budgetCls }, { icon:'⏱', val: timeLeft + 'mo', cls: timeCls }],
      3: [{ icon:'💚', val: s.morale + '%', cls: moraleCls }, { icon:'💰', val: fmt(s.budget), cls: budgetCls }],
      4: [{ icon:'💰', val: fmt(s.budget), cls: budgetCls }, { icon:'⏱', val: timeLeft + 'mo', cls: timeCls }],
      5: [{ icon:'💰', val: fmt(s.budget), cls: budgetCls }, { icon:'⏱', val: timeLeft + 'mo', cls: timeCls }],
      6: [{ icon:'👥', val: s.hiredCandidates.length + ' hired', cls: s.hiredCandidates.length > 0 ? 'good' : '' }, { icon:'💰', val: fmt(s.budget), cls: budgetCls }],
      7: [{ icon:'💚', val: s.morale + '%', cls: moraleCls }, { icon:'🎓', val: s.trainedEmployees.length + ' trained', cls: s.trainedEmployees.length > 0 ? 'good' : '' }, { icon:'💰', val: fmt(s.budget), cls: budgetCls }],
      8: [{ icon:'🎯', val: readiness + '%', cls: readiness >= 70 ? 'good' : readiness >= 50 ? 'warn' : 'danger' }, { icon:'💚', val: s.morale + '%', cls: moraleCls }],
      9: [{ icon:'🎯', val: readiness + '%', cls: readiness >= 70 ? 'good' : 'warn' }, { icon:'💰', val: fmt(s.budget), cls: budgetCls }, { icon:'💚', val: s.morale + '%', cls: moraleCls }]
    };

    var set = kpiSets[phase] || kpiSets[1];
    tb.innerHTML = set.map(function(k) {
      return '<div class="tb-kpi ' + (k.cls || '') + '">' +
        '<span class="k-icon">' + k.icon + '</span>' +
        '<span>' + k.val + '</span>' +
      '</div>';
    }).join('');
  },

  /* ── PROGRESS BAR ──────────────────────────────────────── */
  updateProgress: function() {
    var s   = window.HRState;
    var steps = [
      { ph:1, label:'Demand' }, { ph:2, label:'Gap' },
      { ph:3, label:'Team' },   { ph:4, label:'Strategy' },
      { ph:5, label:'Recruit' },{ ph:6, label:'Select' },
      { ph:7, label:'Train' },  { ph:8, label:'Review' },
      { ph:9, label:'Report' }
    ];
    var cont = document.getElementById('progress-steps');
    if (!cont) return;
    cont.innerHTML = steps.map(function(st) {
      var cls = 'ps-step';
      if (st.ph === s.phase) cls += ' active';
      else if (s.completedPhases.indexOf(st.ph) !== -1) cls += ' done';
      else cls += ' locked';
      var dotContent = s.completedPhases.indexOf(st.ph) !== -1 ? '✓' : st.ph;
      return '<div class="' + cls + '" data-phase="' + st.ph + '">' +
        '<div class="ps-dot">' + dotContent + '</div>' +
        '<span class="ps-label">' + st.label + '</span>' +
      '</div>';
    }).join('');

    // Click to revisit
    cont.querySelectorAll('.ps-step.done, .ps-step.active').forEach(function(el) {
      el.addEventListener('click', function() {
        var ph = parseInt(el.getAttribute('data-phase'));
        window.HREngine.advancePhase(ph);
      });
    });

    // Scroll active step into view
    var active = cont.querySelector('.ps-step.active');
    if (active) active.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
  },

  /* ── BOTTOM NAV ────────────────────────────────────────── */
  updateBottomNav: function() {
    var s = window.HRState;
    document.querySelectorAll('.bnav-btn').forEach(function(btn) {
      var ph = parseInt(btn.getAttribute('data-phase'));
      btn.classList.toggle('active', ph === s.phase);
    });
  },

  /* ── TOP SCENARIO LABEL ─────────────────────────────────── */
  updateTopLabel: function() {
    var s  = window.HRState;
    var el = document.getElementById('tb-scenario-name');
    if (el && s.scenario) el.textContent = s.scenario.icon + ' ' + s.scenario.name;
  },

  /* ── TOAST ──────────────────────────────────────────────── */
  toast: function(msg, type, duration) {
    var cont = document.getElementById('toast-container');
    if (!cont) return;
    var div  = document.createElement('div');
    div.className = 'toast ' + (type || '');
    div.textContent = msg;
    cont.appendChild(div);
    setTimeout(function() { if (div.parentNode) div.remove(); }, duration || 3200);
  },

  /* ── MODAL ──────────────────────────────────────────────── */
  showModal: function(html) {
    var box = document.getElementById('modal-box');
    var ov  = document.getElementById('modal-overlay');
    if (box) box.innerHTML = '<div class="modal-handle"></div><div class="modal-inner">' + html + '</div>';
    if (ov)  ov.classList.remove('hidden');
  },
  closeModal: function() {
    var ov = document.getElementById('modal-overlay');
    if (ov) ov.classList.add('hidden');
  },

  /* ── SKILL BAR ──────────────────────────────────────────── */
  skillBar: function(label, value) {
    var cls = value >= 80 ? 'high' : value >= 60 ? 'medium' : '';
    return '<div class="skill-row">' +
      '<span class="skill-name">' + label + '</span>' +
      '<div class="skill-track"><div class="skill-fill ' + cls + '" data-w="' + value + '" style="width:0"></div></div>' +
      '<span class="skill-val">' + value + '</span>' +
    '</div>';
  },

  animateSkills: function() {
    var fills = document.querySelectorAll('.skill-fill[data-w]');
    requestAnimationFrame(function() {
      setTimeout(function() {
        fills.forEach(function(el) { el.style.width = el.getAttribute('data-w') + '%'; });
      }, 60);
    });
  },

  /* ── RENDER DISPATCHER ──────────────────────────────────── */
  renderPhase: function(phase) {
    var cont = document.getElementById('dynamic-content');
    if (!cont) return;
    // Animate in
    cont.style.animation = 'none';
    cont.offsetHeight;
    cont.style.animation = '';

    var map = {
      1: this.renderPhase1, 2: this.renderPhase2, 3: this.renderPhase3,
      4: this.renderPhase4, 5: this.renderPhase5, 6: this.renderPhase6,
      7: this.renderPhase7, 8: this.renderPhase8, 9: this.renderPhase9
    };
    if (map[phase]) map[phase].call(this, cont);

    this.updateProgress();
    this.updateBottomNav();
    this.updateKPIs(phase);
    this.animateSkills();

    // Scroll to top
    var panel = document.getElementById('main-panel');
    if (panel) panel.scrollTop = 0;
  },

  /* ═══════════════════════════════════════════════════════
     PHASE 1 — Business Demand
  ═══════════════════════════════════════════════════════ */
  renderPhase1: function(cont) {
    var s  = window.HRState;
    var sc = s.scenario;
    var fmt = function(n) { return '₹' + n.toLocaleString('en-IN'); };

    var roleRows = Object.keys(sc.requirements).map(function(role) {
      var req = sc.requirements[role];
      return '<div class="gap-card">' +
        '<span class="gap-role">' + role + '</span>' +
        '<span style="font-size:1rem; font-weight:800; color:var(--navy)">' + req.required + ' needed</span>' +
      '</div>';
    }).join('');

    cont.innerHTML =
      '<div class="phase-header">' +
        '<div class="ph-eyebrow">Phase 1 · Business Demand</div>' +
        '<div class="ph-title">' + sc.name + '</div>' +
        '<div class="ph-sub">' + sc.brief + '</div>' +
        '<div class="ph-meta">' +
          '<div class="ph-meta-item"><span class="ph-meta-label">Client</span><span class="ph-meta-val">' + sc.client + '</span></div>' +
          '<div class="ph-meta-item"><span class="ph-meta-label">Deadline</span><span class="ph-meta-val">' + sc.deadline + ' months</span></div>' +
          '<div class="ph-meta-item"><span class="ph-meta-label">Budget</span><span class="ph-meta-val">' + fmt(s.budget) + '</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="panel">' +
        '<div class="panel-body">' +
          '<div class="panel-title">Roles needed</div>' +
        '</div>' +
        roleRows +
      '</div>' +

      '<div class="insight">' +
        '<div class="insight-label">HR Concept</div>' +
        '<div class="insight-text">HR Planning starts with understanding <strong>what skills</strong>, <strong>how many people</strong>, and <strong>by when</strong>. This drives every HR decision downstream.</div>' +
      '</div>' +

      '<button class="btn-primary" onclick="window.HREngine.advancePhase(2)">Analyze Workforce Gap →</button>';
  },

  /* ═══════════════════════════════════════════════════════
     PHASE 2 — Gap Analysis
  ═══════════════════════════════════════════════════════ */
  renderPhase2: function(cont) {
    var s  = window.HRState;
    var analyzed = s.completedPhases.indexOf(2) !== -1;

    var gapCards = Object.keys(s.requirements).map(function(role) {
      var req   = s.requirements[role];
      var avail = s.available[role] || 0;
      var gap   = req - avail;
      var cls   = gap > 0 ? 'shortage' : gap < 0 ? 'surplus' : 'ok';
      var tagTxt = gap > 0 ? '−' + gap + ' missing' : gap < 0 ? '+' + Math.abs(gap) + ' surplus' : 'Balanced';
      return '<div class="gap-card">' +
        '<div>' +
          '<div class="gap-role">' + role + '</div>' +
          '<div style="font-size:0.72rem; color:var(--text-soft); margin-top:2px">Available → Required</div>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:10px">' +
          '<div class="gap-numbers"><span class="gap-avail">' + avail + '</span><span class="gap-arrow">→</span><span class="gap-req">' + req + '</span></div>' +
          '<span class="gap-tag ' + cls + '">' + tagTxt + '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    var summaryHtml = analyzed ?
      '<div class="gap-summary">' +
        '<div class="gs-item info"><span class="gs-num">' + s.totalRequired() + '</span><span class="gs-lbl">Required</span></div>' +
        '<div class="gs-item danger"><span class="gs-num">' + s.totalGap() + '</span><span class="gs-lbl">Gap</span></div>' +
        '<div class="gs-item good"><span class="gs-num">' + s.totalAvailable() + '</span><span class="gs-lbl">Available</span></div>' +
      '</div>' : '';

    var actionHtml = analyzed ?
      '<button class="btn-primary" onclick="window.HRUI.renderPhase(3)">Inspect Your Team →</button>' :
      '<button class="btn-primary" onclick="window.HREngine.analyzeWorkforce()">Run Gap Analysis</button>';

    cont.innerHTML =
      '<div class="phase-header">' +
        '<div class="ph-eyebrow">Phase 2 · Workforce Planning</div>' +
        '<div class="ph-title">What\'s the gap?</div>' +
        '<div class="ph-sub">Compare available headcount against project requirements.</div>' +
      '</div>' +

      '<div class="panel">' + gapCards + summaryHtml + '</div>' +

      '<div class="insight">' +
        '<div class="insight-label">HR Planning</div>' +
        '<div class="insight-text">The workforce gap tells HR whether to <strong>recruit</strong>, <strong>train</strong>, or <strong>restructure</strong> to meet the business need.</div>' +
      '</div>' +

      actionHtml;
  },

  /* ═══════════════════════════════════════════════════════
     PHASE 3 — Team Intelligence
  ═══════════════════════════════════════════════════════ */
  renderPhase3: function(cont) {
    var s = window.HRState;

    var empCards = s.employees.map(function(emp) {
      var riskCls = { LOW:'', MEDIUM:'warn', HIGH:'bad' }[emp.retentionRisk] || '';
      var lpPct   = Math.round((emp.learningPotential || 0.7) * 100);
      var lpCls   = lpPct >= 80 ? 'high' : '';
      return '<div class="emp-card">' +
        '<div class="emp-header">' +
          '<div>' +
            '<div class="emp-name">' + emp.name + '</div>' +
            '<div class="emp-role">' + emp.role + ' · ' + emp.experience + ' yrs</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<span class="emp-lp-badge ' + lpCls + '">Learning ' + lpPct + '%</span>' +
            '<div style="font-size:0.68rem; margin-top:4px; color:var(--' + (riskCls === 'bad' ? 'coral' : riskCls === 'warn' ? 'amber' : 'text-soft') + ')">' + emp.retentionRisk + ' risk</div>' +
          '</div>' +
        '</div>' +
        '<div class="emp-skills">' +
          window.HRUI.skillBar('Python', emp.python) +
          window.HRUI.skillBar('ML', emp.ml) +
          window.HRUI.skillBar('Cloud', emp.cloud) +
          window.HRUI.skillBar('AI', emp.ai) +
        '</div>' +
        '<div style="padding:10px 20px">' +
          '<button class="btn-outline" style="padding:8px; font-size:0.78rem;" onclick="window.HRUI.showEmployeeModal(\'' + emp.id + '\')">View full profile</button>' +
        '</div>' +
      '</div>';
    }).join('');

    cont.innerHTML =
      '<div class="phase-header">' +
        '<div class="ph-eyebrow">Phase 3 · Talent Intelligence</div>' +
        '<div class="ph-title">Know your team</div>' +
        '<div class="ph-sub">Review existing skills before deciding who to train or hire externally.</div>' +
      '</div>' +

      empCards +

      '<div class="insight">' +
        '<div class="insight-label">Why this matters</div>' +
        '<div class="insight-text">Internal development is often more cost-effective and improves retention. But not everyone has the learning potential needed for rapid upskilling.</div>' +
      '</div>' +

      '<button class="btn-primary" onclick="window.HREngine.advancePhase(4)">Choose HR Strategy →</button>';

    this.animateSkills();
  },

  /* ═══════════════════════════════════════════════════════
     PHASE 4 — HR Strategy
  ═══════════════════════════════════════════════════════ */
  renderPhase4: function(cont) {
    var s  = window.HRState;

    var strats = [
      {
        id: 'recruit', icon: '🌐', name: 'Recruit',
        desc: 'Hire external candidates to close the gap fast.',
        attrs: [
          { lbl:'Cost', val:'High', cls:'high' },
          { lbl:'Speed', val:'Fast', cls:'low' },
          { lbl:'Morale', val:'Neutral', cls:'' }
        ]
      },
      {
        id: 'train', icon: '🎓', name: 'Develop',
        desc: 'Invest in your existing team to build the skills needed.',
        attrs: [
          { lbl:'Cost', val:'Low', cls:'low' },
          { lbl:'Speed', val:'Slow', cls:'high' },
          { lbl:'Morale', val:'High', cls:'low' }
        ]
      },
      {
        id: 'combination', icon: '⚖️', name: 'Combine',
        desc: 'Recruit for critical roles, develop the rest internally.',
        attrs: [
          { lbl:'Cost', val:'Medium', cls:'medium' },
          { lbl:'Speed', val:'Medium', cls:'medium' },
          { lbl:'Morale', val:'Good', cls:'low' }
        ]
      }
    ];

    var cards = strats.map(function(st) {
      var isSelected = s.strategyChosen === st.id;
      return '<div class="strat-card ' + (isSelected ? 'selected' : '') + '" onclick="window.HREngine.chooseStrategy(\'' + st.id + '\')">' +
        '<div class="strat-icon-wrap">' + st.icon + '</div>' +
        '<div class="strat-body">' +
          '<div class="strat-name">' + st.name + '</div>' +
          '<div class="strat-desc">' + st.desc + '</div>' +
          '<div class="strat-attrs">' +
            st.attrs.map(function(a) {
              return '<span class="strat-attr"><span class="strat-attr-lbl">' + a.lbl + '</span> <span class="strat-attr-val ' + a.cls + '">' + a.val + '</span></span>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="strat-check">' + (isSelected ? '✓' : '') + '</div>' +
      '</div>';
    }).join('');

    var hint = s.scenario && s.scenario.optimalStrategies ?
      '<div class="insight warn"><div class="insight-label">Scenario Hint</div><div class="insight-text">' + s.scenario.optimalStrategies.combination + '</div></div>' : '';

    var nextBtn = s.strategyChosen ?
      '<button class="btn-primary" onclick="window.HREngine.advancePhase(' + (s.strategyChosen === 'train' ? 7 : 5) + ')">Proceed to ' + (s.strategyChosen === 'train' ? 'Training' : 'Recruitment') + ' →</button>' : '';

    cont.innerHTML =
      '<div class="phase-header">' +
        '<div class="ph-eyebrow">Phase 4 · HR Strategy</div>' +
        '<div class="ph-title">How will you close the gap?</div>' +
        '<div class="ph-sub">No single answer is always correct. Consider your budget, deadline, and team.</div>' +
      '</div>' +

      '<div class="strategy-grid">' + cards + '</div>' +

      hint + nextBtn;
  },

  /* ═══════════════════════════════════════════════════════
     PHASE 5 — Recruitment Channel
  ═══════════════════════════════════════════════════════ */
  renderPhase5: function(cont) {
    var s = window.HRState;

    var channels = [
      { id:'network',  icon:'💼', name:'Network',   cost:20000, weeks:2, reach:'1K+',   desc:'LinkedIn and job boards. Wide reach.' },
      { id:'college',  icon:'🎓', name:'Campus',    cost:12000, weeks:3, reach:'300+',  desc:'Fresh graduates. High potential, low cost.' },
      { id:'referral', icon:'🤝', name:'Referral',  cost:8000,  weeks:1, reach:'80+',   desc:'Team recommendations. Best culture fit.' },
      { id:'agency',   icon:'🏢', name:'Agency',    cost:45000, weeks:1, reach:'20+',   desc:'Specialist headhunters. Premium talent.' }
    ];

    var selected = s.recruitmentChannel;

    var grid = channels.map(function(ch) {
      var affordable = s.budget >= ch.cost;
      var isSel = selected === ch.id;
      return '<div class="ch-card ' + (isSel ? 'selected' : '') + (!affordable ? ' disabled' : '') + '" onclick="' + (affordable ? 'window.HREngine.selectChannel(\'' + ch.id + '\')' : '') + '">' +
        '<div class="ch-icon">' + ch.icon + '</div>' +
        '<div class="ch-name">' + ch.name + '</div>' +
        '<div class="text-sm c-mid" style="margin-bottom:6px">' + ch.desc + '</div>' +
        '<div class="ch-stats">' +
          '<div class="ch-stat"><span class="ch-stat-lbl">Cost</span><span class="ch-stat-val">₹' + (ch.cost/1000) + 'K</span></div>' +
          '<div class="ch-stat"><span class="ch-stat-lbl">Time</span><span class="ch-stat-val">' + ch.weeks + 'wk</span></div>' +
          '<div class="ch-stat"><span class="ch-stat-lbl">Reach</span><span class="ch-stat-val">' + ch.reach + '</span></div>' +
        '</div>' +
        (isSel ? '<div class="ch-selected-note">✓ ' + s.applications.toLocaleString('en-IN') + ' applications received</div>' : '') +
        (!affordable ? '<div style="font-size:0.68rem; color:var(--coral); font-weight:700; text-align:center; margin-top:6px;">Insufficient budget</div>' : '') +
      '</div>';
    }).join('');

    var nextBtn = selected ?
      '<button class="btn-primary" onclick="window.HREngine.advancePhase(6)">Review Candidates →</button>' : 
      '<button class="btn-ghost" style="width:100%; margin-top:8px;" onclick="window.HREngine.advancePhase(7)">Skip Recruitment →</button>';

    cont.innerHTML =
      '<div class="phase-header">' +
        '<div class="ph-eyebrow">Phase 5 · Recruitment</div>' +
        '<div class="ph-title">Where will you look?</div>' +
        '<div class="ph-sub">Each channel reaches different talent pools with different costs, timelines, and quality trade-offs.</div>' +
      '</div>' +

      '<div class="channel-grid">' + grid + '</div>' +

      '<div class="insight">' +
        '<div class="insight-label">Recruitment Theory</div>' +
        '<div class="insight-text">Channel choice affects candidate <strong>quality, quantity, cost, and culture fit</strong>. No single channel is always best.</div>' +
      '</div>' +

      nextBtn;
  },

  /* ═══════════════════════════════════════════════════════
     PHASE 6 — Candidate Selection
  ═══════════════════════════════════════════════════════ */
  renderPhase6: function(cont) {
    var s = window.HRState;

    if (!s.recruitmentChannel || s.candidatePool.length === 0) {
      cont.innerHTML =
        '<div class="phase-header"><div class="ph-eyebrow">Phase 6 · Selection</div><div class="ph-title">No candidates yet</div><div class="ph-sub">Choose a recruitment channel first.</div></div>' +
        '<button class="btn-primary" onclick="window.HREngine.advancePhase(5)">← Choose Channel</button>';
      return;
    }

    // Interview method picker (if not chosen)
    var methodHtml = '';
    if (!s.interviewMethod) {
      var methods = [
        { id:'technical',  icon:'💻', name:'Technical Test', accuracy:'90%', time:'1 wk' },
        { id:'behavioral', icon:'🧠', name:'Behavioral',     accuracy:'75%', time:'1 wk' },
        { id:'structured', icon:'📋', name:'Structured',     accuracy:'85%', time:'1.5 wk' },
        { id:'panel',      icon:'👥', name:'Panel',          accuracy:'92%', time:'2 wks' }
      ];
      methodHtml =
        '<div class="panel"><div class="panel-body">' +
          '<div class="panel-title">Choose interview method</div>' +
          '<div class="method-grid">' +
            methods.map(function(m) {
              return '<div class="method-card" onclick="window.HREngine.selectInterviewMethod(\'' + m.id + '\'); window.HRUI.renderPhase(6);">' +
                '<div class="method-icon">' + m.icon + '</div>' +
                '<div class="method-name">' + m.name + '</div>' +
                '<div class="method-acc">Accuracy: ' + m.accuracy + '</div>' +
                '<div class="method-time">⏱ ' + m.time + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div></div>';
    }

    // Funnel
    var app  = s.applications;
    var pool = s.candidatePool.length;
    var ch   = s.recruitmentChannel;
    var shortN = ch === 'agency' ? app : Math.max(pool, Math.round(app * 0.008));
    var funnelHtml =
      '<div class="panel"><div class="panel-body">' +
        '<div class="panel-title">Recruitment funnel — ' + ch.toUpperCase() + '</div>' +
        '<div class="funnel-rows">' +
          [
            { lbl:'Applications', n:app, pct:100, cls:'' },
            { lbl:'Shortlisted',  n:shortN, pct:Math.min(100, Math.round(shortN/app*100)), cls:'amber' },
            { lbl:'Final pool',   n:pool,   pct:Math.min(100, Math.round(pool/app*100)),   cls:'emerald' }
          ].map(function(f) {
            return '<div class="funnel-row">' +
              '<span class="funnel-lbl">' + f.lbl + '</span>' +
              '<div class="funnel-track"><div class="funnel-fill ' + f.cls + '" style="width:' + f.pct + '%">' + f.n + '</div></div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div></div>';

    // Candidate cards
    var candCards = s.candidatePool.map(function(c) {
      var isHired = s.hiredCandidates.find(function(h) { return h.id === c.id; });
      var scoreCls = c.assessment >= 85 ? 'high' : c.assessment >= 70 ? 'medium' : '';
      var fitCls   = c.cultureFit >= 80 ? 'good' : c.cultureFit >= 60 ? 'warn' : 'bad';
      var riskCls  = c.risk === 'LOW' ? 'good' : c.risk === 'MEDIUM' ? 'warn' : 'bad';
      return '<div class="cand-card">' +
        '<div class="cand-header">' +
          '<div class="cand-name-block">' +
            '<div class="cand-name">' + c.name + '</div>' +
            '<div class="cand-role">' + (c.experience === 1 ? 'Fresher' : c.experience + ' yrs exp') + '</div>' +
          '</div>' +
          '<div class="cand-score-circle ' + scoreCls + '">' +
            '<div class="cand-score-num">' + c.assessment + '</div>' +
            '<div class="cand-score-lbl">Score</div>' +
          '</div>' +
        '</div>' +
        '<div class="cand-attrs">' +
          '<div class="cand-attr-item"><div class="cand-attr-lbl">Salary</div><div class="cand-attr-val">₹' + (c.expectedSalary/1000).toFixed(0) + 'K/mo</div></div>' +
          '<div class="cand-attr-item"><div class="cand-attr-lbl">Culture Fit</div><div class="cand-attr-val ' + fitCls + '">' + c.cultureFit + '%</div></div>' +
          '<div class="cand-attr-item"><div class="cand-attr-lbl">Growth</div><div class="cand-attr-val">' + c.growthPotential + '</div></div>' +
          '<div class="cand-attr-item"><div class="cand-attr-lbl">Risk</div><div class="cand-attr-val ' + riskCls + '">' + c.risk + '</div></div>' +
        '</div>' +
        '<div class="cand-actions">' +
          (isHired ?
            '<button class="btn-hire hired" disabled>✓ Hired</button>' :
            '<button class="btn-hire" onclick="window.HRUI.hireCandidateFlow(\'' + c.id + '\')">Hire</button>'
          ) +
          '<button class="btn-profile" onclick="window.HRUI.showCandidateModal(\'' + c.id + '\')">Profile</button>' +
        '</div>' +
      '</div>';
    }).join('');

    var nextBtn = s.hiredCandidates.length > 0 ?
      '<button class="btn-primary" onclick="window.HREngine.advancePhase(7)">Proceed to Training →</button>' : 
      '<button class="btn-ghost" style="width:100%; margin-top:8px;" onclick="window.HREngine.advancePhase(7)">Skip Hiring →</button>';

    cont.innerHTML =
      '<div class="phase-header">' +
        '<div class="ph-eyebrow">Phase 6 · Selection</div>' +
        '<div class="ph-title">' + s.candidatePool.length + ' candidates ready</div>' +
        '<div class="ph-sub">Review each candidate\'s skills, fit, and risk. Select carefully — every hire has consequences.</div>' +
      '</div>' +

      methodHtml +
      funnelHtml +

      '<div class="panel-title" style="padding:0 4px">Candidates</div>' +
      '<div class="cand-stack">' + candCards + '</div>' +

      '<div class="insight">' +
        '<div class="insight-label">Selection Theory</div>' +
        '<div class="insight-text">Balance <strong>skill, culture fit, growth potential, and cost</strong>. High skill with poor fit often underperforms over time.</div>' +
      '</div>' +

      nextBtn;
  },

  /* ═══════════════════════════════════════════════════════
     PHASE 7 — Training & Development
  ═══════════════════════════════════════════════════════ */
  renderPhase7: function(cont) {
    var s        = window.HRState;
    var programs = window.HRScenarios.trainingPrograms;

    // Programs reference
    var progRef =
      '<div class="panel"><div class="panel-body">' +
        '<div class="panel-title">Available programs</div>' +
        '<div class="training-cards">' +
          programs.map(function(p) {
            return '<div class="tp-card">' +
              '<div class="tp-icon">' + p.icon + '</div>' +
              '<div class="tp-body">' +
                '<div class="tp-name">' + p.name + '</div>' +
                '<div class="tp-desc">' + p.desc + '</div>' +
                '<div class="tp-attrs">' +
                  '<span class="tp-attr">₹' + (p.cost/1000).toFixed(0) + 'K</span>' +
                  '<span class="tp-attr">·</span>' +
                  '<span class="tp-attr">' + p.weeks + ' wks</span>' +
                  '<span class="tp-attr">·</span>' +
                  '<span class="tp-attr c-teal">+' + p.skillGain.min + '–' + p.skillGain.max + ' ' + p.skillGain.skill.toUpperCase() + '</span>' +
                  '<span class="tp-attr">·</span>' +
                  '<span class="tp-attr c-emerald">Morale +' + p.moraleBoost + '</span>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div></div>';

    // Employee rows
    var empRows = s.employees.map(function(emp) {
      var trained     = s.trainedEmployees.filter(function(t) { return t.empId === emp.id; });
      var trainedIds  = trained.map(function(t) { return t.programId; });
      var eligible    = programs.filter(function(p) {
        return trainedIds.indexOf(p.id) === -1 && (!p.eligibility || p.eligibility(emp));
      });
      var progBtns = eligible.map(function(p) {
        var canAfford = s.budget >= p.cost;
        return '<button class="prog-btn ' + (!canAfford ? 'disabled' : '') + '" ' +
          (canAfford ? 'onclick="window.HRUI.confirmTraining(\'' + emp.id + '\',\'' + p.id + '\')"' : '') + '>' +
          p.icon + ' ' + p.name +
        '</button>';
      }).join('');
      var trainedNotes = trained.map(function(t) {
        return '<div class="emp-trained-note">✓ ' + t.programName + ': ' + t.skill.toUpperCase() + ' ' + t.before + '→' + t.after + ' (+' + t.gain + ')</div>';
      }).join('');

      return '<div class="emp-card">' +
        '<div class="emp-header">' +
          '<div><div class="emp-name">' + emp.name + '</div><div class="emp-role">' + emp.role + ' · LP ' + Math.round((emp.learningPotential || 0.7) * 100) + '%</div></div>' +
        '</div>' +
        '<div class="emp-skills">' +
          window.HRUI.skillBar('Python', emp.python) + window.HRUI.skillBar('ML', emp.ml) +
          window.HRUI.skillBar('Cloud', emp.cloud) + window.HRUI.skillBar('AI', emp.ai) +
        '</div>' +
        '<div class="emp-programs">' +
          (trainedNotes ? trainedNotes : '') +
          (eligible.length > 0 ?
            '<div class="emp-prog-title" style="margin-top:' + (trainedNotes ? '8px' : '0') + '">Enroll in program</div>' +
            '<div class="prog-btn-row">' + progBtns + '</div>' :
            (!trainedNotes ? '<div style="font-size:0.72rem; color:var(--text-soft)">No eligible programs</div>' : '')
          ) +
        '</div>' +
      '</div>';
    }).join('');

    cont.innerHTML =
      '<div class="phase-header">' +
        '<div class="ph-eyebrow">Phase 7 · Training & Development</div>' +
        '<div class="ph-title">Develop your people</div>' +
        '<div class="ph-sub">Training improves current skills. Development prepares for future roles. Both are measured by outcomes — not completion.</div>' +
      '</div>' +

      progRef +
      empRows +

      '<div class="insight">' +
        '<div class="insight-label">Training vs Development</div>' +
        '<div class="insight-text"><strong>Training</strong>: current role performance. <strong>Development</strong>: future potential. Actual skill gain depends on each employee\'s learning potential.</div>' +
      '</div>' +

      (s.trainedEmployees.length > 0 ?
        '<button class="btn-primary" onclick="window.HREngine.advancePhase(8)">Evaluate Training Results →</button>' :
        '<button class="btn-ghost" style="width:100%; margin-top:8px;" onclick="window.HREngine.advancePhase(9)">Skip Training →</button>');

    this.animateSkills();
  },

  /* ═══════════════════════════════════════════════════════
     PHASE 8 — Kirkpatrick Evaluation
  ═══════════════════════════════════════════════════════ */
  renderPhase8: function(cont) {
    var s = window.HRState;

    var evalCards = s.trainedEmployees.length > 0 ?
      s.trainedEmployees.map(function(t) {
        var l1 = Math.round(70 + Math.random() * 25);
        var l3 = Math.min(100, Math.round(t.gain * 3.5));
        var l4 = Math.min(100, Math.round(t.gain * 2.8));
        var verdict = t.gain >= 15 ? '✅ Highly effective' : t.gain >= 8 ? '⚠️ Moderately effective' : '❌ Below expectation';
        return '<div class="panel"><div class="panel-body">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">' +
            '<div><div style="font-weight:700; font-size:0.95rem">' + t.empName + '</div><div class="text-xs c-muted">' + t.icon + ' ' + t.programName + '</div></div>' +
            '<div style="text-align:right"><div style="font-size:0.72rem; color:var(--text-soft)">' + t.skill.toUpperCase() + '</div><div style="font-size:1.1rem; font-weight:800; color:var(--teal)">' + t.before + '→' + t.after + '</div></div>' +
          '</div>' +
          '<div class="kp-grid">' +
            '<div class="kp-level done"><div class="kp-num">Level 1</div><div class="kp-name">Reaction</div><div class="kp-desc">Learner satisfaction</div><div class="kp-score">' + l1 + '%</div></div>' +
            '<div class="kp-level done"><div class="kp-num">Level 2</div><div class="kp-name">Learning</div><div class="kp-desc">Skill acquired</div><div class="kp-score">' + t.after + '/100</div></div>' +
            '<div class="kp-level ' + (t.gain >= 10 ? 'done' : '') + '"><div class="kp-num">Level 3</div><div class="kp-name">Behavior</div><div class="kp-desc">On-job change</div><div class="kp-score">+' + l3 + '%</div></div>' +
            '<div class="kp-level ' + (t.gain >= 15 ? 'done' : '') + '"><div class="kp-num">Level 4</div><div class="kp-name">Results</div><div class="kp-desc">Business impact</div><div class="kp-score">+' + l4 + '%</div></div>' +
          '</div>' +
          '<div style="margin-top:12px; font-size:0.82rem; font-weight:600; color:var(--text-mid)">' + verdict + '</div>' +
        '</div></div>';
      }).join('') :
      '<div class="panel"><div class="panel-body" style="text-align:center; color:var(--text-soft); font-size:0.85rem; padding:24px">No training programs completed.</div></div>';

    cont.innerHTML =
      '<div class="phase-header">' +
        '<div class="ph-eyebrow">Phase 8 · Training Evaluation</div>' +
        '<div class="ph-title">Did the training work?</div>' +
        '<div class="ph-sub">The Kirkpatrick model measures effectiveness at 4 levels: Reaction → Learning → Behavior → Results.</div>' +
      '</div>' +

      evalCards +

      '<div class="insight">' +
        '<div class="insight-label">Key Insight</div>' +
        '<div class="insight-text">Most organizations only measure Levels 1–2. True ROI requires measuring <strong>Level 3 (behavior change)</strong> and <strong>Level 4 (business impact)</strong>.</div>' +
      '</div>' +

      '<button class="btn-primary" onclick="window.HREngine.advancePhase(9)">View Final Report →</button>';
  },

  /* ═══════════════════════════════════════════════════════
     PHASE 9 — Final Report
  ═══════════════════════════════════════════════════════ */
  renderPhase9: function(cont) {
    var s      = window.HRState;
    var scores = window.HREngine.calculateFinalScores();
    var totalColor = scores.total >= 80 ? 'var(--emerald)' : scores.total >= 60 ? 'var(--amber)' : 'var(--coral)';
    var verdict = scores.total >= 80 ? 'Excellent strategic HR leadership.' : scores.total >= 60 ? 'Solid performance — some areas to improve.' : 'Learning opportunity — try a different strategy.';

    var dims = [
      { key:'workforcePlanning',     lbl:'Workforce Planning' },
      { key:'recruitmentStrategy',   lbl:'Recruitment Strategy' },
      { key:'selectionQuality',      lbl:'Selection Quality' },
      { key:'trainingEffectiveness', lbl:'Training Effectiveness' },
      { key:'budgetManagement',      lbl:'Budget Management' },
      { key:'timeManagement',        lbl:'Time Management' },
      { key:'employeeWellbeing',     lbl:'Employee Wellbeing' },
      { key:'businessReadiness',     lbl:'Business Readiness' }
    ];
    var dimColors = ['#4f46e5','#0d9488','#059669','#7c3aed','#d97706','#e11d48','#06b6d4','#0f172a'];

    var scoreDims = dims.map(function(d, i) {
      var v = scores[d.key] || 0;
      return '<div class="score-dim-row">' +
        '<div class="score-dim-header"><span class="score-dim-lbl">' + d.lbl + '</span><span class="score-dim-val">' + v + '</span></div>' +
        '<div class="score-dim-track"><div class="score-dim-fill" style="width:' + v + '%; background:' + dimColors[i] + '"></div></div>' +
      '</div>';
    }).join('');

    var badgesHtml = s.badges.length > 0 ?
      '<div class="badge-grid">' + s.badges.map(function(b) {
        return '<div class="badge-item"><span class="badge-icon">' + b.icon + '</span><span class="badge-name">' + b.name + '</span></div>';
      }).join('') + '</div>' :
      '<p class="text-sm c-muted">No badges this run — try a different strategy.</p>';

    var decisionRows = s.decisions.slice(0, 10).map(function(d, i) {
      return '<div class="dec-item">' +
        '<div class="dec-num">' + (i+1) + '</div>' +
        '<div class="dec-body">' +
          '<div class="dec-phase">' + d.phase + '</div>' +
          '<div class="dec-action">' + d.action + '</div>' +
          '<div class="dec-impact">' + d.impact + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    cont.innerHTML =
      '<div class="score-hero">' +
        '<div class="ph-eyebrow" style="color:rgba(255,255,255,0.4); text-align:center; margin-bottom:8px">Final Score</div>' +
        '<div class="score-hero-num" style="color:' + totalColor + '">' + scores.total + '</div>' +
        '<div class="score-hero-label">out of 100</div>' +
        '<div class="score-hero-verdict">' + verdict + '</div>' +
      '</div>' +

      '<div class="panel"><div class="panel-body">' +
        '<div class="panel-title">Performance breakdown</div>' +
        '<div class="score-dims">' + scoreDims + '</div>' +
      '</div></div>' +

      '<div class="panel"><div class="panel-body">' +
        '<div class="panel-title">Badges earned</div>' +
        badgesHtml +
      '</div></div>' +

      '<div class="panel">' +
        '<div class="panel-body" style="padding-bottom:0"><div class="panel-title">Decision log</div></div>' +
        '<div class="decision-list">' + decisionRows + '</div>' +
      '</div>' +

      '<div class="insight info">' +
        '<div class="insight-label">What BI supports HR</div>' +
        '<div class="insight-text">BI answers: <em>How many? Which skills? Which channel? Who to hire? Did training work?</em> Data-driven decisions reduce cost, improve quality, and accelerate readiness.</div>' +
      '</div>' +

      '<div class="btn-row">' +
        '<button class="btn-navy" onclick="window.HRApp.reset()">↩ Restart</button>' +
        '<button class="btn-outline" onclick="window.HRApp.replayDifferent()">🎲 Different Strategy</button>' +
      '</div>';

    // Animate score bars
    setTimeout(function() {
      document.querySelectorAll('.score-dim-fill').forEach(function(el) {
        el.style.transition = 'width 1s var(--ease)';
      });
    }, 100);
  },

  /* ═══════════════════════════════════════════════════════
     MODALS
  ═══════════════════════════════════════════════════════ */
  showEmployeeModal: function(empId) {
    var s   = window.HRState;
    var emp = s.employees.find(function(e) { return e.id === empId; });
    if (!emp) return;
    var trained = s.trainedEmployees.filter(function(t) { return t.empId === empId; });
    var riskColor = { LOW:'good', MEDIUM:'warn', HIGH:'bad' }[emp.retentionRisk] || '';

    this.showModal(
      '<button class="modal-close-btn" onclick="window.HRUI.closeModal()">✕</button>' +
      '<div class="modal-title">' + emp.name + '</div>' +
      '<div class="modal-sub">' + emp.role + ' · ' + emp.dept + ' · ' + emp.experience + ' yrs</div>' +
      '<div class="modal-attr-grid">' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Performance</div><div class="modal-attr-val">' + emp.performance + '/100</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Retention Risk</div><div class="modal-attr-val ' + riskColor + '">' + emp.retentionRisk + '</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Learning Potential</div><div class="modal-attr-val info">' + Math.round((emp.learningPotential||0.7)*100) + '%</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Promotion</div><div class="modal-attr-val">' + emp.promotionPotential + '</div></div>' +
      '</div>' +
      '<div class="modal-section-title">Skills</div>' +
      this.skillBar('Python', emp.python) + this.skillBar('ML', emp.ml) +
      this.skillBar('Cloud', emp.cloud) + this.skillBar('AI', emp.ai) +
      '<div class="modal-divider"></div>' +
      (trained.length > 0 ?
        '<div class="modal-section-title">Training Completed</div>' +
        trained.map(function(t) { return '<div class="emp-trained-note" style="margin-bottom:4px">✓ ' + t.programName + ': ' + t.skill.toUpperCase() + ' +' + t.gain + '</div>'; }).join('')
        : '<div class="text-sm c-muted">No training completed yet.</div>'
      )
    );
    this.animateSkills();
  },

  showCandidateModal: function(candId) {
    var s    = window.HRState;
    var cand = s.candidatePool.find(function(c) { return c.id === candId; });
    if (!cand) return;
    var isHired   = s.hiredCandidates.find(function(h) { return h.id === candId; });
    var hireCost  = Math.round(cand.expectedSalary * 0.5) + 50000;
    var canAfford = s.budget >= hireCost;
    var fitCls    = cand.cultureFit >= 80 ? 'good' : cand.cultureFit >= 60 ? 'warn' : 'bad';
    var riskCls   = cand.risk === 'LOW' ? 'good' : cand.risk === 'MEDIUM' ? 'warn' : 'bad';

    this.showModal(
      '<button class="modal-close-btn" onclick="window.HRUI.closeModal()">✕</button>' +
      '<div class="modal-title">' + cand.name + '</div>' +
      '<div class="modal-sub">Assessment: ' + cand.assessment + '/100 · ' + cand.experience + ' yrs exp</div>' +
      '<div class="modal-attr-grid">' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Salary</div><div class="modal-attr-val">₹' + (cand.expectedSalary/1000).toFixed(0) + 'K/mo</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Culture Fit</div><div class="modal-attr-val ' + fitCls + '">' + cand.cultureFit + '%</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Growth</div><div class="modal-attr-val">' + cand.growthPotential + '</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Risk</div><div class="modal-attr-val ' + riskCls + '">' + cand.risk + '</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Notice</div><div class="modal-attr-val">' + (cand.noticePeriod === 0 ? 'Immediate' : cand.noticePeriod + ' days') + '</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Hire Cost</div><div class="modal-attr-val warn">₹' + Math.round(hireCost/1000) + 'K</div></div>' +
      '</div>' +
      '<div class="modal-section-title">Skills</div>' +
      this.skillBar('Python', cand.python) + this.skillBar('ML', cand.ml) +
      this.skillBar('Cloud', cand.cloud) + this.skillBar('AI', cand.ai) +
      '<div class="modal-divider"></div>' +
      '<div class="insight" style="margin-bottom:0">' +
        '<div class="insight-label">Analysis</div>' +
        '<div class="insight-text"><strong>Strength:</strong> ' + (cand.strength || '—') + '<br><strong>Watch:</strong> ' + (cand.weakness || 'None noted') + '</div>' +
      '</div>' +
      '<div class="modal-actions">' +
        (isHired ?
          '<button class="btn-primary" disabled style="background:var(--emerald)">✓ Hired</button>' :
          (canAfford ?
            '<button class="btn-primary" onclick="window.HRUI.hireCandidateFlow(\'' + candId + '\'); window.HRUI.closeModal();">Hire ' + cand.name.split(' ')[0] + '</button>' :
            '<button class="btn-primary" disabled style="opacity:0.5">Insufficient budget</button>'
          )
        ) +
        '<button class="btn-ghost" onclick="window.HRUI.closeModal()">Close</button>' +
      '</div>'
    );
    this.animateSkills();
  },

  hireCandidateFlow: function(candId) {
    var result = window.HREngine.hireCandidate(candId);
    if (result) {
      var cand = result.cand;
      var emoji = result.moraleEffect > 0 ? '😊' : result.moraleEffect < 0 ? '😕' : '😐';
      this.toast('✓ ' + cand.name + ' hired! ' + emoji + ' Morale ' + (result.moraleEffect >= 0 ? '+' : '') + result.moraleEffect + '%', 'success');
      this.renderPhase(6);
    }
  },

  confirmTraining: function(empId, programId) {
    var s    = window.HRState;
    var emp  = s.employees.find(function(e) { return e.id === empId; });
    var prog = window.HRScenarios.trainingPrograms.find(function(p) { return p.id === programId; });
    if (!emp || !prog) return;

    var expMin = Math.round(prog.skillGain.min * (emp.learningPotential || 0.7));
    var expMax = Math.round(prog.skillGain.max * (emp.learningPotential || 0.7));

    this.showModal(
      '<button class="modal-close-btn" onclick="window.HRUI.closeModal()">✕</button>' +
      '<div class="modal-title">' + prog.icon + ' ' + prog.name + '</div>' +
      '<div class="modal-sub">Enrolling ' + emp.name + '</div>' +
      '<div class="modal-attr-grid">' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Cost</div><div class="modal-attr-val warn">₹' + (prog.cost/1000).toFixed(0) + 'K</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Duration</div><div class="modal-attr-val">' + prog.weeks + ' weeks</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Expected gain</div><div class="modal-attr-val good">+' + expMin + '–' + expMax + ' ' + prog.skillGain.skill.toUpperCase() + '</div></div>' +
        '<div class="modal-attr"><div class="modal-attr-lbl">Morale boost</div><div class="modal-attr-val good">+' + prog.moraleBoost + '%</div></div>' +
      '</div>' +
      '<div class="insight warn">' +
        '<div class="insight-label">Note</div>' +
        '<div class="insight-text">Actual gain depends on ' + emp.name.split(' ')[0] + '\'s learning potential (' + Math.round((emp.learningPotential||0.7)*100) + '%). Results will vary.</div>' +
      '</div>' +
      '<div class="modal-actions">' +
        '<button class="btn-primary" onclick="window.HRUI.executeTraining(\'' + empId + '\',\'' + programId + '\')">Confirm Training</button>' +
        '<button class="btn-ghost" onclick="window.HRUI.closeModal()">Cancel</button>' +
      '</div>'
    );
  },

  executeTraining: function(empId, programId) {
    var result = window.HREngine.startTraining(empId, programId);
    this.closeModal();
    if (result) {
      this.toast('✓ ' + result.emp.name + ' — ' + result.program.skillGain.skill.toUpperCase() + ' ' + result.before + '→' + result.after + ' (+' + result.gain + ')', 'success');
      this.renderPhase(7);
    }
  }
};
