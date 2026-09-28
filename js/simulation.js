window.HRSim = {
    calculateGap: function() {
        var state = window.HRState;
        return {
            ai:   state.required.ai   - state.available.ai,
            ml:   state.required.ml   - state.available.ml,
            data: state.required.data - state.available.data
        };
    },

    analyzeWorkforce: function() {
        window.HRState.workforceAnalyzed = true;
        window.HRState.stage = 2;
        // Morale drop due to workforce shortage realization
        window.HRState.morale = Math.max(0, window.HRState.morale - 10);
        window.HRUI.updateTopBar();
        window.HRUI.renderCurrentStage();
        window.HRUI.printToTerminal("Workforce analysis complete. Shortage detected. Morale dropped.", "warning");
    },

    choosePlan: function(plan) {
        window.HRState.planChosen = plan;
        window.HRState.decisions.push("Plan chosen: " + plan.toUpperCase());

        if (plan === 'recruit') {
            // Go directly to recruitment channel selection
            window.HRState.stage = 5;
        } else if (plan === 'train') {
            // Show employee database for training
            window.HRState.stage = 4;
        } else {
            // Combination: start with training, then recruit
            window.HRState.stage = 4;
        }
        window.HRUI.renderCurrentStage();
    },

    getTrainableEmployees: function() {
        return window.HRState.employees.filter(function(e) {
            return e.cloud < 60 && e.python > 80 && e.ml > 80;
        });
    },

    trainEmployee: function(empId) {
        var state = window.HRState;

        if (state.trainedEmployees.length >= 2) {
            window.HRUI.printToTerminal("Maximum training capacity reached (2 employees).", "error");
            return false;
        }
        if (state.trainedEmployees.includes(empId)) {
            window.HRUI.printToTerminal("Employee " + empId + " has already completed this training program.", "error");
            return false;
        }

        var cost = window.HRData.costs.training;
        if (state.budget < cost) {
            window.HRUI.printToTerminal("INSUFFICIENT HR BUDGET", "error");
            return false;
        }

        var emp = state.employees.find(function(e) { return e.id === empId; });
        if (!emp) {
            window.HRUI.printToTerminal("Employee " + empId + " not found. Type 'show employees' to see available employee IDs.", "error");
            return false;
        }

        // Store before value for display
        var oldCloud = emp.cloud;

        // Apply training
        state.budget -= cost;
        state.trainingCost += cost;
        state.trainedEmployees.push(empId);
        state.morale = Math.min(100, state.morale + 5); // Morale boost
        state.decisions.push("Trained " + emp.name + " (" + empId + ")");

        // Increase Cloud skill by 35, max 100
        emp.cloud = Math.min(100, emp.cloud + 35);

        window.HRUI.updateTopBar();
        window.HRUI.printToTerminal("Training started for " + emp.name + "... Morale increased.", "success");

        return { emp: emp, oldCloud: oldCloud, newCloud: emp.cloud };
    },

    postJob: function(channel) {
        var state = window.HRState;
        var cost = 0;

        if (channel === 'network')       cost = window.HRData.costs.network;
        else if (channel === 'college')  cost = window.HRData.costs.college;
        else if (channel === 'referral') cost = window.HRData.costs.referral;
        else {
            window.HRUI.printToTerminal("Unknown recruitment channel.", "error");
            return false;
        }

        if (state.budget < cost) {
            window.HRUI.printToTerminal("INSUFFICIENT HR BUDGET", "error");
            return false;
        }

        // Prevent re-posting
        if (state.recruitmentChannel !== null) {
            window.HRUI.printToTerminal("A job has already been posted via " + state.recruitmentChannel.toUpperCase() + ". Use 'show candidates' to proceed.", "warning");
            return false;
        }

        state.budget -= cost;
        state.recruitmentCost += cost;
        state.recruitmentChannel = channel;
        state.applications = window.HRData.funnel[channel].apps;
        state.decisions.push("Recruitment channel: " + channel.toUpperCase());
        state.stage = 7;

        window.HRUI.updateTopBar();
        window.HRUI.renderCurrentStage();
        return true;
    },

    screenCandidates: function() {
        window.HRState.stage = 8;
        window.HRUI.renderCurrentStage();
    },

    hireCandidate: function(candId) {
        var state = window.HRState;

        if (state.hiredCandidates.length >= 4) {
            window.HRUI.printToTerminal("You have already hired 4 candidates.", "error");
            return false;
        }
        if (state.hiredCandidates.includes(candId)) {
            window.HRUI.printToTerminal("Candidate " + candId + " has already been hired.", "error");
            return false;
        }

        var cand = state.candidates.find(function(c) { return c.id === candId; });
        if (!cand) {
            window.HRUI.printToTerminal("Candidate " + candId + " does not exist. Type 'show candidates' to view available candidates.", "error");
            return false;
        }

        // Warn (but do not block) if candidate is outside recommended pool
        var validIds = ['B', 'C', 'D', 'E'];
        if (!validIds.includes(candId)) {
            window.HRUI.printToTerminal("Warning: Candidate " + candId + " does not meet the minimum screening criteria. Hiring blocked.", "error");
            return false;
        }

        var cost = window.HRData.costs.hire;
        if (state.budget < cost) {
            window.HRUI.printToTerminal("INSUFFICIENT HR BUDGET. Cannot hire Candidate " + candId + ".", "error");
            return false;
        }

        state.budget -= cost;
        state.recruitmentCost += cost;
        state.hiredCandidates.push(candId);
        state.morale = Math.min(100, state.morale + 2); // Morale boost
        state.decisions.push("Hired Candidate " + candId);
        state.available.ai += 1;

        window.HRUI.updateTopBar();
        window.HRUI.printToTerminal("Hired " + cand.name + " (Candidate " + candId + "). Budget remaining: ₹" + state.budget.toLocaleString('en-IN') + ". Morale increased.", "success");

        // Update hired count display if present on page
        var hiredCountEl = document.getElementById("hired-count");
        if (hiredCountEl) hiredCountEl.innerText = state.hiredCandidates.length;

        // Mark card as hired
        var card = document.getElementById("cand-card-" + candId);
        if (card && !card.classList.contains("selected")) {
            card.classList.add("selected");
            var badge = document.createElement("div");
            badge.style.cssText = "text-align:center; color:var(--success); font-weight:bold; margin-top:10px;";
            badge.innerText = "✓ HIRED";
            card.appendChild(badge);
        }

        if (state.hiredCandidates.length === 4) {
            window.HRUI.printToTerminal("All 4 positions filled. Triggering deadline update...", "success");
            var self = this;
            setTimeout(function() {
                self.triggerDeadlineEvent();
            }, 1500);
        }
        return true;
    },

    triggerDeadlineEvent: function() {
        window.HRState.deadlineChanged = true;
        window.HRState.currentDeadlineMonths = 4;
        window.HRState.stage = 9;
        window.HRUI.updateTopBar();
        window.HRUI.renderCurrentStage();
    },

    evaluateTraining: function() {
        window.HRState.stage = 9;
        window.HRUI.renderCurrentStage();
    },

    calculateReadiness: function() {
        var state = window.HRState;
        var score = 50;

        var gap = this.calculateGap();
        var totalGap = Math.max(0, gap.ai) + Math.max(0, gap.ml) + Math.max(0, gap.data);
        if (totalGap === 0)      score += 30;
        else if (totalGap < 3)   score += 15;

        if (state.trainedEmployees.length > 0) score += 10;
        if (state.budget > 100000)             score += 10;

        return Math.min(100, score);
    }
};
