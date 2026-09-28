window.HRState = {
    stage: 1, // 1: Project Arrives, 2: Workforce Analysis, 3: Decision, 4: Training, 5: Recruitment, 6: Screening, 7: Hiring, 8: Eval, 9: Deadline, 10: Dashboard
    budget: 1000000,
    originalDeadlineMonths: 6,
    currentDeadlineMonths: 6,
    timeUsedWeeks: 0,
    
    required: {
        ai: 14,
        ml: 4,
        data: 3
    },
    
    available: {
        ai: 8,
        ml: 3,
        data: 5
    },

    employees: [], // Will be populated from HRData
    trainedEmployees: [], // Array of IDs
    candidates: [], // Will be populated from HRData
    selectedCandidates: [], // IDs for hiring
    hiredCandidates: [], // Final hired

    recruitmentChannel: null, // 'network', 'college', 'referral'
    applications: 0,

    recruitmentCost: 0,
    trainingCost: 0,

    decisions: [],

    projectReadiness: 0,

    // Flags for the flow
    workforceAnalyzed: false,
    planChosen: null, // 'recruit', 'train', 'combination'
    deadlineChanged: false,

    morale: 85, // New feature: Employee Morale

    init: function() {
        // Deep copy data to state so we can modify it
        this.employees = JSON.parse(JSON.stringify(window.HRData.employees));
        this.candidates = JSON.parse(JSON.stringify(window.HRData.candidates));
        this.stage = 1;
        this.budget = 1000000;
        this.currentDeadlineMonths = 6;
        this.trainedEmployees = [];
        this.selectedCandidates = [];
        this.hiredCandidates = [];
        this.recruitmentChannel = null;
        this.applications = 0;
        this.recruitmentCost = 0;
        this.trainingCost = 0;
        this.decisions = [];
        this.workforceAnalyzed = false;
        this.planChosen = null;
        this.deadlineChanged = false;
        this.morale = 85;
    }
};
