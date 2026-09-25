window.HRApp = {
    _eventsBound: false,

    init: function() {
        // Initialize state
        window.HRState.init();

        // Bind events only once
        if (!this._eventsBound) {
            this.bindEvents();
            this._eventsBound = true;
        }

        // Show intro sequence after a small delay
        setTimeout(function() {
            var notif = document.getElementById("intro-notification");
            notif.classList.remove("hidden");
            notif.classList.add("anim-fade-in");

            setTimeout(function() {
                var role = document.getElementById("intro-role");
                role.classList.remove("hidden");
                role.classList.add("anim-fade-in");
            }, 2000);
        }, 500);
    },

    bindEvents: function() {
        var self = this;

        // Intro buttons
        document.getElementById("btn-start-simulation").addEventListener("click", function() {
            self.startSimulation();
        });
        document.getElementById("btn-skip-intro").addEventListener("click", function() {
            self.startSimulation();
        });

        // Command terminal — Enter key
        var cmdInput = document.getElementById("command-input");
        cmdInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                var val = cmdInput.value;
                if (val.trim()) {
                    window.HRCommands.execute(val);
                    cmdInput.value = "";
                }
            }
        });

        // Modal close
        document.getElementById("btn-close-modal").addEventListener("click", function() {
            document.getElementById("modal-overlay").classList.add("hidden");
        });

        // Classroom mode toggle
        document.getElementById("btn-classroom-mode").addEventListener("click", function(e) {
            document.body.classList.toggle("classroom-mode");
            var btn = e.currentTarget;
            if (document.body.classList.contains("classroom-mode")) {
                btn.innerText = "EXIT CLASSROOM MODE";
                btn.classList.replace("secondary", "primary");
            } else {
                btn.innerText = "CLASSROOM MODE";
                btn.classList.replace("primary", "secondary");
            }
        });
    },

    startSimulation: function() {
        document.getElementById("intro-screen").classList.replace("active", "hidden");
        document.getElementById("app-screen").classList.replace("hidden", "active");

        window.HRState.stage = 2; // Workforce Analysis
        window.HRUI.updateTopBar();
        window.HRUI.renderCurrentStage();

        window.HRUI.printToTerminal("SYSTEM ONLINE.", "success");
        window.HRUI.printToTerminal("Type 'help' to view available commands.", "normal");
    },

    resetSimulation: function() {
        // Reset state only
        window.HRState.init();

        // Clear dynamic UI
        document.getElementById("terminal-output").innerHTML = "";
        document.getElementById("dynamic-content").innerHTML = "";

        // Go back to intro
        document.getElementById("app-screen").classList.replace("active", "hidden");
        document.getElementById("intro-screen").classList.replace("hidden", "active");

        // Reset classroom mode
        document.body.classList.remove("classroom-mode");
        var cmBtn = document.getElementById("btn-classroom-mode");
        cmBtn.innerText = "CLASSROOM MODE";
        cmBtn.classList.replace("primary", "secondary");

        // Reset intro animation elements
        var notif = document.getElementById("intro-notification");
        notif.classList.add("hidden");
        notif.classList.remove("anim-fade-in");

        var role = document.getElementById("intro-role");
        role.classList.add("hidden");
        role.classList.remove("anim-fade-in");

        // Restart intro sequence (no re-binding events)
        setTimeout(function() {
            notif.classList.remove("hidden");
            notif.classList.add("anim-fade-in");
            setTimeout(function() {
                role.classList.remove("hidden");
                role.classList.add("anim-fade-in");
            }, 2000);
        }, 500);
    }
};

// Boot up
document.addEventListener("DOMContentLoaded", function() {
    window.HRApp.init();
});
