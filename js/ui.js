window.HRUI = {
    printToTerminal: function(msg, type) {
        type = type || "normal";
        var out = document.getElementById("terminal-output");
        if (!out) return;
        var line = document.createElement("div");
        line.className = "terminal-line " + type;
        line.innerText = msg;
        out.appendChild(line);
        out.scrollTop = out.scrollHeight;
    },

    updateTopBar: function() {
        var state = window.HRState;
        var budgetEl = document.getElementById("top-budget");
        var timeEl   = document.getElementById("top-time");
        var wfEl     = document.getElementById("top-workforce");
        var moraleEl = document.getElementById("top-morale");
        if (!budgetEl || !timeEl || !wfEl) return;

        budgetEl.innerText = "\u20B9" + state.budget.toLocaleString('en-IN');
        timeEl.innerText   = state.currentDeadlineMonths + " Months";
        
        if (moraleEl) {
            moraleEl.innerText = state.morale + "%";
            moraleEl.style.color = state.morale >= 80 ? 'var(--success)' : state.morale >= 50 ? 'var(--warning)' : 'var(--danger)';
        }

        var totalReq   = state.required.ai  + state.required.ml  + state.required.data;
        var totalAvail = state.available.ai + state.available.ml + state.available.data;
        wfEl.innerText = totalAvail + " / " + totalReq + " positions";
    },

    renderCurrentStage: function() {
        var state     = window.HRState;
        var container = document.getElementById("dynamic-content");
        if (!container) return;
        container.innerHTML = "";

        if      (state.stage === 2)  this.renderStage2(container);
        else if (state.stage === 4)  this.renderStage4(container);
        else if (state.stage === 5)  this.renderStage5(container);
        else if (state.stage === 7)  this.renderStage7(container);
        else if (state.stage === 8)  this.renderStage8(container);
        else if (state.stage === 9)  this.renderStage9(container);
        else if (state.stage === 10) this.renderStage10(container);
    },

    // -------------------------------------------------------
    // Stage 2 — Workforce Analysis
    // -------------------------------------------------------
    renderStage2: function(container) {
        var s   = window.HRState;
        var gap = window.HRSim.calculateGap();

        var html = '<div class="panel">' +
            '<div class="panel-header">REQUIRED VS AVAILABLE</div>' +
            '<div class="grid-3 text-center">' +
              '<div>' +
                '<h3>AI Engineers</h3>' +
                '<div class="workforce-stats">' +
                  '<div class="stat-circle"><span class="label">REQ</span><span class="num">' + s.required.ai + '</span></div>' +
                  '<div class="stat-circle"><span class="label">AVAIL</span><span class="num">' + s.available.ai + '</span></div>' +
                '</div>' +
              '</div>' +
              '<div>' +
                '<h3>ML Engineers</h3>' +
                '<div class="workforce-stats">' +
                  '<div class="stat-circle"><span class="label">REQ</span><span class="num">' + s.required.ml + '</span></div>' +
                  '<div class="stat-circle"><span class="label">AVAIL</span><span class="num">' + s.available.ml + '</span></div>' +
                '</div>' +
              '</div>' +
              '<div>' +
                '<h3>Data Engineers</h3>' +
                '<div class="workforce-stats">' +
                  '<div class="stat-circle"><span class="label">REQ</span><span class="num">' + s.required.data + '</span></div>' +
                  '<div class="stat-circle"><span class="label">AVAIL</span><span class="num">' + s.available.data + '</span></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';

        if (!s.workforceAnalyzed) {
            html += '<div class="action-prompt text-center">' +
                '<button class="btn primary" onclick="window.HRSim.analyzeWorkforce()">ANALYZE WORKFORCE</button>' +
                '<p style="margin-top:10px; color:var(--text-muted); font-size:0.9rem">Or type <strong>analyze workforce</strong> in the terminal below.</p>' +
              '</div>';
            container.innerHTML = html;
            return;
        }

        var totalShortage = Math.max(0, gap.ai) + Math.max(0, gap.ml);

        html += '<div class="panel anim-fade-in" style="border-color: var(--danger)">' +
            '<h2 class="text-danger text-center">WORKFORCE SHORTAGE DETECTED</h2>' +
            '<div class="grid-3 text-center" style="margin-top:1rem">' +
              '<div><h4>AI Engineer</h4><p class="text-danger">Shortage: ' + gap.ai + '</p></div>' +
              '<div><h4>ML Engineer</h4><p class="text-danger">Shortage: ' + gap.ml + '</p></div>' +
              '<div><h4>Data Engineer</h4><p class="text-success">Surplus: ' + Math.abs(gap.data) + '</p></div>' +
            '</div>' +
            '<p class="text-center" style="margin-top:1rem; font-size:1.1rem; color:var(--warning)">' +
              'Total shortage: <strong>' + totalShortage + ' positions</strong>' +
            '</p>' +
            '<p class="text-center text-muted" style="margin-top:1rem">' +
              '<em>"Human Resource Planning begins by comparing the workforce required by the organization with the workforce currently available."</em>' +
            '</p>' +
          '</div>' +
          '<div class="action-prompt text-center anim-fade-in">' +
            '<h3>HR DECISION REQUIRED</h3>' +
            '<p>How should HR respond to the workforce shortage?</p>' +
            '<div class="flex-center gap-1" style="gap:1rem; margin-top:1rem; flex-wrap:wrap">' +
              '<button class="btn secondary" onclick="window.HRSim.choosePlan(\'recruit\')">RECRUIT</button>' +
              '<button class="btn secondary" onclick="window.HRSim.choosePlan(\'train\')">TRAIN / UPSKILL</button>' +
              '<button class="btn secondary" onclick="window.HRSim.choosePlan(\'combination\')">COMBINATION</button>' +
            '</div>' +
          '</div>';

        container.innerHTML = html;
    },

    // -------------------------------------------------------
    // Stage 4 — Employee Database & Training
    // -------------------------------------------------------
    renderStage4: function(container) {
        var s = window.HRState;
        var trainedCount = s.trainedEmployees.length;

        var html = '<div class="panel">' +
            '<div class="panel-header">INTERNAL EMPLOYEE DATABASE</div>' +
            '<div class="grid-2" id="employee-grid"></div>' +
          '</div>' +
          '<div class="action-prompt text-center" id="training-prompt">' +
            '<h3>CLOUD UPSKILLING PROGRAM</h3>' +
            '<p>Training Cost: \u20B930,000 per employee. Max: 2 employees. Trained so far: <span id="trained-count">' + trainedCount + '</span> / 2</p>' +
            '<p class="text-muted" style="margin-top:5px">Type <span class="text-primary">find skill gaps</span> to highlight candidates, then click an employee to train.</p>' +
            '<button class="btn primary" onclick="window.HRCommands.execute(\'show recruitment options\')" style="margin-top:15px">PROCEED TO RECRUITMENT &#8250;</button>' +
          '</div>';

        container.innerHTML = html;

        var grid = document.getElementById("employee-grid");
        s.employees.forEach(function(emp) {
            var div = document.createElement("div");
            div.innerHTML = window.HRUI.createEmployeeCard(emp);
            grid.appendChild(div.firstElementChild);
        });

        // Animate skill bars after DOM settles
        setTimeout(function() {
            var fills = document.querySelectorAll("#employee-grid .skill-fill[data-val]");
            fills.forEach(function(el) {
                el.style.width = el.getAttribute("data-val") + "%";
            });
        }, 80);
    },

    createEmployeeCard: function(emp) {
        var trained = window.HRState.trainedEmployees.includes(emp.id);
        var borderStyle = trained ? "border-color: var(--success); box-shadow: 0 0 8px rgba(16,185,129,0.4);" : "";
        var badge = trained ? '<div style="text-align:center; color:var(--success); font-size:0.8rem; font-weight:bold; margin-top:8px;">\u2713 TRAINED</div>' : "";

        return '<div class="card" id="emp-card-' + emp.id + '" style="' + borderStyle + '" onclick="window.HRUI.showEmployeeModal(\'' + emp.id + '\')">' +
            '<h4>' + emp.name + ' <span class="text-muted" style="font-size:0.8rem">(' + emp.id + ')</span></h4>' +
            '<p class="text-primary" style="font-size:0.9rem">' + emp.role + ' | ' + emp.experience + ' yrs</p>' +
            '<div class="skill-bar-container">' +
              '<span class="skill-label">Python</span>' +
              '<div class="skill-track"><div class="skill-fill" data-val="' + emp.python + '"></div></div>' +
              '<span class="skill-val">' + emp.python + '</span>' +
            '</div>' +
            '<div class="skill-bar-container">' +
              '<span class="skill-label">Mach. Learning</span>' +
              '<div class="skill-track"><div class="skill-fill" data-val="' + emp.ml + '"></div></div>' +
              '<span class="skill-val">' + emp.ml + '</span>' +
            '</div>' +
            '<div class="skill-bar-container">' +
              '<span class="skill-label">Cloud</span>' +
              '<div class="skill-track"><div class="skill-fill" id="cloud-fill-' + emp.id + '" data-val="' + emp.cloud + '"></div></div>' +
              '<span class="skill-val" id="cloud-val-' + emp.id + '">' + emp.cloud + '</span>' +
            '</div>' +
            '<div class="skill-bar-container">' +
              '<span class="skill-label">AI</span>' +
              '<div class="skill-track"><div class="skill-fill" data-val="' + emp.ai + '"></div></div>' +
              '<span class="skill-val">' + emp.ai + '</span>' +
            '</div>' +
            badge +
          '</div>';
    },

    renderSkillGaps: function() {
        var candidates = window.HRSim.getTrainableEmployees();
        this.printToTerminal("Skill gap analysis complete:", "success");
        this.printToTerminal("Employees with strong Python & ML but LOW Cloud (\u003c60) — upskilling recommended:", "success");
        candidates.forEach(function(c) {
            window.HRUI.printToTerminal("  \u2192 " + c.name + " (" + c.id + ") — Cloud: " + c.cloud, "warning");
        });

        // Highlight cloud bars in yellow
        candidates.forEach(function(c) {
            var el = document.getElementById("cloud-fill-" + c.id);
            if (el) el.style.background = "var(--warning)";
        });
    },

    renderTrainingAnimation: function(res) {
        var modal = document.getElementById("modal-content");
        modal.innerHTML =
            '<h2 class="text-primary text-center">TRAINING PROGRAM STARTING...</h2>' +
            '<h3 class="text-center">' + res.emp.name + ' (' + res.emp.id + ')</h3>' +
            '<div style="margin:2rem 0; font-family:monospace; font-size:1.1rem; text-align:center" id="training-modules"></div>' +
            '<div class="skill-bar-container" style="margin-top:2rem">' +
              '<span class="skill-label">Cloud Skill</span>' +
              '<div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + res.oldCloud + '%; background:var(--success); transition: width 1.2s ease-out;" id="training-skill-bar"></div></div>' +
              '<span class="skill-val" id="training-skill-val">' + res.oldCloud + '</span>' +
            '</div>';

        document.getElementById("modal-overlay").classList.remove("hidden");

        var modules = [
            "Module 1: Cloud Fundamentals",
            "Module 2: Cloud Architecture",
            "Module 3: Deployment",
            "Module 4: Cloud Security"
        ];
        var modEl = document.getElementById("training-modules");
        var i = 0;

        var interval = setInterval(function() {
            if (i < modules.length) {
                var d = document.createElement("div");
                d.innerText = modules[i];
                modEl.appendChild(d);
                i++;
            } else {
                clearInterval(interval);

                var done = document.createElement("div");
                done.className = "text-success";
                done.style.marginTop = "1rem";
                done.style.fontWeight = "bold";
                done.innerText = "\u2713 TRAINING COMPLETED";
                modEl.appendChild(done);

                // Show before/after summary
                var summary = document.createElement("div");
                summary.style.marginTop = "1rem";
                summary.innerHTML =
                    '<p>Before: <span class="text-danger">' + res.oldCloud + '</span> &rarr; After: <span class="text-success">' + res.newCloud + '</span></p>';
                modEl.appendChild(summary);

                setTimeout(function() {
                    // Animate modal bar
                    var bar = document.getElementById("training-skill-bar");
                    if (bar) bar.style.width = res.newCloud + "%";
                    window.HRAnim.animateValue(document.getElementById("training-skill-val"), res.oldCloud, res.newCloud, 1200);

                    // Also update the employee card bars in background (if visible)
                    var mainBar = document.getElementById("cloud-fill-" + res.emp.id);
                    if (mainBar) {
                        mainBar.style.background = "var(--success)";
                        mainBar.setAttribute("data-val", res.newCloud);
                        mainBar.style.width = res.newCloud + "%";
                    }
                    var mainVal = document.getElementById("cloud-val-" + res.emp.id);
                    if (mainVal) mainVal.innerText = res.newCloud;

                    // Update trained count label if visible
                    var tc = document.getElementById("trained-count");
                    if (tc) tc.innerText = window.HRState.trainedEmployees.length;

                }, 400);
            }
        }, 700);
    },

    // -------------------------------------------------------
    // Stage 5 — Recruitment Channels
    // -------------------------------------------------------
    renderStage5: function(container) {
        var plan = window.HRState.planChosen;
        var planNote = plan === 'combination'
            ? '<p class="text-warning">Plan: <strong>Combination</strong> — Train internally + recruit externally.</p>'
            : plan === 'train'
            ? '<p class="text-warning">Plan: <strong>Train / Upskill</strong> — Internal employees will be developed, but recruitment is still needed for the headcount gap.</p>'
            : '<p class="text-warning">Plan: <strong>Recruit</strong> — Fill the workforce gap externally.</p>';

        container.innerHTML =
            '<div class="panel">' +
              '<div class="panel-header">RECRUITMENT CENTER</div>' +
              '<div class="grid-2">' +
                '<div>' +
                  '<h3 class="text-primary">POSITION: AI ENGINEER</h3>' +
                  '<p><strong>OPENINGS:</strong> 4</p>' +
                  '<p><strong>REQUIRED SKILLS:</strong> Python, Machine Learning, Cloud, AI</p>' +
                  '<p><strong>EXPERIENCE:</strong> 2+ years</p>' +
                '</div>' +
                '<div>' + planNote + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="action-prompt text-center">' +
              '<h3>CHOOSE RECRUITMENT SOURCE</h3>' +
              '<div class="grid-3" style="margin-top:1.5rem">' +
                '<div class="card" style="text-align:center; cursor:pointer" onclick="window.HRSim.postJob(\'network\')">' +
                  '<h4>PROFESSIONAL NETWORK</h4>' +
                  '<p class="text-muted" style="margin-top:5px">Reach: 1,240+ applicants</p>' +
                  '<p class="text-warning">Cost: \u20B920,000</p>' +
                  '<button class="btn primary small" style="margin-top:10px; pointer-events:none">PUBLISH JOB</button>' +
                '</div>' +
                '<div class="card" style="text-align:center; cursor:pointer" onclick="window.HRSim.postJob(\'college\')">' +
                  '<h4>COLLEGE RECRUITMENT</h4>' +
                  '<p class="text-muted" style="margin-top:5px">Reach: 350+ applicants</p>' +
                  '<p class="text-warning">Cost: \u20B915,000</p>' +
                  '<button class="btn primary small" style="margin-top:10px; pointer-events:none">START DRIVE</button>' +
                '</div>' +
                '<div class="card" style="text-align:center; cursor:pointer" onclick="window.HRSim.postJob(\'referral\')">' +
                  '<h4>EMPLOYEE REFERRAL</h4>' +
                  '<p class="text-muted" style="margin-top:5px">Reach: 120+ applicants</p>' +
                  '<p class="text-warning">Cost: \u20B910,000</p>' +
                  '<button class="btn primary small" style="margin-top:10px; pointer-events:none">ACTIVATE</button>' +
                '</div>' +
              '</div>' +
            '</div>';
    },

    // -------------------------------------------------------
    // Stage 7 — Candidate Screening (funnel + candidate cards)
    // -------------------------------------------------------
    renderStage7: function(container) {
        var s = window.HRState;
        var channelLabel = s.recruitmentChannel ? s.recruitmentChannel.toUpperCase() : "";

        container.innerHTML =
            '<div class="panel">' +
              '<div class="panel-header">RECRUITMENT FUNNEL \u2014 ' + channelLabel + '</div>' +
              '<div style="display:flex; gap:2rem; align-items:flex-start; flex-wrap:wrap">' +
                '<div style="flex:1; min-width:200px" id="funnel-container">' +
                  '<div class="funnel-stage"><span>APPLICATIONS</span><span id="f-apps" class="text-primary" style="font-weight:bold; font-size:1.2rem">0</span></div>' +
                  '<div class="funnel-stage" style="opacity:0.3" id="f-stage-short"><span>SHORTLISTED</span><span>5</span></div>' +
                  '<div class="funnel-stage" style="opacity:0.3" id="f-stage-assess"><span>ASSESSMENT</span><span>4</span></div>' +
                  '<div class="funnel-stage" style="opacity:0.3" id="f-stage-int"><span>INTERVIEW</span><span>4</span></div>' +
                '</div>' +
                '<div style="flex:1; min-width:200px; text-align:center; padding-top:10px" id="screening-action-area">' +
                  '<p class="text-muted">Applications arriving...</p>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="panel" style="margin-top:1.5rem">' +
              '<div class="panel-header">CANDIDATE DATABASE</div>' +
              '<p class="text-muted" style="margin-bottom:1rem">Screen the applicants first to enable candidate selection.</p>' +
              '<div class="grid-3" id="candidate-grid" style="opacity:0.4; pointer-events:none">' +
              '</div>' +
            '</div>';

        // Populate candidate cards (grayed out until screened)
        var grid = document.getElementById("candidate-grid");
        s.candidates.forEach(function(cand) {
            var div = document.createElement("div");
            div.innerHTML = window.HRUI.createCandidateCard(cand);
            grid.appendChild(div.firstElementChild);
        });

        // Animate application count
        var fApps = document.getElementById("f-apps");
        window.HRAnim.animateValue(fApps, 0, s.applications, 1800);

        // After animation, reveal screen button
        setTimeout(function() {
            var actionArea = document.getElementById("screening-action-area");
            if (!actionArea) return;
            actionArea.innerHTML =
                '<h3 style="margin-bottom:1rem">HR TEAM: Screen the applicants</h3>' +
                '<button class="btn primary" onclick="window.HRSim.screenCandidates()">SCREEN CANDIDATES</button>' +
                '<p class="text-muted" style="margin-top:1rem; font-size:0.9rem">Or type <strong>screen candidates</strong> in the terminal.</p>';
        }, 2000);
    },

    createCandidateCard: function(cand) {
        var isHired = window.HRState.hiredCandidates.includes(cand.id);
        var hiredBadge = isHired ? '<div style="text-align:center; color:var(--success); font-weight:bold; margin-top:8px;">\u2713 HIRED</div>' : '';
        var selectedClass = isHired ? " selected" : "";

        return '<div class="card' + selectedClass + '" id="cand-card-' + cand.id + '" onclick="window.HRUI.showCandidateModal(\'' + cand.id + '\')">' +
            '<h4>' + cand.name + '</h4>' +
            '<p class="text-primary" style="font-size:0.9rem">Exp: ' + cand.experience + ' yrs | Score: ' + cand.assessment + '</p>' +
            '<div class="skill-bar-container" style="margin-top:8px">' +
              '<span class="skill-label">Python</span>' +
              '<div class="skill-track"><div class="skill-fill" style="width:' + cand.python + '%"></div></div>' +
              '<span class="skill-val">' + cand.python + '</span>' +
            '</div>' +
            '<div class="skill-bar-container">' +
              '<span class="skill-label">ML</span>' +
              '<div class="skill-track"><div class="skill-fill" style="width:' + cand.ml + '%"></div></div>' +
              '<span class="skill-val">' + cand.ml + '</span>' +
            '</div>' +
            '<div class="skill-bar-container">' +
              '<span class="skill-label">Cloud</span>' +
              '<div class="skill-track"><div class="skill-fill" style="width:' + cand.cloud + '%"></div></div>' +
              '<span class="skill-val">' + cand.cloud + '</span>' +
            '</div>' +
            '<div class="skill-bar-container">' +
              '<span class="skill-label">AI</span>' +
              '<div class="skill-track"><div class="skill-fill" style="width:' + cand.ai + '%"></div></div>' +
              '<span class="skill-val">' + cand.ai + '</span>' +
            '</div>' +
            hiredBadge +
          '</div>';
    },

    // -------------------------------------------------------
    // Stage 8 — Hiring Decision
    // -------------------------------------------------------
    renderStage8: function(container) {
        var s = window.HRState;
        var funnelData = window.HRData.funnel[s.recruitmentChannel] || { apps: s.applications, short: 5, assess: 4, interview: 4 };

        container.innerHTML =
            '<div class="panel">' +
              '<div class="panel-header">RECRUITMENT FUNNEL \u2014 SCREENING COMPLETE</div>' +
              '<div style="display:flex; gap:2rem; align-items:flex-start; flex-wrap:wrap">' +
                '<div style="flex:1; min-width:200px">' +
                  '<div class="funnel-stage"><span>APPLICATIONS</span><span class="text-primary" style="font-weight:bold">' + s.applications + '</span></div>' +
                  '<div class="funnel-stage"><span>SHORTLISTED</span><span class="text-primary" style="font-weight:bold">' + funnelData.short + '</span></div>' +
                  '<div class="funnel-stage"><span>ASSESSMENT</span><span class="text-primary" style="font-weight:bold">' + funnelData.assess + '</span></div>' +
                  '<div class="funnel-stage"><span>INTERVIEW</span><span class="text-primary" style="font-weight:bold">' + funnelData.interview + '</span></div>' +
                '</div>' +
                '<div style="flex:1; min-width:200px; padding:15px" class="action-prompt">' +
                  '<h2 class="text-warning">YOU NEED TO HIRE 4 AI ENGINEERS.</h2>' +
                  '<p style="margin-top:8px">Click a candidate card to view their full profile, then hire.</p>' +
                  '<p style="margin-top:8px; font-size:1.1rem">Hired: <strong><span id="hired-count">' + s.hiredCandidates.length + '</span> / 4</strong></p>' +
                  '<p class="text-muted" style="margin-top:8px; font-size:0.85rem">Cost: \u20B92,00,000 per hire | Budget: <span id="hire-budget">\u20B9' + s.budget.toLocaleString('en-IN') + '</span></p>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="panel" style="margin-top:1.5rem">' +
              '<div class="panel-header">FINAL CANDIDATE POOL \u2014 SELECT YOUR HIRES</div>' +
              '<div class="grid-3" id="candidate-grid"></div>' +
            '</div>';

        var grid = document.getElementById("candidate-grid");
        s.candidates.forEach(function(cand) {
            var div = document.createElement("div");
            div.innerHTML = window.HRUI.createCandidateCard(cand);
            grid.appendChild(div.firstElementChild);
        });
    },

    // -------------------------------------------------------
    // Stage 9 — Deadline Event + Training Evaluation
    // -------------------------------------------------------
    renderStage9: function(container) {
        var s = window.HRState;

        var html =
            '<div class="panel anim-fade-in" style="border-color:var(--danger); margin-bottom:1.5rem">' +
              '<h2 style="text-align:center; color:var(--danger)">&#128680; CLIENT UPDATE</h2>' +
              '<h3 style="text-align:center; margin-top:0.5rem">The client has moved the project deadline.</h3>' +
              '<div style="display:flex; justify-content:center; gap:3rem; margin-top:1.5rem; font-size:1.2rem">' +
                '<div style="text-align:center">' +
                  '<p class="text-muted">Old deadline:</p>' +
                  '<p style="text-decoration:line-through; color:var(--danger)">6 months</p>' +
                '</div>' +
                '<div style="text-align:center">' +
                  '<p class="text-muted">New deadline:</p>' +
                  '<p class="text-warning" style="font-weight:bold; font-size:1.5rem">4 months</p>' +
                '</div>' +
              '</div>' +
              '<p style="text-align:center; margin-top:1.5rem; color:var(--warning)">HR TEAM: Can your workforce plan still deliver the project?</p>' +
            '</div>';

        if (s.trainedEmployees.length > 0) {
            html += '<div class="panel">' +
                '<div class="panel-header">TRAINING EVALUATION</div>' +
                '<p>Before concluding, we must evaluate whether the training program was effective.</p>' +
                '<div class="grid-2" style="margin-top:1.5rem">';

            s.trainedEmployees.forEach(function(empId) {
                var emp = s.employees.find(function(e) { return e.id === empId; });
                if (!emp) return;
                // Calculate the original Cloud value (current minus 35, floored at 0)
                var afterCloud  = emp.cloud;
                var beforeCloud = Math.max(0, afterCloud - 35);

                html += '<div class="card" style="text-align:center">' +
                    '<h4>' + emp.name + ' (' + emp.id + ')</h4>' +
                    '<p class="text-muted">Cloud Skill</p>' +
                    '<p>Before: <span class="text-danger">' + beforeCloud + '</span> &rarr; After: <span class="text-success">' + afterCloud + '</span></p>' +
                    '<div class="skill-bar-container" style="margin-top:10px">' +
                      '<span class="skill-label">Before</span>' +
                      '<div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + beforeCloud + '%; background:var(--danger)"></div></div>' +
                    '</div>' +
                    '<div class="skill-bar-container">' +
                      '<span class="skill-label">After</span>' +
                      '<div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + afterCloud + '%; background:var(--success)"></div></div>' +
                    '</div>' +
                  '</div>';
            });

            html += '</div>' +
                '<div class="action-prompt" style="margin-top:2rem; text-align:center">' +
                  '<h3>Project Performance Simulation</h3>' +
                  '<p>Before training: <span class="text-danger">62% project readiness</span></p>' +
                  '<p>After training: <span class="text-success">87% project readiness</span></p>' +
                  '<h4 style="margin:1.5rem 0">Was the training effective?</h4>' +
                  '<button class="btn secondary" style="margin-right:10px" onclick="window.HRUI.showEvalResult(\'yes\')">YES</button>' +
                  '<button class="btn secondary" onclick="window.HRUI.showEvalResult(\'no\')">NO</button>' +
                '</div>' +
                '<div id="eval-result" style="text-align:center; margin-top:1.5rem; font-weight:bold"></div>' +
              '</div>';
        } else {
            html += '<div class="action-prompt text-center">' +
                '<p>No training was conducted in this simulation path.</p>' +
                '<button class="btn primary" onclick="window.HRCommands.execute(\'show dashboard\')" style="margin-top:1rem">GENERATE FINAL BI DASHBOARD</button>' +
              '</div>';
        }

        container.innerHTML = html;
    },

    showEvalResult: function(ans) {
        var res = document.getElementById("eval-result");
        if (!res) return;

        if (ans === 'yes') {
            res.innerHTML = '<span class="text-success">\u2714 Correct. Training effectiveness is evaluated by comparing intended capability improvement with actual results. The Cloud skill improvement from ~45 to ~80 represents a measurable, meaningful gain.</span>';
        } else {
            res.innerHTML = '<span class="text-warning">Training completion does not automatically mean training was effective. We must measure the actual performance improvement against the intended target.</span>';
        }

        setTimeout(function() {
            var res2 = document.getElementById("eval-result");
            if (res2) {
                var btn = document.createElement("div");
                btn.style.marginTop = "2rem";
                btn.innerHTML = '<button class="btn primary" onclick="window.HRCommands.execute(\'show dashboard\')">GENERATE FINAL BI DASHBOARD</button>';
                res2.appendChild(btn);
            }
        }, 1500);
    },

    // -------------------------------------------------------
    // Stage 10 — BI Dashboard
    // -------------------------------------------------------
    renderStage10: function(container) {
        var s         = window.HRState;
        var readiness = window.HRSim.calculateReadiness();
        var totalReq  = s.required.ai + s.required.ml + s.required.data;
        var totalAvail= s.available.ai + s.available.ml + s.available.data;
        var readinessColor = readiness >= 80 ? 'var(--success)' : readiness >= 60 ? 'var(--warning)' : 'var(--danger)';

        var html =
            '<div class="panel">' +
              '<h1 style="text-align:center; color:var(--primary); letter-spacing:2px; margin-bottom:0.3rem">NOVATECH AI</h1>' +
              '<p style="text-align:center; color:var(--text-muted); letter-spacing:2px; margin-bottom:2rem; font-size:0.9rem">HR WORKFORCE INTELLIGENCE DASHBOARD</p>' +

              '<div class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr);">' +
                '<div class="kpi-card">' +
                  '<div class="label">Workforce Coverage</div>' +
                  '<div class="value text-success">' + totalAvail + ' / ' + totalReq + '</div>' +
                '</div>' +
                '<div class="kpi-card">' +
                  '<div class="label">Candidates Hired</div>' +
                  '<div class="value text-primary">' + s.hiredCandidates.length + '</div>' +
                '</div>' +
                '<div class="kpi-card">' +
                  '<div class="label">Training Participants</div>' +
                  '<div class="value" style="color:var(--secondary)">' + s.trainedEmployees.length + '</div>' +
                '</div>' +
                '<div class="kpi-card">' +
                  '<div class="label">Remaining Budget</div>' +
                  '<div class="value text-warning">\u20B9' + (s.budget / 100000).toFixed(1) + 'L</div>' +
                '</div>' +
                '<div class="kpi-card">' +
                  '<div class="label">Applications Received</div>' +
                  '<div class="value text-primary">' + (s.applications || 0) + '</div>' +
                '</div>' +
                '<div class="kpi-card">' +
                  '<div class="label">Recruitment Cost</div>' +
                  '<div class="value text-danger">\u20B9' + (s.recruitmentCost / 100000).toFixed(1) + 'L</div>' +
                '</div>' +
                '<div class="kpi-card">' +
                  '<div class="label">Training Cost</div>' +
                  '<div class="value text-warning">\u20B9' + (s.trainingCost / 1000).toFixed(0) + 'K</div>' +
                '</div>' +
                '<div class="kpi-card">' +
                  '<div class="label">Deadline</div>' +
                  '<div class="value ' + (s.deadlineChanged ? 'text-danger' : 'text-success') + '">' + s.currentDeadlineMonths + ' Months</div>' +
                '</div>' +
                '<div class="kpi-card">' +
                  '<div class="label">Employee Morale</div>' +
                  '<div class="value" style="color:' + (s.morale >= 80 ? 'var(--success)' : s.morale >= 50 ? 'var(--warning)' : 'var(--danger)') + '">' + s.morale + '%</div>' +
                '</div>' +
              '</div>' +

              '<div class="grid-2" style="margin-top:2rem">' +
                '<div class="card">' +
                  '<h3 style="text-align:center; margin-bottom:1rem">Operational Readiness</h3>' +
                  '<div style="display:flex; justify-content:center; align-items:center; height:130px">' +
                    '<span style="font-size:4rem; font-weight:800; color:' + readinessColor + '">' + readiness + '%</span>' +
                  '</div>' +
                  '<p style="text-align:center; color:var(--text-muted); font-size:0.85rem">Based on workforce coverage, training & budget</p>' +
                '</div>' +
                '<div class="card">' +
                  '<h3 style="text-align:center; margin-bottom:1rem">Recruitment Funnel</h3>' +
                  '<div style="padding:5px">' +
                    '<div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--glass-border); padding:8px 0"><span>Applications</span><span class="text-primary">' + (s.applications || 0) + '</span></div>' +
                    '<div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--glass-border); padding:8px 0"><span>Shortlisted</span><span class="text-primary">5</span></div>' +
                    '<div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--glass-border); padding:8px 0"><span>Interviewed</span><span class="text-primary">4</span></div>' +
                    '<div style="display:flex; justify-content:space-between; padding:8px 0"><span>Hired</span><span class="text-success">' + s.hiredCandidates.length + '</span></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<div style="text-align:center; margin-top:2rem">' +
                '<button class="btn primary" onclick="window.HRUI.renderFinalSummary()">SHOW FINAL EDUCATIONAL SUMMARY &#8250;</button>' +
              '</div>' +
            '</div>';

        container.innerHTML = html;
    },

    // -------------------------------------------------------
    // Final Summary
    // -------------------------------------------------------
    renderFinalSummary: function() {
        var container = document.getElementById("dynamic-content");
        container.innerHTML =
            '<div class="panel anim-fade-in" style="padding:3rem 2rem; text-align:center">' +
              '<h1 style="color:var(--primary); font-size:2.2rem; margin-bottom:2rem">YOU JUST RAN AN HR DEPARTMENT.</h1>' +

              '<div style="display:flex; flex-direction:column; align-items:center; gap:8px; font-family:monospace; font-size:1.15rem; color:var(--secondary); margin-bottom:3rem">' +
                '<div>BUSINESS REQUIREMENT</div>' +
                '<div style="color:var(--text-muted)">&#8595;</div>' +
                '<div>WORKFORCE PLANNING</div>' +
                '<div style="color:var(--text-muted)">&#8595;</div>' +
                '<div>GAP ANALYSIS</div>' +
                '<div style="color:var(--text-muted)">&#8595;</div>' +
                '<div>RECRUITMENT / TRAINING</div>' +
                '<div style="color:var(--text-muted)">&#8595;</div>' +
                '<div>SELECTION</div>' +
                '<div style="color:var(--text-muted)">&#8595;</div>' +
                '<div>TRAINING EVALUATION</div>' +
                '<div style="color:var(--text-muted)">&#8595;</div>' +
                '<div style="color:var(--success); font-weight:bold">BUSINESS READINESS</div>' +
              '</div>' +

              '<div class="grid-2" style="text-align:left; gap:2rem; max-width:900px; margin:0 auto">' +
                '<div>' +
                  '<h3 class="text-primary">Human Resources</h3>' +
                  '<p class="text-muted">Managing the people and capabilities needed by an organization.</p>' +
                  '<h3 class="text-primary" style="margin-top:1.5rem">Human Resource Planning</h3>' +
                  '<p class="text-muted">Determining how many people and what capabilities are required, then comparing them with what is available.</p>' +
                  '<h3 class="text-primary" style="margin-top:1.5rem">Recruitment</h3>' +
                  '<p class="text-muted">Finding and attracting suitable candidates for vacancies through appropriate channels.</p>' +
                '</div>' +
                '<div>' +
                  '<h3 class="text-primary">Training and Development</h3>' +
                  '<p class="text-muted">Improving employee capabilities for current and future responsibilities. Effectiveness must be measured.</p>' +
                  '<div class="action-prompt" style="margin-top:1.5rem; background:rgba(14,165,233,0.08); border-color:var(--primary)">' +
                    '<h3 style="color:var(--primary)">Business Intelligence</h3>' +
                    '<p style="color:var(--text-main)">Using workforce and recruitment data to support better HR decisions — answering <em>how many, what skills, where to recruit, who to hire, did training work?</em></p>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<div style="margin-top:3rem">' +
                '<button class="btn secondary" onclick="window.HRApp.resetSimulation()">RESTART SIMULATION</button>' +
              '</div>' +
            '</div>';
    },

    // -------------------------------------------------------
    // Modals
    // -------------------------------------------------------
    showEmployeeModal: function(id) {
        var emp = window.HRState.employees.find(function(e) { return e.id === id; });
        if (!emp) return;

        var isTrained  = window.HRState.trainedEmployees.includes(id);
        var trainedBadge = isTrained ? '<p class="text-success" style="margin-top:5px">\u2713 Training completed</p>' : '';

        var trainBtn = '';
        if (window.HRState.stage === 4 && !isTrained) {
            trainBtn = '<div style="margin-top:2rem; text-align:center">' +
                '<button class="btn primary" onclick="var r=window.HRSim.trainEmployee(\'' + emp.id + '\'); if(r){window.HRUI.renderTrainingAnimation(r);}">TRAIN THIS EMPLOYEE</button>' +
              '</div>';
        }

        document.getElementById("modal-content").innerHTML =
            '<h2 class="text-primary">' + emp.name + '</h2>' +
            '<p class="text-muted">' + emp.role + ' | ' + emp.dept + '</p>' +
            trainedBadge +
            '<hr style="border:0; border-top:1px solid var(--glass-border); margin:1rem 0">' +
            '<p><strong>Employee ID:</strong> ' + emp.id + '</p>' +
            '<p><strong>Experience:</strong> ' + emp.experience + ' years</p>' +
            '<div style="margin-top:1rem">' +
              '<div class="skill-bar-container"><span class="skill-label">Python</span><div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + emp.python + '%"></div></div><span class="skill-val">' + emp.python + '</span></div>' +
              '<div class="skill-bar-container"><span class="skill-label">Mach. Learning</span><div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + emp.ml + '%"></div></div><span class="skill-val">' + emp.ml + '</span></div>' +
              '<div class="skill-bar-container"><span class="skill-label">Cloud</span><div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + emp.cloud + '%; background:' + (isTrained ? 'var(--success)' : 'var(--primary)') + '"></div></div><span class="skill-val">' + emp.cloud + '</span></div>' +
              '<div class="skill-bar-container"><span class="skill-label">AI</span><div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + emp.ai + '%"></div></div><span class="skill-val">' + emp.ai + '</span></div>' +
            '</div>' +
            trainBtn;

        document.getElementById("modal-overlay").classList.remove("hidden");
    },

    showCandidateModal: function(id) {
        var cand = window.HRState.candidates.find(function(c) { return c.id === id; });
        if (!cand) return;

        var isHired = window.HRState.hiredCandidates.includes(id);
        var validIds = ['B', 'C', 'D', 'E'];
        var isEligible = validIds.includes(id);

        var actionHtml = '';
        if (window.HRState.stage === 8) {
            if (isHired) {
                actionHtml = '<h3 class="text-success" style="text-align:center; margin-top:1.5rem">\u2713 ALREADY HIRED</h3>';
            } else if (isEligible) {
                actionHtml = '<div style="text-align:center; margin-top:1.5rem">' +
                    '<button class="btn primary" onclick="window.HRSim.hireCandidate(\'' + cand.id + '\'); document.getElementById(\'modal-overlay\').classList.add(\'hidden\');">HIRE THIS CANDIDATE</button>' +
                  '</div>';
            } else {
                actionHtml = '<p class="text-danger" style="text-align:center; margin-top:1.5rem">This candidate did not pass the minimum screening criteria.</p>';
            }
        }

        document.getElementById("modal-content").innerHTML =
            '<h2 class="text-primary">' + cand.name + '</h2>' +
            '<p class="text-muted">Candidate ' + cand.id + ' | Exp: ' + cand.experience + ' yrs | Assessment: ' + cand.assessment + '/100</p>' +
            '<hr style="border:0; border-top:1px solid var(--glass-border); margin:1rem 0">' +
            '<div>' +
              '<div class="skill-bar-container"><span class="skill-label">Python</span><div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + cand.python + '%"></div></div><span class="skill-val">' + cand.python + '</span></div>' +
              '<div class="skill-bar-container"><span class="skill-label">Mach. Learning</span><div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + cand.ml + '%"></div></div><span class="skill-val">' + cand.ml + '</span></div>' +
              '<div class="skill-bar-container"><span class="skill-label">Cloud</span><div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + cand.cloud + '%"></div></div><span class="skill-val">' + cand.cloud + '</span></div>' +
              '<div class="skill-bar-container"><span class="skill-label">AI</span><div class="skill-track" style="flex:1"><div class="skill-fill" style="width:' + cand.ai + '%"></div></div><span class="skill-val">' + cand.ai + '</span></div>' +
            '</div>' +
            (!isEligible && window.HRState.stage === 8 ? '' : '') +
            actionHtml;

        document.getElementById("modal-overlay").classList.remove("hidden");
    }
};
