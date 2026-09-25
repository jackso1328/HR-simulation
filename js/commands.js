window.HRCommands = {
    execute: function(cmdString) {
        var cmd = cmdString.trim().toLowerCase();
        window.HRUI.printToTerminal("> " + cmd, "normal");

        // ---- HELP ----
        if (cmd === 'help') {
            var helpLines = [
                "Available HR commands:",
                "  analyze workforce         -- Compare required vs available",
                "  calculate gap             -- Alias for analyze workforce",
                "  show employees            -- View internal employee database",
                "  find skill gaps           -- Highlight skill gaps in employees",
                "  show skills               -- Alias for find skill gaps",
                "  show recruitment options  -- Open recruitment channel selection",
                "  post job professional network  -- Post on Professional Network",
                "  post job linkedin              -- Alias for professional network",
                "  post job college          -- Start college campus drive",
                "  post job referral         -- Activate employee referrals",
                "  show candidates           -- View candidate pool",
                "  screen candidates         -- Run screening process",
                "  hire candidate [ID]       -- e.g. hire candidate B",
                "  train employee [ID]       -- e.g. train employee EMP001",
                "  evaluate training         -- Evaluate training effectiveness",
                "  show budget               -- Show remaining budget",
                "  show timeline             -- Show project deadline",
                "  show dashboard            -- Open BI dashboard",
                "  status                    -- Show current simulation state",
                "  reset                     -- Restart the simulation"
            ];
            helpLines.forEach(function(l) { window.HRUI.printToTerminal(l, "normal"); });
            return;
        }

        // ---- RESET ----
        if (cmd === 'reset') {
            window.HRApp.resetSimulation();
            return;
        }

        // ---- STATUS ----
        if (cmd === 'status') {
            var s = window.HRState;
            window.HRUI.printToTerminal("Stage: " + s.stage + " | Budget: \u20B9" + s.budget.toLocaleString('en-IN') + " | Deadline: " + s.currentDeadlineMonths + " Months", "success");
            window.HRUI.printToTerminal("Plan: " + (s.planChosen || "not chosen") + " | Channel: " + (s.recruitmentChannel || "none") + " | Hired: " + s.hiredCandidates.length + "/4", "success");
            return;
        }

        // ---- SHOW BUDGET ----
        if (cmd === 'show budget') {
            window.HRUI.printToTerminal("Remaining Budget: \u20B9" + window.HRState.budget.toLocaleString('en-IN'), "success");
            return;
        }

        // ---- SHOW TIMELINE ----
        if (cmd === 'show timeline') {
            var deadline = window.HRState.currentDeadlineMonths;
            window.HRUI.printToTerminal("Project Deadline: " + deadline + " Months" + (window.HRState.deadlineChanged ? " (UPDATED from 6 months)" : ""), deadline < 6 ? "warning" : "success");
            return;
        }

        // ---- ANALYZE WORKFORCE / CALCULATE GAP ----
        if (cmd === 'analyze workforce' || cmd === 'calculate gap' || cmd === 'analyze the workforce') {
            window.HRSim.analyzeWorkforce();
            return;
        }

        // ---- SHOW EMPLOYEES ----
        if (cmd === 'show employees') {
            if (window.HRState.stage >= 2) {
                window.HRState.stage = 4;
                window.HRUI.renderCurrentStage();
            } else {
                window.HRUI.printToTerminal("Please run 'analyze workforce' first.", "warning");
            }
            return;
        }

        // ---- FIND SKILL GAPS / SHOW SKILLS ----
        if (cmd === 'find skill gaps' || cmd === 'show skills') {
            if (window.HRState.stage >= 4) {
                // If we're not on stage 4, navigate there first
                if (window.HRState.stage !== 4) {
                    window.HRState.stage = 4;
                    window.HRUI.renderCurrentStage();
                    // Give DOM a moment, then highlight
                    setTimeout(function() { window.HRUI.renderSkillGaps(); }, 200);
                } else {
                    window.HRUI.renderSkillGaps();
                }
            } else {
                window.HRUI.printToTerminal("Navigate to employee database first ('show employees').", "warning");
            }
            return;
        }

        // ---- SHOW RECRUITMENT OPTIONS ----
        if (cmd === 'show recruitment options') {
            if (window.HRState.stage >= 2) {
                window.HRState.stage = 5;
                window.HRUI.renderCurrentStage();
            } else {
                window.HRUI.printToTerminal("Please analyze the workforce first.", "warning");
            }
            return;
        }

        // ---- POST JOB ----
        if (cmd.indexOf('post job') === 0 || cmd === 'publish job' || cmd === 'post linkedin' || cmd === 'post college' || cmd === 'post referral') {
            if (window.HRState.stage < 5) {
                window.HRUI.printToTerminal("Please 'show recruitment options' first.", "warning");
                return;
            }
            if (window.HRState.recruitmentChannel !== null) {
                window.HRUI.printToTerminal("Job already posted via " + window.HRState.recruitmentChannel.toUpperCase() + ". Type 'show candidates' to continue.", "warning");
                return;
            }
            if (cmd.indexOf('linkedin') !== -1 || cmd.indexOf('professional network') !== -1 || cmd.indexOf('network') !== -1) {
                window.HRSim.postJob('network');
            } else if (cmd.indexOf('college') !== -1) {
                window.HRSim.postJob('college');
            } else if (cmd.indexOf('referral') !== -1) {
                window.HRSim.postJob('referral');
            } else {
                window.HRUI.printToTerminal("Unknown channel. Options: 'professional network', 'college', 'referral'.", "error");
            }
            return;
        }

        // ---- SHOW CANDIDATES ----
        if (cmd === 'show candidates') {
            if (window.HRState.stage === 8) {
                window.HRUI.renderCurrentStage();
            } else if (window.HRState.stage === 7) {
                window.HRUI.renderCurrentStage();
            } else {
                window.HRUI.printToTerminal("No candidates available yet. Post a job first.", "warning");
            }
            return;
        }

        // ---- SCREEN CANDIDATES ----
        if (cmd === 'screen candidates') {
            if (window.HRState.stage === 7) {
                window.HRSim.screenCandidates();
            } else if (window.HRState.stage === 8) {
                window.HRUI.printToTerminal("Candidates already screened. Type 'show candidates' to view the pool.", "warning");
            } else {
                window.HRUI.printToTerminal("You need to post a job first.", "warning");
            }
            return;
        }

        // ---- HIRE CANDIDATE ----
        if (cmd.indexOf('hire candidate') === 0) {
            if (window.HRState.stage !== 8) {
                window.HRUI.printToTerminal("You must screen candidates first ('screen candidates').", "warning");
                return;
            }
            var parts = cmd.split(' ');
            var candId = parts[parts.length - 1].toUpperCase();
            if (!candId || candId === 'CANDIDATE') {
                window.HRUI.printToTerminal("Please specify a candidate ID. E.g. 'hire candidate B'.", "error");
                return;
            }
            window.HRSim.hireCandidate(candId);
            return;
        }

        // ---- TRAIN EMPLOYEE ----
        if (cmd.indexOf('train employee') === 0) {
            var tparts = cmd.split(' ');
            var empId = tparts[tparts.length - 1].toUpperCase();
            if (!empId || empId === 'EMPLOYEE') {
                window.HRUI.printToTerminal("Please specify an employee ID. E.g. 'train employee EMP001'.", "error");
                return;
            }
            var res = window.HRSim.trainEmployee(empId);
            if (res) {
                window.HRUI.renderTrainingAnimation(res);
            }
            return;
        }

        // ---- EVALUATE TRAINING ----
        if (cmd === 'evaluate training') {
            if (window.HRState.trainedEmployees.length > 0) {
                window.HRState.stage = 9;
                window.HRUI.renderCurrentStage();
            } else {
                window.HRUI.printToTerminal("No employees have been trained yet. Use 'train employee [ID]'.", "warning");
            }
            return;
        }

        // ---- SHOW DASHBOARD ----
        if (cmd === 'show dashboard' || cmd === 'dashboard') {
            window.HRState.stage = 10;
            window.HRUI.renderCurrentStage();
            return;
        }

        // ---- UNRECOGNIZED ----
        window.HRUI.printToTerminal("Command not recognized. Type 'help' to view available HR actions.", "error");
    }
};
