/* ═══════════════════════════════════════════════════════════
   SCENARIOS.JS — All scenario data + training programs + candidates
   Self-contained, no backend required
═══════════════════════════════════════════════════════════ */
window.HRScenarios = {

  trainingPrograms: [
    {
      id: 'cloud_fundamentals',
      name: 'Cloud Fundamentals',
      icon: '☁️',
      cost: 20000,
      weeks: 3,
      skillGain: { skill: 'cloud', min: 10, max: 20 },
      moraleBoost: 3,
      desc: 'Core cloud computing concepts, IaaS/PaaS/SaaS, and basic deployment skills.',
      eligibility: function(emp) { return emp.cloud < 60; }
    },
    {
      id: 'advanced_cloud',
      name: 'Advanced Cloud Architecture',
      icon: '🏗️',
      cost: 40000,
      weeks: 6,
      skillGain: { skill: 'cloud', min: 15, max: 30 },
      moraleBoost: 4,
      desc: 'Kubernetes, microservices, cloud-native design, and enterprise architecture.',
      eligibility: function(emp) { return emp.cloud >= 30; }
    },
    {
      id: 'ai_cert',
      name: 'AI Engineering Certification',
      icon: '🤖',
      cost: 50000,
      weeks: 8,
      skillGain: { skill: 'ai', min: 10, max: 25 },
      moraleBoost: 6,
      desc: 'Deep learning, neural networks, model deployment, and AI ethics.',
      eligibility: function(emp) { return emp.ml >= 70; }
    },
    {
      id: 'ml_specialist',
      name: 'ML Specialist Track',
      icon: '📊',
      cost: 35000,
      weeks: 5,
      skillGain: { skill: 'ml', min: 8, max: 18 },
      moraleBoost: 4,
      desc: 'Advanced ML algorithms, feature engineering, and model optimization.',
      eligibility: function(emp) { return emp.python >= 70; }
    },
    {
      id: 'leadership',
      name: 'Leadership Development',
      icon: '🌟',
      cost: 25000,
      weeks: 4,
      skillGain: { skill: 'leadership', min: 5, max: 15 },
      moraleBoost: 8,
      desc: 'Team management, stakeholder communication, and strategic thinking.',
      eligibility: function(emp) { return emp.experience >= 3; }
    }
  ],

  scenarios: [
    {
      id: 's1',
      name: 'AI Medical Imaging',
      company: 'NovaTech Solutions',
      icon: '🏥',
      tag: 'URGENT',
      tagClass: 'tag-urgent',
      brief: 'A pharma giant has awarded NovaTech a 6-month contract to build an AI-powered medical imaging system. Your team is critically understaffed in AI and cloud skills.',
      client: 'MedaGlobal Pharma',
      budget: 1000000,
      deadline: 6,
      context: 'The project requires specialized AI/Cloud talent. The market is competitive and candidates are expensive. Existing team has strong Python and ML skills but low cloud exposure.',
      requirements: {
        'AI Engineers': { required: 14, available: 8 },
        'ML Engineers': { required: 4,  available: 3 },
        'Data Engineers': { required: 3, available: 5 }
      },
      employees: [
        { id: 'E01', name: 'Arun Kumar',  role: 'Software Engineer', dept: 'Engineering', python: 92, ml: 82, cloud: 45, ai: 78, experience: 3, learningPotential: 0.8, retentionRisk: 'LOW',  performance: 85, promotionPotential: 'HIGH' },
        { id: 'E02', name: 'Priya Shah',  role: 'Data Engineer',     dept: 'Data',        python: 88, ml: 84, cloud: 48, ai: 75, experience: 4, learningPotential: 0.75,retentionRisk: 'LOW',  performance: 88, promotionPotential: 'MEDIUM' },
        { id: 'E03', name: 'Rahul Nair',  role: 'Software Engineer', dept: 'Engineering', python: 85, ml: 80, cloud: 88, ai: 70, experience: 5, learningPotential: 0.6, retentionRisk: 'LOW',  performance: 82, promotionPotential: 'LOW' },
        { id: 'E04', name: 'Sneha Rao',   role: 'Data Engineer',     dept: 'Data',        python: 91, ml: 78, cloud: 82, ai: 76, experience: 4, learningPotential: 0.7, retentionRisk: 'MEDIUM', performance: 87, promotionPotential: 'MEDIUM' },
        { id: 'E05', name: 'Karthik M.',  role: 'Software Engineer', dept: 'Engineering', python: 90, ml: 91, cloud: 42, ai: 86, experience: 3, learningPotential: 0.85,retentionRisk: 'LOW',  performance: 90, promotionPotential: 'HIGH' },
        { id: 'E06', name: 'Divya Patel', role: 'Data Analyst',      dept: 'Analytics',   python: 76, ml: 72, cloud: 40, ai: 68, experience: 2, learningPotential: 0.9, retentionRisk: 'LOW',  performance: 78, promotionPotential: 'HIGH' },
        { id: 'E07', name: 'Naveen G.',   role: 'Software Engineer', dept: 'Engineering', python: 94, ml: 88, cloud: 46, ai: 90, experience: 5, learningPotential: 0.7, retentionRisk: 'HIGH', performance: 92, promotionPotential: 'MEDIUM' },
        { id: 'E08', name: 'Meera J.',    role: 'Data Engineer',     dept: 'Data',        python: 87, ml: 83, cloud: 45, ai: 80, experience: 3, learningPotential: 0.8, retentionRisk: 'LOW',  performance: 84, promotionPotential: 'MEDIUM' }
      ],
      candidatePools: {
        network: [
          { id: 'C-N1', name: 'Arjun Verma',    python: 88, ml: 85, cloud: 90, ai: 92, experience: 5, assessment: 91, expectedSalary: 180000, cultureFit: 70, growthPotential: 'HIGH', noticePeriod: 60, risk: 'LOW',  strength: 'Deep cloud + AI, strong technical background', weakness: 'Premium salary expectation' },
          { id: 'C-N2', name: 'Sunita Mishra',  python: 92, ml: 78, cloud: 85, ai: 88, experience: 4, assessment: 87, expectedSalary: 150000, cultureFit: 85, growthPotential: 'HIGH', noticePeriod: 30, risk: 'LOW',  strength: 'Strong Python, good cloud, culture fit', weakness: 'ML score moderate' },
          { id: 'C-N3', name: 'Deepak Iyer',    python: 78, ml: 90, cloud: 72, ai: 82, experience: 6, assessment: 84, expectedSalary: 210000, cultureFit: 60, growthPotential: 'MEDIUM', noticePeriod: 90, risk: 'MEDIUM', strength: 'Expert ML, high experience', weakness: 'Long notice period, costly' },
          { id: 'C-N4', name: 'Lakshmi Pillai', python: 95, ml: 88, cloud: 91, ai: 94, experience: 4, assessment: 94, expectedSalary: 190000, cultureFit: 78, growthPotential: 'VERY HIGH', noticePeriod: 45, risk: 'LOW', strength: 'Top overall scores, high growth potential', weakness: 'High salary' }
        ],
        college: [
          { id: 'C-C1', name: 'Ravi Teja',      python: 85, ml: 72, cloud: 60, ai: 78, experience: 1, assessment: 82, expectedSalary: 70000, cultureFit: 90, growthPotential: 'VERY HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Fresh grad, high culture fit, low cost, huge potential', weakness: 'Low experience, needs more mentoring' },
          { id: 'C-C2', name: 'Ananya Singh',   python: 88, ml: 80, cloud: 55, ai: 82, experience: 1, assessment: 86, expectedSalary: 72000, cultureFit: 88, growthPotential: 'VERY HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Strong technical base for a fresher', weakness: 'No industry experience' },
          { id: 'C-C3', name: 'Manish Joshi',   python: 82, ml: 68, cloud: 50, ai: 70, experience: 1, assessment: 78, expectedSalary: 65000, cultureFit: 92, growthPotential: 'HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Excellent culture fit, very low cost', weakness: 'Lower technical scores' },
          { id: 'C-C4', name: 'Pooja Kumari',   python: 90, ml: 75, cloud: 62, ai: 80, experience: 1, assessment: 83, expectedSalary: 68000, cultureFit: 85, growthPotential: 'VERY HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Best technical scores in the college pool', weakness: 'Inexperienced' }
        ],
        referral: [
          { id: 'C-R1', name: 'Vijay Krishnan', python: 91, ml: 87, cloud: 83, ai: 90, experience: 4, assessment: 89, expectedSalary: 140000, cultureFit: 95, growthPotential: 'HIGH', noticePeriod: 30, risk: 'LOW', strength: 'Referred by trusted team member, excellent culture fit', weakness: 'Limited pool' },
          { id: 'C-R2', name: 'Nisha Reddy',    python: 86, ml: 82, cloud: 75, ai: 85, experience: 3, assessment: 85, expectedSalary: 120000, cultureFit: 92, growthPotential: 'HIGH', noticePeriod: 30, risk: 'LOW', strength: 'Good all-around scores, high cultural alignment', weakness: 'Moderate cloud score' }
        ],
        agency: [
          { id: 'C-A1', name: 'Rohan Desai',    python: 90, ml: 91, cloud: 88, ai: 93, experience: 7, assessment: 93, expectedSalary: 250000, cultureFit: 65, growthPotential: 'MEDIUM', noticePeriod: 60, risk: 'HIGH', strength: 'Top technical skills, 7 years experience', weakness: 'Very high cost, retention risk, lower culture fit' },
          { id: 'C-A2', name: 'Kavya Sharma',   python: 88, ml: 84, cloud: 86, ai: 89, experience: 5, assessment: 90, expectedSalary: 200000, cultureFit: 72, growthPotential: 'MEDIUM', noticePeriod: 45, risk: 'MEDIUM', strength: 'Strong technical, experienced, agency-sourced', weakness: 'High cost, moderate culture fit' }
        ]
      },
      events: [
        { id: 'ev1', triggerPhase: 5, probability: 0.4, type: 'danger', icon: '⚠️', title: 'Star Employee Resigns', desc: 'Naveen G., one of your top performers, has received an external offer 30% above current salary.', effect: 'morale-8, readiness-5', effectLabel: 'Morale −8%, Readiness −5%', apply: function(state) { state.morale = Math.max(0, state.morale - 8); state.readiness = Math.max(0, state.readiness - 5); state.decisions.push({ phase: 'Event', action: 'Star employee resignation', impact: 'Morale −8, Readiness −5' }); } },
        { id: 'ev2', triggerPhase: 6, probability: 0.35, type: 'danger', icon: '📉', title: 'Budget Freeze', desc: 'The CFO has imposed a temporary budget freeze. HR operational budget is reduced by ₹50,000.', effect: 'budget-50000', effectLabel: 'Budget −₹50,000', apply: function(state) { state.budget = Math.max(0, state.budget - 50000); state.decisions.push({ phase: 'Event', action: 'Budget freeze', impact: '₹50,000 cut' }); } },
        { id: 'ev3', triggerPhase: 7, probability: 0.5, type: 'warning', icon: '🕐', title: 'Deadline Brought Forward', desc: 'The client has accelerated the project timeline from 6 months to 5 months due to regulatory requirements.', effect: 'deadline-1', effectLabel: 'Deadline shortened by 1 month', apply: function(state) { state.deadline = Math.max(1, state.deadline - 1); state.decisions.push({ phase: 'Event', action: 'Deadline moved forward', impact: '−1 month' }); } },
        { id: 'ev4', triggerPhase: 7, probability: 0.3, type: 'success', icon: '🌟', title: 'Hidden Talent Discovered', desc: 'Divya Patel has demonstrated exceptional AI capabilities during a recent project sprint. Consider her for a promotion.', effect: 'morale+6', effectLabel: 'Morale +6%, Development opportunity identified', apply: function(state) { state.morale = Math.min(100, state.morale + 6); state.decisions.push({ phase: 'Event', action: 'Internal talent discovered', impact: 'Morale +6' }); } },
        { id: 'ev5', triggerPhase: 5, probability: 0.25, type: 'warning', icon: '😔', title: 'Team Morale Drop', desc: 'Overwork and uncertainty around the workforce gap is causing anxiety among current employees.', effect: 'morale-10', effectLabel: 'Morale −10%', apply: function(state) { state.morale = Math.max(0, state.morale - 10); state.decisions.push({ phase: 'Event', action: 'Team morale drop', impact: 'Morale −10' }); } }
      ],
      optimalStrategies: {
        recruit: 'Fast but expensive. Best for urgent timelines. Morale neutral but budget heavy.',
        train: 'Best for retention and cost. Slower and suitable when deadline is flexible.',
        combination: 'Balanced. Recommended for medium urgency. Develop existing + recruit for critical gaps.'
      }
    },
    {
      id: 's2',
      name: 'FinTech Expansion',
      company: 'NovaTech FinLabs',
      icon: '🏦',
      tag: 'COMPLIANCE',
      tagClass: 'tag-scale',
      brief: 'NovaTech has acquired a fintech startup and must rapidly expand the compliance and data engineering team while adhering to strict regulatory requirements.',
      client: 'Internal (Fintech Division)',
      budget: 1400000,
      deadline: 8,
      context: 'Compliance requirements mean candidates must pass background checks. Internal mobility may reduce risk. Budget is larger but regulatory risk is high.',
      requirements: {
        'Compliance Engineers': { required: 6, available: 2 },
        'Data Engineers':       { required: 8, available: 5 },
        'Security Analysts':    { required: 4, available: 1 }
      },
      employees: [
        { id: 'E01', name: 'Anisha Roy',    role: 'Data Engineer',    dept: 'Data',       python: 88, ml: 70, cloud: 80, ai: 65, experience: 5, learningPotential: 0.65, retentionRisk: 'LOW',    performance: 88, promotionPotential: 'MEDIUM' },
        { id: 'E02', name: 'Sameer Ali',    role: 'Backend Engineer', dept: 'Engineering',python: 82, ml: 60, cloud: 75, ai: 58, experience: 4, learningPotential: 0.7,  retentionRisk: 'MEDIUM', performance: 80, promotionPotential: 'MEDIUM' },
        { id: 'E03', name: 'Tanvi Mehta',   role: 'Data Analyst',     dept: 'Analytics',  python: 78, ml: 72, cloud: 55, ai: 60, experience: 3, learningPotential: 0.85, retentionRisk: 'LOW',    performance: 82, promotionPotential: 'HIGH' },
        { id: 'E04', name: 'Ashok Babu',    role: 'Security Analyst', dept: 'Security',   python: 70, ml: 50, cloud: 62, ai: 55, experience: 6, learningPotential: 0.5,  retentionRisk: 'LOW',    performance: 85, promotionPotential: 'LOW' },
        { id: 'E05', name: 'Neha Gupta',    role: 'Data Engineer',    dept: 'Data',       python: 90, ml: 75, cloud: 82, ai: 70, experience: 4, learningPotential: 0.75, retentionRisk: 'LOW',    performance: 87, promotionPotential: 'HIGH' },
        { id: 'E06', name: 'Rajesh Kumar',  role: 'Backend Engineer', dept: 'Engineering',python: 85, ml: 65, cloud: 70, ai: 62, experience: 3, learningPotential: 0.8,  retentionRisk: 'LOW',    performance: 81, promotionPotential: 'MEDIUM' }
      ],
      candidatePools: {
        network: [
          { id: 'C-N1', name: 'Pradeep Sinha', python: 82, ml: 65, cloud: 78, ai: 60, experience: 5, assessment: 86, expectedSalary: 160000, cultureFit: 75, growthPotential: 'MEDIUM', noticePeriod: 60, risk: 'LOW', strength: 'Compliance background', weakness: 'Moderate ML' },
          { id: 'C-N2', name: 'Smita Doshi',   python: 88, ml: 72, cloud: 82, ai: 68, experience: 4, assessment: 88, expectedSalary: 140000, cultureFit: 82, growthPotential: 'HIGH', noticePeriod: 30, risk: 'LOW', strength: 'Strong data, good cloud', weakness: '' }
        ],
        college: [
          { id: 'C-C1', name: 'Aman Sharma',   python: 80, ml: 60, cloud: 55, ai: 58, experience: 1, assessment: 79, expectedSalary: 65000, cultureFit: 90, growthPotential: 'VERY HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Eager, low cost', weakness: 'Inexperienced in compliance' }
        ],
        referral: [
          { id: 'C-R1', name: 'Meghna Tiwari', python: 86, ml: 70, cloud: 77, ai: 66, experience: 3, assessment: 84, expectedSalary: 115000, cultureFit: 94, growthPotential: 'HIGH', noticePeriod: 30, risk: 'LOW', strength: 'Team recommended, excellent fit', weakness: '' }
        ],
        agency: [
          { id: 'C-A1', name: 'Varun Chopra',  python: 84, ml: 68, cloud: 85, ai: 72, experience: 6, assessment: 91, expectedSalary: 220000, cultureFit: 60, growthPotential: 'LOW', noticePeriod: 45, risk: 'HIGH', strength: 'Expert compliance experience', weakness: 'High cost, low culture fit' }
        ]
      },
      events: [
        { id: 'ev1', triggerPhase: 5, probability: 0.5, type: 'danger', icon: '🔒', title: 'Regulatory Audit', desc: 'SEBI has announced an audit. All hires must now pass enhanced background verification, adding 2 weeks to onboarding.', effect: 'deadline-0.5', effectLabel: 'Onboarding extended', apply: function(state) { state.decisions.push({ phase: 'Event', action: 'Regulatory audit', impact: 'Onboarding +2 weeks' }); } },
        { id: 'ev2', triggerPhase: 6, probability: 0.4, type: 'warning', icon: '📋', title: 'Compliance Training Mandatory', desc: 'All new hires must complete a mandatory 1-week compliance induction before they can start.', effect: 'morale-3', effectLabel: 'Slight morale impact', apply: function(state) { state.morale = Math.max(0, state.morale - 3); } }
      ],
      optimalStrategies: {
        recruit: 'Agency hiring provides experienced compliance experts but is costly. Referrals offer trusted candidates.',
        train: 'Internal mobility from data to compliance is viable but requires time investment.',
        combination: 'Use referrals for senior roles + campus for junior data engineers.'
      }
    },
    {
      id: 's3',
      name: 'Retail Digital Transformation',
      company: 'NovaTech Retail',
      icon: '🛒',
      tag: 'RESKILLING',
      tagClass: 'tag-growth',
      brief: 'A major retail chain has contracted NovaTech to digitize their operations. This requires a massive reskilling program for 50+ existing staff while recruiting specialized tech talent.',
      client: 'RetailMax India',
      budget: 1800000,
      deadline: 9,
      context: 'Large-scale change management. Existing employees have domain knowledge but lack technical skills. Training investment is essential. Budget is generous but scope is large.',
      requirements: {
        'Digital Transformation Leads': { required: 5, available: 1 },
        'Cloud Engineers': { required: 10, available: 3 },
        'Analytics Specialists': { required: 8, available: 4 }
      },
      employees: [
        { id: 'E01', name: 'Rohit Das',      role: 'Project Manager',  dept: 'Delivery',   python: 60, ml: 45, cloud: 40, ai: 38, experience: 8, learningPotential: 0.6,  retentionRisk: 'LOW',    performance: 90, promotionPotential: 'HIGH' },
        { id: 'E02', name: 'Shruti Verma',   role: 'Business Analyst', dept: 'Analytics',  python: 72, ml: 60, cloud: 48, ai: 52, experience: 5, learningPotential: 0.75, retentionRisk: 'LOW',    performance: 84, promotionPotential: 'HIGH' },
        { id: 'E03', name: 'Vikram Pillai',  role: 'Data Analyst',     dept: 'Analytics',  python: 80, ml: 70, cloud: 55, ai: 62, experience: 4, learningPotential: 0.8,  retentionRisk: 'MEDIUM', performance: 82, promotionPotential: 'MEDIUM' },
        { id: 'E04', name: 'Swati Nanda',    role: 'Backend Engineer', dept: 'Engineering',python: 85, ml: 62, cloud: 50, ai: 58, experience: 3, learningPotential: 0.85, retentionRisk: 'LOW',    performance: 80, promotionPotential: 'HIGH' },
        { id: 'E05', name: 'Girish M.',      role: 'Data Engineer',    dept: 'Data',       python: 88, ml: 74, cloud: 60, ai: 68, experience: 4, learningPotential: 0.7,  retentionRisk: 'LOW',    performance: 86, promotionPotential: 'MEDIUM' },
        { id: 'E06', name: 'Bhavna Tewari',  role: 'Software Engineer',dept: 'Engineering',python: 82, ml: 68, cloud: 42, ai: 65, experience: 2, learningPotential: 0.9,  retentionRisk: 'LOW',    performance: 79, promotionPotential: 'VERY HIGH' }
      ],
      candidatePools: {
        network: [
          { id: 'C-N1', name: 'Mahesh Pandey',  python: 84, ml: 70, cloud: 82, ai: 72, experience: 5, assessment: 88, expectedSalary: 155000, cultureFit: 72, growthPotential: 'MEDIUM', noticePeriod: 45, risk: 'LOW', strength: 'Retail transformation experience', weakness: '' },
          { id: 'C-N2', name: 'Divya Srinivas', python: 88, ml: 74, cloud: 85, ai: 76, experience: 4, assessment: 90, expectedSalary: 145000, cultureFit: 80, growthPotential: 'HIGH', noticePeriod: 30, risk: 'LOW', strength: 'Strong cloud analytics background', weakness: '' }
        ],
        college: [
          { id: 'C-C1', name: 'Chirag Bose',    python: 82, ml: 68, cloud: 58, ai: 70, experience: 1, assessment: 81, expectedSalary: 68000, cultureFit: 88, growthPotential: 'VERY HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Strong analytical aptitude', weakness: 'No enterprise experience' }
        ],
        referral: [
          { id: 'C-R1', name: 'Hema Srivastava',python: 85, ml: 72, cloud: 78, ai: 74, experience: 4, assessment: 86, expectedSalary: 125000, cultureFit: 92, growthPotential: 'HIGH', noticePeriod: 30, risk: 'LOW', strength: 'Internal referral, strong cultural alignment', weakness: '' }
        ],
        agency: [
          { id: 'C-A1', name: 'Sohail Shaikh',  python: 90, ml: 80, cloud: 90, ai: 85, experience: 8, assessment: 94, expectedSalary: 280000, cultureFit: 58, growthPotential: 'LOW', noticePeriod: 60, risk: 'HIGH', strength: 'Retail transformation expert, strongest scores', weakness: 'Extremely high cost, low fit' }
        ]
      },
      events: [
        { id: 'ev1', triggerPhase: 7, probability: 0.6, type: 'success', icon: '🌟', title: 'Training Program Exceeds Expectations', desc: 'Your training cohort has shown remarkable progress. Average skill gain is 15% above projected.', effect: 'readiness+10, morale+5', effectLabel: 'Readiness +10%, Morale +5%', apply: function(state) { state.readiness = Math.min(100, state.readiness + 10); state.morale = Math.min(100, state.morale + 5); } },
        { id: 'ev2', triggerPhase: 5, probability: 0.4, type: 'warning', icon: '📉', title: 'Change Resistance', desc: 'Some existing staff are resistant to the digital transformation, citing job security concerns.', effect: 'morale-8', effectLabel: 'Morale −8%', apply: function(state) { state.morale = Math.max(0, state.morale - 8); } }
      ],
      optimalStrategies: {
        recruit: 'Brings immediate capability but misses the development opportunity for existing staff.',
        train: 'Ideal — the project benefits from staff who know the retail domain. Develop cloud and analytics skills.',
        combination: 'Train existing analysts and engineers; recruit for transformation leadership roles externally.'
      }
    },
    {
      id: 's4',
      name: 'Startup Scale-Up',
      company: 'NovaTech Ventures',
      icon: '🚀',
      tag: 'GROWTH',
      tagClass: 'tag-growth',
      brief: 'NovaTech\'s new AI startup division needs to grow from 8 to 20 engineers in 4 months on a tight budget to meet investor milestones.',
      client: 'Venture Capital Milestone',
      budget: 600000,
      deadline: 4,
      context: 'Extreme budget pressure. Campus recruitment is essential. Internal morale must stay high or the startup culture will collapse. Speed matters more than perfection.',
      requirements: {
        'Full-Stack Engineers': { required: 8, available: 3 },
        'AI Researchers':       { required: 4, available: 1 },
        'DevOps Engineers':     { required: 4, available: 2 }
      },
      employees: [
        { id: 'E01', name: 'Aryan Kapoor',   role: 'Full-Stack Eng',   dept: 'Engineering',python: 88, ml: 70, cloud: 75, ai: 72, experience: 2, learningPotential: 0.9,  retentionRisk: 'MEDIUM', performance: 88, promotionPotential: 'VERY HIGH' },
        { id: 'E02', name: 'Zara Khan',      role: 'AI Researcher',    dept: 'Research',   python: 85, ml: 90, cloud: 60, ai: 88, experience: 3, learningPotential: 0.85, retentionRisk: 'LOW',    performance: 92, promotionPotential: 'HIGH' },
        { id: 'E03', name: 'Dev Agarwal',    role: 'DevOps Engineer',  dept: 'Infra',      python: 80, ml: 55, cloud: 90, ai: 60, experience: 2, learningPotential: 0.8,  retentionRisk: 'LOW',    performance: 82, promotionPotential: 'MEDIUM' },
        { id: 'E04', name: 'Isha Malhotra',  role: 'Full-Stack Eng',   dept: 'Engineering',python: 90, ml: 65, cloud: 70, ai: 68, experience: 1, learningPotential: 0.95, retentionRisk: 'LOW',    performance: 85, promotionPotential: 'VERY HIGH' }
      ],
      candidatePools: {
        network: [
          { id: 'C-N1', name: 'Siddharth Roy', python: 88, ml: 80, cloud: 78, ai: 85, experience: 3, assessment: 89, expectedSalary: 160000, cultureFit: 80, growthPotential: 'HIGH', noticePeriod: 30, risk: 'MEDIUM', strength: 'Strong overall, startup mindset', weakness: 'Salary over budget' }
        ],
        college: [
          { id: 'C-C1', name: 'Aditya Sen',    python: 88, ml: 82, cloud: 68, ai: 84, experience: 1, assessment: 87, expectedSalary: 70000, cultureFit: 95, growthPotential: 'VERY HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Top fresher, startup enthusiast, very affordable', weakness: 'No work experience' },
          { id: 'C-C2', name: 'Pallavi Jain',  python: 85, ml: 75, cloud: 62, ai: 78, experience: 1, assessment: 83, expectedSalary: 65000, cultureFit: 92, growthPotential: 'VERY HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Enthusiastic, culture fit, affordable', weakness: '' },
          { id: 'C-C3', name: 'Nikhil Bhat',   python: 82, ml: 70, cloud: 72, ai: 75, experience: 1, assessment: 80, expectedSalary: 68000, cultureFit: 88, growthPotential: 'HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Cloud skills above average for fresher', weakness: '' }
        ],
        referral: [
          { id: 'C-R1', name: 'Tanu Kapoor',   python: 86, ml: 78, cloud: 74, ai: 80, experience: 2, assessment: 85, expectedSalary: 100000, cultureFit: 96, growthPotential: 'HIGH', noticePeriod: 15, risk: 'LOW', strength: 'Best culture fit, startup aligned', weakness: '' }
        ],
        agency: [
          { id: 'C-A1', name: 'Harsh Trivedi',  python: 90, ml: 85, cloud: 82, ai: 90, experience: 6, assessment: 92, expectedSalary: 260000, cultureFit: 45, growthPotential: 'LOW', noticePeriod: 60, risk: 'VERY HIGH', strength: 'Strong skills', weakness: 'Way over budget, bad fit, high retention risk for startup' }
        ]
      },
      events: [
        { id: 'ev1', triggerPhase: 4, probability: 0.6, type: 'warning', icon: '💸', title: 'Investor Cuts Budget', desc: 'Due to market conditions, the investor has reduced the HR budget by ₹80,000. Spend wisely.', effect: 'budget-80000', effectLabel: 'Budget −₹80,000', apply: function(state) { state.budget = Math.max(0, state.budget - 80000); } },
        { id: 'ev2', triggerPhase: 6, probability: 0.5, type: 'success', icon: '🎉', title: 'Startup Culture Buzz', desc: 'Your startup has been featured in a tech blog. Candidate interest has spiked — referral pool expanded.', effect: 'morale+8', effectLabel: 'Morale +8%, additional referrals', apply: function(state) { state.morale = Math.min(100, state.morale + 8); } }
      ],
      optimalStrategies: {
        recruit: 'Campus is essential here — low cost, high enthusiasm, startup-compatible.',
        train: 'Limited — with only 4 months, training must be short and targeted.',
        combination: 'Hire campus talent + run rapid onboarding training sprints.'
      }
    },
    {
      id: 's5',
      name: 'Crisis Recovery',
      company: 'NovaTech Systems',
      icon: '🆘',
      tag: 'CRISIS',
      tagClass: 'tag-crisis',
      brief: 'A wave of unexpected resignations in the AI team has left a critical project at risk. 5 senior engineers left after competitor poaching. You have 3 months to stabilize.',
      client: 'Internal (Critical AI Project)',
      budget: 800000,
      deadline: 3,
      context: 'Extreme urgency. Morale is already low. Team is understaffed and overworked. Quick external hiring is necessary but retention of remaining talent is the #1 priority.',
      requirements: {
        'AI Engineers':  { required: 10, available: 4 },
        'ML Engineers':  { required: 5,  available: 2 },
        'Team Leads':    { required: 2,  available: 0 }
      },
      employees: [
        { id: 'E01', name: 'Amit Singhania', role: 'AI Engineer',   dept: 'AI',         python: 90, ml: 88, cloud: 70, ai: 90, experience: 4, learningPotential: 0.75, retentionRisk: 'HIGH',   performance: 92, promotionPotential: 'HIGH' },
        { id: 'E02', name: 'Kavitha N.',     role: 'ML Engineer',   dept: 'ML',         python: 88, ml: 92, cloud: 65, ai: 85, experience: 3, learningPotential: 0.8,  retentionRisk: 'HIGH',   performance: 90, promotionPotential: 'MEDIUM' },
        { id: 'E03', name: 'Pankaj Dubey',   role: 'AI Engineer',   dept: 'AI',         python: 85, ml: 82, cloud: 72, ai: 88, experience: 5, learningPotential: 0.65, retentionRisk: 'MEDIUM', performance: 86, promotionPotential: 'MEDIUM' },
        { id: 'E04', name: 'Richa Bansal',   role: 'Data Engineer', dept: 'Data',       python: 82, ml: 78, cloud: 68, ai: 75, experience: 3, learningPotential: 0.8,  retentionRisk: 'LOW',    performance: 84, promotionPotential: 'HIGH' }
      ],
      candidatePools: {
        network: [
          { id: 'C-N1', name: 'Saurabh Yadav',  python: 88, ml: 84, cloud: 78, ai: 90, experience: 4, assessment: 90, expectedSalary: 170000, cultureFit: 74, growthPotential: 'HIGH', noticePeriod: 30, risk: 'LOW', strength: 'Strong AI/ML, available soon', weakness: 'Premium salary' },
          { id: 'C-N2', name: 'Preeti Bajaj',   python: 85, ml: 88, cloud: 72, ai: 87, experience: 5, assessment: 88, expectedSalary: 165000, cultureFit: 78, growthPotential: 'MEDIUM', noticePeriod: 30, risk: 'LOW', strength: 'Senior ML, crisis experience', weakness: '' }
        ],
        college: [
          { id: 'C-C1', name: 'Rohit Acharya',  python: 87, ml: 80, cloud: 62, ai: 82, experience: 1, assessment: 85, expectedSalary: 72000, cultureFit: 88, growthPotential: 'VERY HIGH', noticePeriod: 0, risk: 'LOW', strength: 'Top technical scores, immediate available', weakness: 'No crisis experience' }
        ],
        referral: [
          { id: 'C-R1', name: 'Shreya Mohan',   python: 90, ml: 86, cloud: 76, ai: 88, experience: 3, assessment: 88, expectedSalary: 130000, cultureFit: 96, growthPotential: 'HIGH', noticePeriod: 15, risk: 'LOW', strength: 'Highest culture fit, trusted referral, fast start', weakness: '' }
        ],
        agency: [
          { id: 'C-A1', name: 'Kartik Menon',   python: 92, ml: 90, cloud: 85, ai: 94, experience: 7, assessment: 95, expectedSalary: 290000, cultureFit: 50, growthPotential: 'LOW', noticePeriod: 45, risk: 'VERY HIGH', strength: 'Top scores, experienced crisis responder', weakness: 'Extremely expensive, retention risk' }
        ]
      },
      events: [
        { id: 'ev1', triggerPhase: 4, probability: 0.7, type: 'danger', icon: '😰', title: 'Another Resignation Threat', desc: 'Amit Singhania is being poached. If morale stays low, he will likely leave too.', effect: 'morale-12', effectLabel: 'Morale critical — act quickly', apply: function(state) { state.morale = Math.max(0, state.morale - 12); } },
        { id: 'ev2', triggerPhase: 6, probability: 0.6, type: 'warning', icon: '⏰', title: 'Client Escalation', desc: 'The client has sent a warning letter. Readiness must reach 75% within 6 weeks or the contract will be terminated.', effect: 'readiness threshold 75%', effectLabel: 'Readiness target set at 75%', apply: function(state) { state.decisions.push({ phase: 'Event', action: 'Client escalation', impact: 'Readiness must reach 75%' }); } }
      ],
      optimalStrategies: {
        recruit: 'Referrals are the fastest, most trust-worthy path. Agency for senior lead roles.',
        train: 'Promote internally first — Amit or Kavitha to lead. Boost morale immediately.',
        combination: 'Promote internal lead + fast referral hires + morale intervention.'
      }
    }
  ]
};
