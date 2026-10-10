import {
  AnalysisResult,
  StudentProfile,
  CareerMatchInput,
  CareerMatchResult,
  InterviewAnswerFeedback,
  InterviewFinalSummary,
  LearningRoadmap,
  ValidatedSkillItem,
  DiagnosticQuestion,
  RoadmapMilestone,
  StartupJobSearchInput,
  StartupJobSearchResult,
  StartupMatchCard,
} from '../types';
import { CURATED_STARTUPS, CuratedStartup } from '../data/startupDirectory';

export function generateHeuristicAnalysis(
  resumeText: string,
  profile: StudentProfile,
  jobDescription: string,
  targetRole: string,
  roadmapDuration: string = '30-day'
): AnalysisResult {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  // Tech catalog to look for in job description and resume
  const techCatalog = [
    { name: 'TypeScript', category: 'Language' },
    { name: 'JavaScript', category: 'Language' },
    { name: 'Python', category: 'Language' },
    { name: 'SQL', category: 'Database' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express', category: 'Backend' },
    { name: 'REST APIs', category: 'Architecture' },
    { name: 'GraphQL', category: 'Architecture' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'CI/CD (GitHub Actions)', category: 'DevOps' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Redis', category: 'Infrastructure' },
    { name: 'Automated Testing (Jest/Vitest)', category: 'Testing' },
    { name: 'Git & Version Control', category: 'Tools' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Pandas', category: 'Data/ML' },
    { name: 'Machine Learning / Scikit-Learn', category: 'Data/ML' },
    { name: 'Linux / Shell Scripting', category: 'Systems' },
  ];

  // Identify skills required by the job description
  const relevantSkills = techCatalog.filter((item) => {
    const key = item.name.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
    return jdLower.includes(key);
  });

  // If fewer than 4 matched, add common entry-level requirements from target role
  if (relevantSkills.length < 5) {
    relevantSkills.push(
      { name: 'TypeScript', category: 'Language' },
      { name: 'React', category: 'Frontend' },
      { name: 'Node.js', category: 'Backend' },
      { name: 'PostgreSQL', category: 'Database' },
      { name: 'Automated Testing (Jest/Vitest)', category: 'Testing' },
      { name: 'Docker', category: 'DevOps' }
    );
  }

  // Deduplicate
  const uniqueSkills = Array.from(
    new Map(relevantSkills.map((s) => [s.name, s])).values()
  );

  // Evaluate each skill against resume evidence
  const evaluatedGaps = uniqueSkills.map((item) => {
    const key = item.name.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
    const hasMatch = resumeLower.includes(key);

    // Look for sentence where it appears in resume
    let sentence = '';
    if (hasMatch) {
      const sentences = resumeText.split(/[\n•\.]/);
      sentence =
        sentences
          .find((s) => s.toLowerCase().includes(key) && s.trim().length > 15)
          ?.trim() || `Mentioned in technical skills list`;
    }

    let status: 'demonstrated' | 'partial' | 'missing' = 'missing';
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';

    if (hasMatch) {
      // If found in a project or work description
      if (sentence.length > 30) {
        status = 'demonstrated';
        priority = 'low';
      } else {
        status = 'partial';
        priority = 'high';
      }
    } else {
      status = 'missing';
      priority =
        item.name === 'Docker' || item.name.includes('Testing') || item.name === 'AWS'
          ? 'critical'
          : 'high';
    }

    return {
      skill: item.name,
      status,
      priority,
      resumeEvidence: sentence,
      jobRequirement: `Demonstrated experience or foundational knowledge in ${item.name} for modern entry-level engineering.`,
      explanation:
        status === 'demonstrated'
          ? `Evidenced in student resume. Candidate exhibits hands-on usage in projects or coursework.`
          : status === 'partial'
          ? `Listed as a keyword, but lacks substantive production metrics, unit tests, or architecture proof in project bullets.`
          : `Zero mentions or verifiable artifacts found in the resume. This is a noticeable gap for this role.`,
      recruiterExpectation: `Expects foundational competency, ability to construct small services, and explain core principles in technical screen.`,
    };
  });

  // Calculate scores
  const demonstratedCount = evaluatedGaps.filter((g) => g.status === 'demonstrated').length;
  const partialCount = evaluatedGaps.filter((g) => g.status === 'partial').length;
  const totalGaps = evaluatedGaps.length;

  const roleFitScore = Math.min(
    95,
    Math.max(45, Math.round(((demonstratedCount * 1.0 + partialCount * 0.5) / totalGaps) * 100))
  );

  // Check metrics in resume (e.g. numbers, %, +)
  const numbersFound = (resumeText.match(/\d+[%kK\+]?/g) || []).length;
  const impactScore = Math.min(95, Math.max(50, 50 + numbersFound * 5));

  // Check essential sections
  const hasEdu = resumeLower.includes('education');
  const hasSkills = resumeLower.includes('skills');
  const hasProj = resumeLower.includes('project');
  const hasExp = resumeLower.includes('experience');
  const sectionScore = (hasEdu ? 25 : 0) + (hasSkills ? 25 : 0) + (hasProj ? 25 : 0) + (hasExp ? 25 : 15);

  const atsOverall = Math.round((roleFitScore * 0.35 + impactScore * 0.35 + sectionScore * 0.3));

  // Extract key strengths from verified project lines
  const projectLines = resumeText
    .split('\n')
    .filter((l) => (l.includes('•') || l.includes('-')) && l.length > 40)
    .slice(0, 3);

  const keyStrengths = projectLines.map((line, idx) => ({
    title:
      idx === 0
        ? 'Full-Stack Architecture & API Construction'
        : idx === 1
        ? 'Relational Database Schema & Query Design'
        : 'Collaborative Agile Teamwork & Git Versioning',
    evidenceQuote: line.replace(/^[•\-\*]\s*/, '').trim(),
    impact:
      idx === 0
        ? 'Shows concrete capability to deliver end-to-end user interfaces and RESTful services.'
        : idx === 1
        ? 'Demonstrates foundational grasp of structured data storage and transaction safety.'
        : 'Proves readiness to work with team pull requests, code reviews, and sprints.',
  }));

  if (keyStrengths.length === 0) {
    keyStrengths.push({
      title: 'Solid Computer Science & Software Foundations',
      evidenceQuote: resumeText.slice(0, 120).trim(),
      impact: 'Demonstrates formal academic or coursework grounding in engineering principles.',
    });
  }

  // Interview preparation questions targeting gaps
  const missingOrPartial = evaluatedGaps.filter((g) => g.status !== 'demonstrated');
  const primaryGap1 = missingOrPartial[0]?.skill || 'Automated Testing (Jest/Vitest)';
  const primaryGap2 = missingOrPartial[1]?.skill || 'Docker & Containerization';
  const primaryGap3 = missingOrPartial[2]?.skill || 'PostgreSQL & Database Normalization';

  const interviewPreparation = [
    {
      id: 'q-gap-1',
      targetedGapSkill: primaryGap1,
      questionType: 'Technical Deep-Dive',
      question: `How would you design and implement comprehensive automated testing or validation for a new REST API endpoint?`,
      interviewerIntent: `Evaluates whether you write tests before shipping and understand unit vs integration testing layers.`,
      starGuidance: {
        situation: `In a recent project where API routes were prone to silent regressions.`,
        task: `Set up automated test suites using Vitest/Jest to assert input edge cases.`,
        action: `Wrote unit tests for core validation logic and mock-db integration tests for HTTP routes.`,
        result: `Caught 3 boundary bugs before deployment and provided high confidence for team refactors.`,
      },
      pitfallsToAvoid: `Don't say you only test manually via Postman or browser clicks. Mention automated assertions.`,
      recommendedKeyTalkingPoints: [
        'Mocking external service calls and test database isolation',
        'Asserting both 200 success payloads and 400/404/500 error boundaries',
        'Integrating test execution into GitHub Actions CI workflows',
      ],
    },
    {
      id: 'q-gap-2',
      targetedGapSkill: primaryGap2,
      questionType: 'System & Architecture',
      question: `Can you walk me through how you containerize an application with Docker and handle development vs production multi-stage builds?`,
      interviewerIntent: `Checks whether you understand reproducible environments, image sizing, and container lifecycle.`,
      starGuidance: {
        situation: `When setting up a service that needed to run identically across different developer machines and cloud hosts.`,
        task: `Create an optimized, secure Dockerfile with minimal image footprint.`,
        action: `Implemented multi-stage build separating compile dependencies from slim runtime image (e.g. node:alpine).`,
        result: `Reduced final container size by 65% and eliminated 'works on my machine' discrepancy.`,
      },
      pitfallsToAvoid: `Don't confuse Docker images with virtual machines; know the difference between layers and containers.`,
      recommendedKeyTalkingPoints: [
        'Using .dockerignore to exclude node_modules and secret files',
        'Running containers as non-root user for security best practices',
        'Multi-stage build separation of builder and runner phases',
      ],
    },
    {
      id: 'q-gap-3',
      targetedGapSkill: primaryGap3,
      questionType: 'Database & Performance',
      question: `When designing database schemas, how do you handle indexing, foreign key constraints, and avoid N+1 query performance bottlenecks?`,
      interviewerIntent: `Tests practical database understanding beyond simple ORM tutorials.`,
      starGuidance: {
        situation: `In an application where querying parent records and their children caused excessive database latency.`,
        task: `Optimize database queries and schema relations for fast pagination.`,
        action: `Added B-Tree indexes on foreign keys, utilized JOINs / eager loading, and inspected query execution plans.`,
        result: `Dropped endpoint query time from 380ms down to 42ms under concurrent load.`,
      },
      pitfallsToAvoid: `Avoid claiming that ORMs automatically solve performance without database understanding.`,
      recommendedKeyTalkingPoints: [
        'Explaining EXPLAIN ANALYZE for query performance diagnostics',
        'Foreign key cascades and index selection for filter columns',
        'Eager loading vs lazy loading trade-offs',
      ],
    },
    {
      id: 'q-gap-4',
      targetedGapSkill: 'System Reliability & Problem Solving',
      questionType: 'Behavioral & Troubleshooting',
      question: `Describe a time when you encountered an elusive bug or performance degradation in your project. How did you methodically isolate and resolve it?`,
      interviewerIntent: `Assesses troubleshooting methodology, resilience, and root-cause analysis mindset.`,
      starGuidance: {
        situation: `A state synchronization glitch occurred intermittently in a full-stack dashboard.`,
        task: `Isolate whether the root cause was frontend race condition, network latency, or backend serialization.`,
        action: `Added structured logging, reproduced the state in isolation, and inspected the HTTP payload timeline.`,
        result: `Identified an unhandled async race condition, implemented cleanup flags, and permanently documented the fix.`,
      },
      pitfallsToAvoid: `Don't say you randomly changed code until it worked; show a structured scientific debugging method.`,
      recommendedKeyTalkingPoints: [
        'Reproducing the issue in minimal reproducible environment',
        'Using browser dev tools network tab and server log traces',
        'Adding unit regression test to ensure the bug never recurs',
      ],
    },
  ];

  // Learning Roadmap milestones
  const isSevenDay = roadmapDuration.toLowerCase().includes('7');
  const milestones = isSevenDay
    ? [
        {
          phaseOrDay: 'Day 1 - 2',
          title: 'Dockerizing & Reproducible Local Environments',
          focusSkills: ['Docker', 'Multi-stage builds', 'Environment variables'],
          practicalTasks: [
            'Write a production-grade multi-stage Dockerfile for your primary backend project.',
            'Configure docker-compose.yml orchestrating the app server with a PostgreSQL container.',
            'Verify health checks and clean shutdown signals (SIGTERM).',
          ],
          projectMilestone: 'Containerized Full-Stack Starter Template published on GitHub with README setup instructions.',
          howToVerifyProgress: 'Run "docker compose up" from a clean machine directory and verify zero missing dependency errors.',
          recommendedResources: ['Docker Official Get-Started Docs', 'Node.js Docker Best Practices Guide'],
        },
        {
          phaseOrDay: 'Day 3 - 4',
          title: 'Automated Testing & Test-Driven CI/CD',
          focusSkills: ['Vitest/Jest', 'Integration Testing', 'GitHub Actions'],
          practicalTasks: [
            'Install Vitest and write 8 unit tests covering critical utility and validation logic.',
            'Build 4 HTTP integration tests with supertest asserting response status and schema.',
            'Create a .github/workflows/ci.yml pipeline that runs linter and tests on every pull request.',
          ],
          projectMilestone: 'Continuous Integration Badge added to repository showcasing green passing build status.',
          howToVerifyProgress: 'Push a deliberate breaking test to a branch and confirm GitHub Actions fails correctly.',
          recommendedResources: ['Vitest Documentation', 'GitHub Actions Starter Workflows for Node.js'],
        },
        {
          phaseOrDay: 'Day 5 - 6',
          title: 'Production Caching & Query Optimization',
          focusSkills: ['Redis', 'PostgreSQL Indexing', 'EXPLAIN ANALYZE'],
          practicalTasks: [
            'Spin up Redis and implement cache-aside pattern on high-traffic read endpoints.',
            'Add B-tree indexes to foreign keys and search columns in PostgreSQL.',
            'Benchmark API response times with and without cache using autocannon or k6.',
          ],
          projectMilestone: 'Performance benchmark report showing sub-50ms 95th-percentile response latency.',
          howToVerifyProgress: 'Verify Redis hits via redis-cli MONITOR and confirm database is bypassed on cache hits.',
          recommendedResources: ['Redis Developer Guide', 'Use The Index, Luke! SQL Guide'],
        },
        {
          phaseOrDay: 'Day 7',
          title: 'Portfolio Polish & Mock Technical Interview',
          focusSkills: ['System Architecture Diagrams', 'STAR Framing', 'Live Demo'],
          practicalTasks: [
            'Draw a clean system architecture diagram in Mermaid or Excalidraw and embed in README.',
            'Record a 2-minute concise Loom video walk-through explaining technical decisions.',
            'Rehearse STAR responses for containerization and testing questions out loud.',
          ],
          projectMilestone: 'Production-ready GitHub portfolio repository with live deployed Cloud URL.',
          howToVerifyProgress: 'Conduct a peer mock interview answering architectural questions without stumbling.',
          recommendedResources: ['Google SWE Interview Guide', 'Mermaid.js Documentation'],
        },
      ]
    : [
        {
          phaseOrDay: 'Week 1',
          title: 'Foundational Containerization & Microservice Tooling',
          focusSkills: ['Docker', 'Docker Compose', 'Container Security'],
          practicalTasks: [
            'Build and optimize multi-stage Dockerfiles for frontend (Vite/Nginx) and backend (Node.js).',
            'Configure volumes, network bridges, and persistent storage for local PostgreSQL.',
            'Implement non-root security principles and minimal alpine/distroless base images.',
          ],
          projectMilestone: 'Full-stack containerized microservice suite with one-command spin up.',
          howToVerifyProgress: 'Verify image size is under 150MB and runs flawlessly across Linux/macOS.',
          recommendedResources: ['Docker Official Docs', 'Awesome Docker Cheatsheets'],
        },
        {
          phaseOrDay: 'Week 2',
          title: 'Test Engineering & CI/CD Pipeline Automation',
          focusSkills: ['Vitest/Jest', 'Supertest', 'GitHub Actions', 'Code Coverage'],
          practicalTasks: [
            'Set up test fixtures and write unit tests achieving >80% branch coverage on core logic.',
            'Implement end-to-end API integration tests against a mock database container.',
            'Build GitHub Actions CI pipeline executing lint, type-check, and automated test runners.',
          ],
          projectMilestone: 'Automated CI/CD pipeline blocking pull requests with failing tests or type errors.',
          howToVerifyProgress: 'Confirm all test suites run headlessly in under 45 seconds in CI runner.',
          recommendedResources: ['Vitest Docs', 'GitHub Actions Documentation'],
        },
        {
          phaseOrDay: 'Week 3',
          title: 'Scalable Databases, Indexing & High-Performance Caching',
          focusSkills: ['PostgreSQL', 'Redis', 'Database Migrations', 'Transactions'],
          practicalTasks: [
            'Design normalized third-normal-form relational schemas with foreign key constraints.',
            'Execute EXPLAIN ANALYZE on complex multi-table JOINs and apply composite indexes.',
            'Integrate Redis caching with automatic TTL invalidation on database mutations.',
          ],
          projectMilestone: 'High-throughput transactional API capable of handling 500+ requests/sec.',
          howToVerifyProgress: 'Run load testing with autocannon and demonstrate 80% reduction in query latency.',
          recommendedResources: ['PostgreSQL Documentation', 'Redis University Free Courses'],
        },
        {
          phaseOrDay: 'Week 4',
          title: 'Cloud Deployment, Observability & Technical Interview Mastery',
          focusSkills: ['AWS/Cloud Run', 'Prometheus/Logging', 'Architecture Presentation'],
          practicalTasks: [
            'Deploy containerized application to cloud infrastructure (AWS ECS, Cloud Run, or Render).',
            'Add structured JSON logging and health check endpoints (/healthz, /metrics).',
            'Create an architectural case study document detailing trade-offs and lessons learned.',
            'Complete 5 live timed mock interview drills using the STAR framework.',
          ],
          projectMilestone: 'Live deployed web application with custom domain, CI/CD, and portfolio case study.',
          howToVerifyProgress: 'Present system architecture and answer surprise failure-scenario questions clearly.',
          recommendedResources: ['Google Cloud Architecture Center', 'Tech Interview Handbook'],
        },
      ];

  // Career Navigator alternative roles
  const careerNavigatorRoles = [
    {
      title: 'Junior Frontend / UI Engineer',
      matchPercentage: Math.min(94, roleFitScore + 10),
      rationale:
        'Your demonstrated strength in modern TypeScript, React, responsive layouts, and state management matches frontend engineering expectations directly.',
      leverageSkills: ['React', 'TypeScript', 'Tailwind CSS', 'REST Integration'],
      bridgeSkills: ['Accessibility (WCAG AA)', 'Component Testing with Vitest'],
      marketOutlook: 'Strong entry-level demand across SaaS and agency teams.',
    },
    {
      title: 'Junior Backend / API Developer',
      matchPercentage: Math.min(90, roleFitScore + 6),
      rationale:
        'Your experience designing REST endpoints in Express/Node.js and constructing SQL database queries provides an immediate bridge to dedicated backend roles.',
      leverageSkills: ['Node.js', 'Express', 'SQL & PostgreSQL', 'API Design'],
      bridgeSkills: ['Docker Containerization', 'Redis Caching & Message Queues'],
      marketOutlook: 'Steady growth for microservice and data-driven platform teams.',
    },
    {
      title: 'Associate Solutions & Cloud Engineer',
      matchPercentage: Math.max(65, roleFitScore - 8),
      rationale:
        'Understanding how full-stack apps communicate across networks equips you well for client-facing cloud solutions and deployment engineering.',
      leverageSkills: ['Linux CLI', 'HTTP Protocol', 'Git', 'Scripting'],
      bridgeSkills: ['AWS Core Services', 'Infrastructure-as-Code (Terraform)'],
      marketOutlook: 'High compensation and expanding opportunities in enterprise tech.',
    },
    {
      title: 'Junior QA & Automation Engineer',
      matchPercentage: Math.min(92, roleFitScore + 8),
      rationale:
        'Teams value candidates who write clean code and have analytical rigor to author automated test suites and maintain quality gates.',
      leverageSkills: ['JavaScript/TypeScript', 'API Testing', 'Git Workflows'],
      bridgeSkills: ['Playwright/Cypress', 'CI/CD Pipeline Integration'],
      marketOutlook: 'High hiring volume with fast progression into SWE roles.',
    },
  ];

  return {
    executiveSummary: `Candidate demonstrates solid foundational competency in modern web technologies and structured project delivery. The primary gap centers on enterprise-ready production practices (Docker containerization, automated test suites, and cloud infrastructure) which are easily bridged with targeted hands-on labs.`,
    roleFitScore,
    roleFitRationale: `Calculated from ${demonstratedCount} verified demonstrated technical skills and ${partialCount} partial competencies against ${totalGaps} target job specifications. Entry-level hiring teams evaluate foundational grasp and project evidence over extensive corporate tenure.`,
    atsEvaluation: {
      overallScore: atsOverall,
      disclaimer: `Educational Heuristic: This score is an AI simulated estimation of structural ATS parseability and keyword density. It does not represent an official score from any commercial ATS vendor.`,
      breakdown: {
        keywordAlignment: {
          score: Math.min(95, Math.max(60, roleFitScore + 5)),
          feedback: `Good coverage of core programming languages and frameworks. Adding containerization and testing terminology will increase match index.`,
        },
        readabilityAndStructure: {
          score: 88,
          feedback: `Clean logical hierarchy. Sections are well-ordered and parser-friendly. Ensure consistent date formatting across all sections.`,
        },
        measurableImpact: {
          score: impactScore,
          feedback: `Contains ${numbersFound} quantifiable figures. Transform descriptive project bullets into outcome-oriented metrics (e.g. latency reduction %, user counts, query improvements).`,
        },
        projectDepth: {
          score: 82,
          feedback: `Projects showcase full-stack integration and relational schemas. Highlight technical architecture decisions and edge-case handling.`,
        },
        essentialSections: {
          score: sectionScore,
          feedback: `Key sections (Education, Skills, Projects, Experience) are distinct and properly categorized.`,
        },
      },
      actionableImprovementTips: [
        'Quantify project achievements with specific metrics (e.g. "reduced latency by 18%", "served 1,400+ weekly users").',
        'Explicitly add "Automated Testing (Vitest/Jest)" and "Docker" to your Technical Skills section after building the roadmap projects.',
        'Begin each experience bullet with strong action verbs (e.g. "Engineered", "Architected", "Optimized", "Refactored").',
        'Link live hosted deployments and clean GitHub repositories with comprehensive READMEs for every project.',
      ],
    },
    keyStrengths,
    skillGapAnalysis: evaluatedGaps,
    careerNavigatorRoles,
    learningRoadmap: {
      duration: isSevenDay ? '7-Day Intensive Sprint' : '30-Day Comprehensive Mastery',
      title: isSevenDay
        ? '7-Day Fast-Track Gap Closure Sprint'
        : '30-Day Full-Stack Competency Mastery Plan',
      objective: `Bridge critical blockers in ${primaryGap1} and ${primaryGap2} with verifiable GitHub portfolio artifacts ready for technical interviews.`,
      milestones,
    },
    interviewPreparation,
  };
}

export function generateHeuristicCareerMatches(input: CareerMatchInput): CareerMatchResult {
  const text = `${input.technicalSkills} ${input.softSkills} ${input.projects} ${input.interests}`.toLowerCase();
  
  const hasFrontend = text.includes('react') || text.includes('html') || text.includes('css') || text.includes('tailwind') || text.includes('javascript') || text.includes('typescript');
  const hasBackend = text.includes('node') || text.includes('express') || text.includes('sql') || text.includes('postgres') || text.includes('api') || text.includes('python');
  const hasData = text.includes('python') || text.includes('pandas') || text.includes('sql') || text.includes('machine learning') || text.includes('data') || text.includes('tableau');
  const hasDevops = text.includes('docker') || text.includes('aws') || text.includes('linux') || text.includes('git') || text.includes('cloud') || text.includes('ci/cd');

  const roles = [
    {
      role: 'Junior Full-Stack Developer',
      matchPercentage: hasFrontend && hasBackend ? 88 : hasFrontend || hasBackend ? 76 : 64,
      fitReason: 'Your combination of client-side architecture and server/database interaction aligns with early-career full-stack responsibilities.',
      skillsYouHave: ['JavaScript/TypeScript', 'Web Architecture', 'API Consumption', 'Version Control'],
      requiredSkills: ['React', 'Node.js/Express', 'PostgreSQL/MySQL', 'Docker Basics', 'Testing with Jest/Vitest'],
      bridgeSkills: ['Containerization (Docker)', 'Automated Unit/Integration Testing'],
      marketDemand: 'High hiring activity across SaaS startups, digital products, and FinTech platforms.',
      recommendedNextSteps: [
        'Build a full-stack CRUD application with JWT auth and relational database persistence.',
        'Implement automated tests for both server API endpoints and UI components.',
        'Deploy the project on a public cloud provider (Render, Railway, or AWS) with custom domain.'
      ]
    },
    {
      role: 'Junior Frontend / UI Engineer',
      matchPercentage: hasFrontend ? 91 : 68,
      fitReason: 'Strong affinity with responsive user interfaces, modular components, modern styling, and client-side performance.',
      skillsYouHave: ['HTML5/CSS3', 'Modern JS', 'Component Design', 'Git Workflows'],
      requiredSkills: ['React / Next.js', 'TypeScript', 'Tailwind CSS', 'State Management', 'Accessibility (WCAG)'],
      bridgeSkills: ['TypeScript strict typing', 'WCAG accessibility compliance', 'End-to-end testing with Playwright'],
      marketDemand: 'Consistent high volume for web applications and mobile-responsive dashboards.',
      recommendedNextSteps: [
        'Refactor existing components into reusable design system components with Storybook.',
        'Implement lighthouse performance optimizations (image lazy-loading, code-splitting).',
        'Publish interactive portfolio projects demonstrating pixel-perfect Figma translation.'
      ]
    },
    {
      role: 'Entry-Level AI & Data Analyst',
      matchPercentage: hasData ? 85 : 62,
      fitReason: 'Analytical acumen, data cleaning, and transforming quantitative inputs into business intelligence narratives.',
      skillsYouHave: ['Data Exploration', 'Quantitative Reasoning', 'SQL Queries', 'Reporting'],
      requiredSkills: ['Python (Pandas, NumPy)', 'Advanced SQL', 'Data Visualization (PowerBI / Tableau)', 'Lightweight ML'],
      bridgeSkills: ['FastAPI model inference endpoints', 'Data warehouse querying (Snowflake / BigQuery)'],
      marketDemand: 'Surging demand across enterprise operations, healthcare, and consumer analytics.',
      recommendedNextSteps: [
        'Perform exploratory data analysis on a public dataset and generate interactive charts.',
        'Write complex SQL queries involving window functions and common table expressions.',
        'Deploy an interactive dashboard on Streamlit or Tableau Public with narrative insights.'
      ]
    },
    {
      role: 'Associate Cloud & DevOps Engineer',
      matchPercentage: hasDevops ? 84 : 60,
      fitReason: 'Interest in reliable system automation, Linux environments, container deployment, and infrastructure scalability.',
      skillsYouHave: ['Linux CLI', 'Bash Scripting', 'Git Versioning', 'Networking Basics'],
      requiredSkills: ['Docker', 'AWS / GCP Core Services', 'CI/CD Pipelines (GitHub Actions)', 'Terraform Basics'],
      bridgeSkills: ['Infrastructure-as-Code (Terraform)', 'Monitoring with Prometheus/Grafana'],
      marketDemand: 'Accelerating demand with high compensation and robust progression opportunities.',
      recommendedNextSteps: [
        'Containerize a multi-service web application and manage it with Docker Compose.',
        'Set up a GitHub Actions workflow that runs test suites and builds production images on push.',
        'Earn an entry-level cloud certification (e.g. AWS Certified Cloud Practitioner).'
      ]
    }
  ];

  return {
    summary: `Based on your profile in ${input.education || 'technology'} and skills in ${input.technicalSkills || 'software engineering'}, you demonstrate versatile foundations for entry-level technology paths.`,
    topRoles: roles.sort((a, b) => b.matchPercentage - a.matchPercentage),
  };
}

export function generateFallbackInterviewQuestions(
  targetRole: string,
  experienceLevel: string,
  interviewType: string
): string[] {
  const role = targetRole || 'Software Engineer';
  if (interviewType === 'Technical') {
    return [
      `Can you explain how state management and data flow work in your recent projects for ${role}?`,
      `How do you approach error handling, validation, and testing when building critical features?`,
      `Walk me through an architectural trade-off or performance bottleneck you resolved in your code.`,
      `If an API or database query is responding slowly in production, what methodical steps do you take to isolate the cause?`
    ];
  } else if (interviewType === 'Behavioural') {
    return [
      `Tell me about a challenging project deadline or unexpected blocker you faced. How did you prioritize?`,
      `Describe a time when you received constructive or critical feedback on your work. How did you respond?`,
      `Give an example of a situation where you had to collaborate with team members who had conflicting opinions.`,
      `Tell me about a time you had to learn a completely unfamiliar technology or framework on a short timeline.`
    ];
  } else {
    // HR Interview
    return [
      `Walk me through your background and what motivated you to pursue a career as a ${role}.`,
      `What specifically attracted you to this role, and how does it fit into your long-term career goals?`,
      `How do you maintain continuous learning and stay updated with modern developments in ${role}?`,
      `Where do you see yourself contributing most effectively during your first 90 days on the job?`
    ];
  }
}

export function generateFallbackInterviewFeedback(
  question: string,
  answer: string,
  targetRole: string,
  interviewType: string
): InterviewAnswerFeedback {
  const wordCount = answer.trim().split(/\s+/).length;
  const hasNumbers = /\d+/.test(answer);
  const hasStarStructure = /situation|task|action|result|when|because|then|finally/i.test(answer);

  const baseScore = Math.min(9, Math.max(5, 5 + (wordCount > 35 ? 2 : 0) + (hasNumbers ? 1 : 0) + (hasStarStructure ? 1 : 0)));

  return {
    scoreOutOf10: baseScore,
    rubricScores: {
      relevance: Math.min(10, baseScore + 1),
      clarity: Math.min(10, baseScore),
      depthOrCorrectness: Math.max(5, baseScore - 1),
      structure: hasStarStructure ? 8 : 6,
    },
    overallCritique: `Solid response demonstrating genuine familiarity with ${targetRole} fundamentals. Good communication style with constructive problem-solving logic.`,
    strengths: [
      'Directly addresses the premise of the interviewer question.',
      'Uses appropriate technical or professional vocabulary in context.',
      'Demonstrates a solution-oriented and collaborative attitude.'
    ],
    improvements: [
      'Frame answers using the STAR method (Situation, Task, Action, Result) for greater executive polish.',
      'Quantify results where possible (e.g. latency reduced by 25%, 3-day turnaround, 100% test coverage).'
    ],
    modelAnswer: `In my previous project, our team needed to implement a resilient solution for this exact scenario. I isolated the core requirements, established automated test cases, and executed the implementation with clear logging and boundary validation. As a result, we delivered the feature ahead of schedule with zero production regressions.`,
    followUpQuestion: `That's insightful. If requirements changed mid-sprint to handle 10x higher user concurrency, what is the first architectural modification you would evaluate?`
  };
}

export function generateFallbackInterviewSummary(
  targetRole: string,
  interviewType: string,
  history: any[]
): InterviewFinalSummary {
  const avgScore = history.length > 0
    ? Math.round(history.reduce((acc, h) => acc + (h.feedback?.scoreOutOf10 || 7), 0) / history.length * 10)
    : 78;

  return {
    overallScore: avgScore,
    readinessLevel: avgScore >= 80 ? 'Ready for Technical Screening' : 'Approaching Readiness — Polish Execution',
    executiveSummary: `Candidate demonstrated consistent technical composure and logical problem framing across ${history.length || 4} interview questions for the ${targetRole} (${interviewType}) evaluation.`,
    keyStrengths: [
      'Articulate communication of personal projects and architectural decisions.',
      'Good baseline understanding of software delivery lifecycle and collaboration.',
      'Positive receptiveness to follow-up questions and constructive edge cases.'
    ],
    criticalGrowthAreas: [
      'Practice delivering answers strictly within a 90 to 120-second window.',
      'Deepen mastery of system trade-offs (e.g. latency vs consistency, memory vs CPU).',
      'Always conclude behavioural answers with measurable project outcomes.'
    ],
    preparationRoadmap: [
      'Rehearse 5 STAR stories covering leadership, failure recovery, optimization, and conflict resolution.',
      'Draw system architecture diagrams for your top 2 portfolio projects on a whiteboard.',
      'Conduct 2 mock technical screenings before your next scheduled company interview.'
    ]
  };
}

export function generateFallbackRoadmap(
  currentSkills: string = '',
  targetRole: string = 'Software Developer',
  duration: string = '30-day',
  currentLevel: string = 'Beginner',
  studyYear: string = '2nd-Year B.Tech',
  dailyTime: string = '1 hour/day',
  candidateName: string = 'Candidate'
): LearningRoadmap {
  const skillsLower = currentSkills.toLowerCase();
  const hasJava = skillsLower.includes('java') && !skillsLower.includes('javascript');
  const hasC = skillsLower.includes('c,') || skillsLower.includes('c ') || skillsLower.includes(' c') || skillsLower.startsWith('c');
  const hasGit = skillsLower.includes('git');
  const hasPython = skillsLower.includes('python');
  const hasWeb = skillsLower.includes('react') || skillsLower.includes('html') || skillsLower.includes('javascript') || skillsLower.includes('css');
  const hasData = targetRole.toLowerCase().includes('data') || targetRole.toLowerCase().includes('analyst');

  // Normalize duration label
  const isSevenDay = duration.includes('7');
  const isSixtyDay = duration.includes('60');
  const isNinetyDay = duration.includes('90');
  const durationTitle = isSevenDay
    ? '7-Day Intensive Sprint'
    : isSixtyDay
    ? '60-Day Structured College Roadmap'
    : isNinetyDay
    ? '90-Day Full Transformation'
    : '30-Day Foundation-to-Project Roadmap';

  // Stated Assumptions
  const statedAssumptions = [
    `Assumed student is in ${studyYear || '2nd-Year B.Tech'} studying computer science/engineering fundamentals.`,
    `Paced for ${dailyTime || '1 hour per day'} (approx. 6–8 hours per week) with manageable daily chunks.`,
    `Prioritizes foundational language syntax and OOP before complex enterprise frameworks or deployment.`,
    `Skills entered (${currentSkills || 'General Programming'}) are treated as self-reported until validated by diagnostics.`,
  ];

  // Skill Validation Summary
  const skillValidationSummary: ValidatedSkillItem[] = [
    {
      skill: hasJava ? 'Java Programming' : hasPython ? 'Python' : hasC ? 'C Programming' : 'Core Programming Language',
      proficiencyLevel: (currentLevel as any) || 'Beginner',
      category: 'You already know',
      whyItMatters: 'Serves as your primary programming vehicle for technical problem-solving and coding interviews.',
      competencyToDemonstrate: 'Write clean syntactically valid code with loops, conditionals, methods, and error handling.',
      isValidated: false,
    },
    {
      skill: hasGit ? 'Git & Version Control' : 'Git Basics',
      proficiencyLevel: 'Beginner',
      category: hasGit ? 'You already know' : 'Learn next',
      whyItMatters: 'Every engineering team requires Git for daily commits, pull requests, and tracking code revisions.',
      competencyToDemonstrate: 'Initialize repositories, write meaningful atomic commits, create feature branches, and push to GitHub.',
      isValidated: false,
    },
    {
      skill: 'Object-Oriented Programming (OOP)',
      proficiencyLevel: 'Beginner',
      category: 'Strengthen this skill',
      whyItMatters: 'The backbone of software architecture. Tech companies evaluate candidate ability to model real-world entities.',
      competencyToDemonstrate: 'Implement classes, encapsulation with private fields, inheritance, interfaces, and polymorphism.',
      isValidated: false,
    },
    {
      skill: 'Linear Data Structures (Arrays & Strings)',
      proficiencyLevel: 'Beginner',
      category: 'Strengthen this skill',
      whyItMatters: 'Core building blocks asked in 80% of entry-level campus placement coding rounds.',
      competencyToDemonstrate: 'Traverse, search, reverse, filter, and manipulate 1D/2D arrays and string characters with O(n) awareness.',
      isValidated: false,
    },
    {
      skill: 'Essential Non-Linear Structures (HashMaps & Stacks)',
      proficiencyLevel: 'Beginner',
      category: 'Learn next',
      whyItMatters: 'Hash tables reduce lookup time from linear O(n) to constant O(1), critical for high-efficiency programs.',
      competencyToDemonstrate: 'Store and retrieve key-value pairs, count frequencies, and solve balanced bracket problems.',
      isValidated: false,
    },
    {
      skill: 'Database Basics (SQL & CRUD)',
      proficiencyLevel: 'Beginner',
      category: 'Learn next',
      whyItMatters: 'Real software must persist data across sessions instead of losing state on program shutdown.',
      competencyToDemonstrate: 'Write SELECT, INSERT, UPDATE, DELETE queries and join relational tables using foreign keys.',
      isValidated: false,
    },
  ];

  // Diagnostic Assessments
  const diagnosticAssessments: DiagnosticQuestion[] = [
    {
      id: 'diag-1',
      skill: 'Java & OOP Foundations',
      question: 'In Java or C++, what is the primary benefit of declaring class variables as "private" and accessing them via getters and setters?',
      options: [
        'It speeds up runtime code execution in the JVM compiler.',
        'It prevents external code from modifying internal object state arbitrarily (Encapsulation).',
        'It allows child classes to override private variables automatically.',
        'It allocates memory on the stack instead of the heap.',
      ],
      correctAnswerIndex: 1,
      explanation: 'Encapsulation shields an object internal fields from unintended direct modification, enforcing business validation rules inside setter methods.',
      competencyTested: 'Class Encapsulation and Data Protection',
    },
    {
      id: 'diag-2',
      skill: 'Git & Version Control',
      question: 'Which Git command creates a new feature branch named "feature-login" and switches to it in one step?',
      options: [
        'git branch -m feature-login',
        'git commit -b feature-login',
        'git checkout -b feature-login (or git switch -c feature-login)',
        'git merge feature-login',
      ],
      correctAnswerIndex: 2,
      explanation: '"git checkout -b <branch>" (or modern "git switch -c <branch>") creates the branch locally and immediately sets HEAD to it.',
      competencyTested: 'Branch Management and Workflow Isolation',
    },
    {
      id: 'diag-3',
      skill: 'Arrays & Complexity',
      question: 'If you need to check whether a specific element exists in an unsorted array of size N, what is the worst-case time complexity?',
      options: [
        'O(1) constant time',
        'O(log N) logarithmic time',
        'O(N) linear time',
        'O(N^2) quadratic time',
      ],
      correctAnswerIndex: 2,
      explanation: 'In an unsorted array, you may need to examine all N elements one by one before concluding it is absent, which takes O(N) time.',
      competencyTested: 'Linear Search & Time Complexity Awareness',
    },
  ];

  // Build Milestones depending on duration and profile
  const milestones: RoadmapMilestone[] = [
    {
      phaseOrDay: isSevenDay ? 'Days 1 - 2' : 'Phase 1 (Weeks 1 - 2)',
      title: 'Language Fundamentals & Object-Oriented Core',
      timeFrame: isSevenDay ? 'Day 1 to 2 (2 Days)' : 'Weeks 1 to 2 (14 Days)',
      learningObjective: 'Consolidate fundamental syntax into robust object-oriented thinking with clean class modeling.',
      focusSkills: ['Classes & Objects', 'Encapsulation & Constructors', 'Git Branching & Commits'],
      practicalTasks: [
        'Review basic syntax: variables, conditionals, loops, and methods.',
        'Implement Encapsulation: create classes with private fields and validated getters/setters.',
        'Configure Git locally and create initial commit repository on GitHub.',
      ],
      detailedTasks: [
        {
          id: 'task-1-1',
          title: 'Mastering Classes, Objects, and Encapsulation',
          whatToLearn: 'Understand how to model real-world concepts into code using classes (blueprints) and objects (instances). Encapsulation means keeping variables private so outside code cannot accidentally corrupt them.',
          whyToLearn: `Hiring managers for ${targetRole} positions expect candidates to write modular, maintainable code rather than dumping all logic into one giant main method.`,
          whatToDo: [
            'Create a class named "Student" with private fields: id, name, and gpa.',
            'Write a parameterized constructor that initializes these fields and checks that GPA is between 0.0 and 4.0 (or 10.0).',
            'Provide public getter and setter methods with input validation in the setter.',
          ],
          practiceTask: 'Write a small program that instantiates 3 student objects, updates their GPA using setters, and prints out formatted student profiles.',
          deliverable: 'A clean "Student.java" file with zero compiler warnings and input validation comments.',
          estimatedTime: '45 - 60 minutes',
          completionCriteria: 'Code compiles without errors, setters reject negative GPA values, and sample output prints neatly in the terminal.',
          learningResources: [
            {
              title: 'Oracle Java Tutorials: Classes and Objects',
              url: 'https://docs.oracle.com/javase/tutorial/java/javaOO/classes.html',
              type: 'Official Docs',
            },
            {
              title: 'W3Schools Java Encapsulation Guide',
              url: 'https://www.w3schools.com/java/java_encapsulation.asp',
              type: 'Tutorial',
            },
          ],
        },
        {
          id: 'task-1-2',
          title: 'Inheritance, Method Overriding, and Polymorphism',
          whatToLearn: 'Inheritance allows a new class to inherit attributes and methods from an existing parent class. Polymorphism allows methods to do different things based on the specific object that invokes them.',
          whyToLearn: 'Enables code reuse and avoids copy-pasting code across multiple classes, which is a major red flag in code reviews.',
          whatToDo: [
            'Create a base class "Employee" with a calculateSalary() method.',
            'Create subclasses "FullTimeEmployee" and "Intern" that override calculateSalary() with distinct formulas.',
            'Write a main loop that iterates over an array of Employee references and calls calculateSalary() polymorphically.',
          ],
          practiceTask: 'Implement the Employee hierarchy with at least two subclasses and run a test payroll calculation.',
          deliverable: 'A multi-class payroll demonstration pushed to a local git repository.',
          estimatedTime: '60 minutes',
          completionCriteria: 'Child classes use the @Override annotation, correctly invoke super() where appropriate, and demonstrate runtime polymorphic behavior.',
          learningResources: [
            {
              title: 'Oracle Java Tutorials: Inheritance',
              url: 'https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html',
              type: 'Official Docs',
            },
          ],
        },
        {
          id: 'task-1-3',
          title: 'Professional Git Hygiene: Commits, Branches & Remote GitHub',
          whatToLearn: 'Git tracks changes in your code history. A repository is your project folder, a commit is a saved snapshot, and a branch lets you work on features without breaking working code.',
          whyToLearn: 'College students who know git branch, pull requests, and commit hygiene stand out immediately over candidates who upload zip files.',
          whatToDo: [
            'Run "git init" in your project directory and create a ".gitignore" file to ignore build artifacts.',
            'Create meaningful commit messages following the standard: "feat: implement student class with encapsulation".',
            'Create a GitHub repository and push your code with "git remote add origin" and "git push -u origin main".',
          ],
          practiceTask: 'Create a feature branch named "feature-toString", add a custom toString() method to your class, commit, and merge it back to main.',
          deliverable: 'A public GitHub repository link showing at least 3 distinct, well-described commits.',
          estimatedTime: '45 minutes',
          completionCriteria: 'GitHub repo contains a clean README.md and at least one merged feature branch commit.',
          learningResources: [
            {
              title: 'Pro Git Book (Official Free Git Guide)',
              url: 'https://git-scm.com/book/en/v2',
              type: 'Official Docs',
            },
          ],
        },
      ],
      projectMilestone: 'Object-Oriented Student Management Console Starter published on GitHub with atomic commit history.',
      howToVerifyProgress: 'Clone the repo in a clean directory, compile with javac, and verify that all classes instantiate and validate inputs without errors.',
      recommendedResources: [
        'Oracle Java Tutorials (docs.oracle.com)',
        'Pro Git Book (git-scm.com/book)',
      ],
      checkpoint: {
        id: 'checkpoint-phase-1',
        title: 'Phase 1 Checkpoint: OOP & Git Fundamentals',
        description: 'Verify your understanding of classes, encapsulation, and version control before moving to data structures.',
        passingScorePercent: 70,
        questions: [
          {
            id: 'q1-1',
            question: 'What is the purpose of the "@Override" annotation in Java?',
            options: [
              'It forces the method to run in a background worker thread.',
              'It tells the compiler that the method is intended to override a method declared in a superclass, catching spelling mistakes.',
              'It prevents subclasses from modifying the method.',
              'It makes the method accessible from any package.',
            ],
            correctAnswerIndex: 1,
            explanation: 'The @Override annotation asks the compiler to check that the method signature exactly matches a method in the superclass or interface, preventing subtle typo bugs.',
            competencyTested: 'Inheritance and Polymorphism',
          },
          {
            id: 'q1-2',
            question: 'Why should class variables generally NOT be declared with "public" access?',
            options: [
              'Because public variables take double the RAM memory.',
              'Because external classes could assign invalid values (e.g., negative age or balance) without validation.',
              'Because public variables cannot be used inside loops.',
              'Because the JVM cannot serialize public variables.',
            ],
            correctAnswerIndex: 1,
            explanation: 'Declaring variables public breaks encapsulation by allowing any caller to bypass business logic and write illegal state directly into the object.',
            competencyTested: 'Encapsulation Best Practices',
          },
          {
            id: 'q1-3',
            question: 'What is the purpose of a ".gitignore" file in a software project?',
            options: [
              'It tells Git which people are not allowed to view the project.',
              'It specifies untracked files (such as compiled .class files, logs, and secret keys) that Git should intentionally ignore.',
              'It deletes old commits from the repository history.',
              'It encrypts source code files before pushing to GitHub.',
            ],
            correctAnswerIndex: 1,
            explanation: '.gitignore prevents temporary build files (.class, node_modules, target/) and environment secrets from polluting version control.',
            competencyTested: 'Git Configuration and Hygiene',
          },
        ],
      },
      expectedOutcomes: [
        'Ability to design classes with private variables and validated setters.',
        'Ability to write clean modular programs using inheritance and method overriding.',
        'Fluency with git init, add, commit, branch, and pushing to remote GitHub.',
      ],
    },
    {
      phaseOrDay: isSevenDay ? 'Days 3 - 4' : 'Phase 2 (Weeks 3 - 4)',
      title: 'Essential Data Structures: Arrays, Strings & HashMaps',
      timeFrame: isSevenDay ? 'Day 3 to 4 (2 Days)' : 'Weeks 3 to 4 (14 Days)',
      learningObjective: 'Master fundamental in-memory collections and learn how to analyze the efficiency (Big-O) of your code.',
      focusSkills: ['ArrayList & Dynamic Arrays', 'String Manipulation', 'HashMaps for Fast Lookups', 'Time & Space Complexity'],
      practicalTasks: [
        'Practice array operations: two-pointer techniques, reversing, and filtering.',
        'Learn String immutability and StringBuilder for efficient concatenation.',
        'Use HashMaps to solve frequency counting and O(1) lookup problems.',
      ],
      detailedTasks: [
        {
          id: 'task-2-1',
          title: 'Dynamic Arrays & The Two-Pointer Technique',
          whatToLearn: 'A standard array has a fixed size, while dynamic arrays (ArrayList in Java, list in Python) grow automatically. The two-pointer technique uses two index variables to scan an array from both ends or at different speeds.',
          whyToLearn: 'Two-pointer problems appear in almost every first-round technical screening for entry-level engineering roles.',
          whatToDo: [
            'Implement an in-place array reversal using left and right pointers.',
            'Solve the "Two Sum" problem or "Pair with Given Sum in Sorted Array".',
            'Analyze why the two-pointer approach takes O(n) time instead of O(n^2) nested loops.',
          ],
          practiceTask: 'Given an array of integers, remove duplicates in-place such that each unique element appears only once, returning the new length.',
          deliverable: 'A documented solution file with step-by-step comments explaining pointer movements.',
          estimatedTime: '60 minutes',
          completionCriteria: 'Solution runs in O(n) time and O(1) extra space without allocating a second array.',
          learningResources: [
            {
              title: 'GeeksforGeeks: Two Pointer Technique',
              url: 'https://www.geeksforgeeks.org/two-pointers-technique/',
              type: 'Guide',
            },
          ],
        },
        {
          id: 'task-2-2',
          title: 'String Immutability & StringBuilder Efficiency',
          whatToLearn: 'In Java and Python, Strings are immutable—meaning every time you modify or concatenate a string with "+", a brand-new object is created in memory. StringBuilder modifies strings in-place without generating garbage objects.',
          whyToLearn: 'Interviewers frequently test whether you know why repeated string concatenation in loops causes memory leaks and O(n^2) slowdowns.',
          whatToDo: [
            'Benchmark a loop concatenating 10,000 characters using String vs StringBuilder.',
            'Write an anagram checker that compares character frequency arrays.',
            'Implement a palindrome validator that ignores punctuation and capitalization.',
          ],
          practiceTask: 'Build a function isPalindrome(String s) that cleans non-alphanumeric characters and checks symmetry using two pointers.',
          deliverable: 'Palindrome and Anagram checker methods with 5 unit test assertions.',
          estimatedTime: '45 - 60 minutes',
          completionCriteria: 'Handles empty strings, mixed casing, and special characters correctly.',
          learningResources: [
            {
              title: 'Oracle Java Tutorials: Strings and StringBuilder',
              url: 'https://docs.oracle.com/javase/tutorial/java/data/strings.html',
              type: 'Official Docs',
            },
          ],
        },
        {
          id: 'task-2-3',
          title: 'HashMaps: The Secret Weapon for O(1) Lookups',
          whatToLearn: 'A HashMap stores key-value pairs using a hash function. Searching for an item in a list takes O(n) time, but looking up a key in a HashMap takes O(1) average time.',
          whyToLearn: 'HashMaps are the single most frequently utilized data structure in production software systems (caching, lookups, indexing).',
          whatToDo: [
            'Create a HashMap<String, Integer> to count word frequencies in a text paragraph.',
            'Use HashMap to find the first non-repeating character in a string.',
            'Learn how HashMap handles collisions using linked lists or balanced trees under the hood.',
          ],
          practiceTask: 'Write a WordFrequencyCounter class that takes a block of text and returns the top 3 most common words.',
          deliverable: 'A working frequency counter console utility pushed to GitHub.',
          estimatedTime: '60 minutes',
          completionCriteria: 'Processes text accurately, handles case-insensitivity, and outputs top words with counts.',
          learningResources: [
            {
              title: 'W3Schools Java HashMap Tutorial',
              url: 'https://www.w3schools.com/java/java_hashmap.asp',
              type: 'Tutorial',
            },
          ],
        },
      ],
      projectMilestone: 'Algorithmic Problem-Solving Suite with 5 documented solutions in a clean GitHub repository.',
      howToVerifyProgress: 'Run each solution with 3 edge-case inputs (empty array, single element, negative numbers) and verify expected outputs.',
      recommendedResources: [
        'GeeksforGeeks Data Structures Guide',
        'NeetCode / LeetCode Beginner Practice List',
      ],
      checkpoint: {
        id: 'checkpoint-phase-2',
        title: 'Phase 2 Checkpoint: Arrays, Strings & HashMaps',
        description: 'Test your understanding of efficiency trade-offs and collections.',
        passingScorePercent: 70,
        questions: [
          {
            id: 'q2-1',
            question: 'What is the average time complexity to look up a value by its key in a standard HashMap?',
            options: [
              'O(N) linear time',
              'O(log N) logarithmic time',
              'O(1) constant time',
              'O(N^2) quadratic time',
            ],
            correctAnswerIndex: 2,
            explanation: 'Due to hashing functions indexing directly to array buckets, HashMap retrieval operates in O(1) constant time under normal distribution.',
            competencyTested: 'Hash Table Operations & Complexity',
          },
          {
            id: 'q2-2',
            question: 'Why is using StringBuilder preferred over String concatenation (+) inside a large loop in Java?',
            options: [
              'StringBuilder encrypts strings automatically.',
              'Strings are immutable, so "+" creates a new String object on every iteration, leading to heavy memory usage and O(n^2) overhead.',
              'StringBuilder runs in GPU memory.',
              'Because standard Strings cannot hold more than 256 characters.',
            ],
            correctAnswerIndex: 1,
            explanation: 'String immutability means each concatenation allocates a new buffer and copies prior characters, producing massive memory churn. StringBuilder modifies an internal buffer directly.',
            competencyTested: 'Memory Management and String Efficiency',
          },
          {
            id: 'q2-3',
            question: 'Which algorithmic technique is optimal for checking if a sorted array has two elements that sum to a target K in O(n) time?',
            options: [
              'Two nested for-loops',
              'Two pointers (one at the start, one at the end moving inward)',
              'Random guessing',
              'Sorting the array again',
            ],
            correctAnswerIndex: 1,
            explanation: 'By comparing sum of arr[left] + arr[right] against target K, you increment left if sum < K and decrement right if sum > K, checking all pairs in a single linear pass.',
            competencyTested: 'Two-Pointer Technique on Sorted Collections',
          },
        ],
      },
      expectedOutcomes: [
        'Ability to use ArrayLists and HashMaps for everyday problem-solving.',
        'Clear understanding of Big-O time and space complexity.',
        'Ability to write two-pointer solutions for array and string challenges.',
      ],
    },
    {
      phaseOrDay: isSevenDay ? 'Days 5 - 6' : 'Phase 3 (Weeks 5 - 6)',
      title: 'Data Persistence: File I/O, SQL & Relational Databases',
      timeFrame: isSevenDay ? 'Day 5 to 6 (2 Days)' : 'Weeks 5 to 6 (14 Days)',
      learningObjective: 'Move from temporary in-memory variables to persistent storage using files and relational SQL databases.',
      focusSkills: ['File Reading & Writing', 'Relational Database Fundamentals', 'Basic SQL Queries (CRUD)', 'JDBC or Database Drivers'],
      practicalTasks: [
        'Read and write structured CSV/JSON data from disk.',
        'Install and configure SQLite or PostgreSQL for local development.',
        'Write SQL queries: CREATE TABLE, INSERT, SELECT with WHERE, and JOIN.',
      ],
      detailedTasks: [
        {
          id: 'task-3-1',
          title: 'Persistent Storage: Reading and Writing Files from Disk',
          whatToLearn: 'Programs lose all variable data when closed. File I/O (Input/Output) allows your application to save records to files (CSV, TXT, JSON) and read them back into memory upon restart.',
          whyToLearn: 'Understanding streams, buffers, and closing file handles prevents data loss and resource leaks in production.',
          whatToDo: [
            'Use BufferedReader and BufferedWriter (or Files class) to read and write student records in CSV format.',
            'Implement try-with-resources to ensure file streams are always closed automatically even if an exception occurs.',
            'Parse CSV lines into Student objects upon program startup.',
          ],
          practiceTask: 'Build a simple CSV persistence manager that saves your Student list to "students.csv" and reloads it on launch.',
          deliverable: 'A working program that retains data between terminal runs.',
          estimatedTime: '60 minutes',
          completionCriteria: 'Files close cleanly, exceptions like FileNotFoundException are caught gracefully, and saved data reloads accurately.',
          learningResources: [
            {
              title: 'Oracle Java Tutorials: Basic I/O Streams',
              url: 'https://docs.oracle.com/javase/tutorial/essential/io/streams.html',
              type: 'Official Docs',
            },
          ],
        },
        {
          id: 'task-3-2',
          title: 'Relational Database Basics & SQL Queries (CRUD)',
          whatToLearn: 'A relational database organizes data into tables with columns and rows. SQL (Structured Query Language) is the universal language used to create, read, update, and delete (CRUD) database records.',
          whyToLearn: `Over 95% of software applications connect to a relational database. SQL is a non-negotiable requirement for every ${targetRole}.`,
          whatToDo: [
            'Download SQLite Browser or DBeaver to experiment with SQL visually.',
            'Create a table: CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, gpa REAL);',
            'Practice inserting records, filtering with WHERE, sorting with ORDER BY, and aggregating with AVG/COUNT.',
          ],
          practiceTask: 'Write a schema script with 2 related tables (Students and Courses) linked by a foreign key, and write an INNER JOIN query.',
          deliverable: 'A clean "schema.sql" file containing table creation, sample INSERT statements, and 3 query examples.',
          estimatedTime: '60 minutes',
          completionCriteria: 'Queries execute without syntax errors, primary key uniqueness is enforced, and JOIN query returns expected combined rows.',
          learningResources: [
            {
              title: 'W3Schools SQL Tutorial for Beginners',
              url: 'https://www.w3schools.com/sql/',
              type: 'Tutorial',
            },
            {
              title: 'PostgreSQL Official Documentation',
              url: 'https://www.postgresql.org/docs/',
              type: 'Official Docs',
            },
          ],
        },
        {
          id: 'task-3-3',
          title: 'Connecting Code to Database via JDBC / Drivers',
          whatToLearn: 'JDBC (Java Database Connectivity) or equivalent language drivers allow your programming language to send SQL queries to a database and read the result set back into language objects.',
          whyToLearn: 'Bridging code and databases is the foundation of backend engineering, web services, and full-stack systems.',
          whatToDo: [
            'Add the SQLite JDBC driver JAR or dependency to your project.',
            'Open a Connection, create a PreparedStatement with parameterized "?" placeholders (preventing SQL injection).',
            'Iterate through the ResultSet to construct your Java/Python objects.',
          ],
          practiceTask: 'Refactor your StudentManager to store records inside a local SQLite database file instead of flat files.',
          deliverable: 'A working database-backed repository class with addStudent() and getAllStudents() methods.',
          estimatedTime: '60 minutes',
          completionCriteria: 'Uses PreparedStatement (never string concatenation in SQL queries) and handles SQLException cleanly.',
          learningResources: [
            {
              title: 'Oracle JDBC Basics Tutorial',
              url: 'https://docs.oracle.com/javase/tutorial/jdbc/basics/',
              type: 'Official Docs',
            },
          ],
        },
      ],
      projectMilestone: 'Database-Backed Student Information System with SQLite and parameterized SQL queries.',
      howToVerifyProgress: 'Insert 5 records through the code, close the app, re-open, and query all records to verify persistence.',
      recommendedResources: [
        'PostgreSQL / SQLite Official Tutorials',
        'W3Schools SQL Interactive Practice',
      ],
      checkpoint: {
        id: 'checkpoint-phase-3',
        title: 'Phase 3 Checkpoint: File I/O & SQL Foundations',
        description: 'Verify your understanding of persistent storage and relational databases.',
        passingScorePercent: 70,
        questions: [
          {
            id: 'q3-1',
            question: 'Why should you ALWAYS use PreparedStatement with "?" parameters instead of concatenating user input directly into SQL strings?',
            options: [
              'Because PreparedStatement makes tables smaller on disk.',
              'To protect the database against SQL Injection attacks by automatically escaping input parameters.',
              'Because string concatenation is not supported in SQL syntax.',
              'Because PreparedStatement converts text into binary files.',
            ],
            correctAnswerIndex: 1,
            explanation: 'Concatenating strings into SQL queries allows malicious users to inject SQL commands (SQL Injection). PreparedStatements compile the query template first and treat inputs strictly as literal values.',
            competencyTested: 'Secure Database Querying & SQL Injection Prevention',
          },
          {
            id: 'q3-2',
            question: 'What does a FOREIGN KEY constraint do in a relational database?',
            options: [
              'It forces data to be stored on an international cloud server.',
              'It establishes a link between two tables, ensuring that a value in one table refers to an existing primary key in another table.',
              'It encrypts passwords before saving.',
              'It automatically deletes duplicate rows.',
            ],
            correctAnswerIndex: 1,
            explanation: 'A FOREIGN KEY maintains referential integrity, preventing orphan records (e.g. assigning a student to a course ID that does not exist).',
            competencyTested: 'Relational Schema Design & Referential Integrity',
          },
          {
            id: 'q3-3',
            question: 'What is the purpose of the Java "try-with-resources" statement when working with files or database connections?',
            options: [
              'It speeds up computer CPU clock cycles.',
              'It guarantees that the resource (file stream or DB connection) is automatically closed when the block finishes, even if an exception occurs.',
              'It prevents users from deleting files.',
              'It ignores all compiler warnings.',
            ],
            correctAnswerIndex: 1,
            explanation: 'Try-with-resources implements AutoCloseable to prevent resource leaks (dangling file locks or unclosed database connections) without messy nested finally blocks.',
            competencyTested: 'Resource Management and Exception Handling',
          },
        ],
      },
      expectedOutcomes: [
        'Ability to read and write files reliably without leaving unclosed streams.',
        'Fluency in writing core SQL CRUD operations and relational table joins.',
        'Understanding of secure querying using parameterized statements.',
      ],
    },
    {
      phaseOrDay: isSevenDay ? 'Day 7' : 'Phase 4 (Weeks 7 - 8)',
      title: 'Capstone Mini-Project, Unit Testing & Portfolio Showcase',
      timeFrame: isSevenDay ? 'Day 7 (1 Day)' : 'Weeks 7 to 8 (14 Days)',
      learningObjective: 'Synthesize all learned skills into a cohesive, tested mini-project published on GitHub with documentation.',
      focusSkills: ['Unit Testing (JUnit/Test Basics)', 'Project Architecture', 'README Documentation', 'Mock Technical Presentation'],
      practicalTasks: [
        'Write unit tests verifying business rules and edge cases.',
        'Build a complete functional mini-project combining OOP, Data Structures, and Persistence.',
        'Author an attractive GitHub README with architecture diagrams and installation instructions.',
      ],
      detailedTasks: [
        {
          id: 'task-4-1',
          title: 'Automated Unit Testing: Writing Your First Test Suite',
          whatToLearn: 'Unit tests are automated scripts that verify individual methods and classes work as expected. Instead of manually clicking or typing in terminal, a test runner executes 20+ checks in seconds.',
          whyToLearn: 'Top tech employers do not hire developers who cannot write tests. Code without tests is considered broken by default in professional engineering teams.',
          whatToDo: [
            'Add JUnit (or assert library) to your project.',
            'Write positive tests (valid inputs return expected values).',
            'Write negative tests (invalid inputs throw expected exceptions or return error codes).',
          ],
          practiceTask: 'Write 4 unit tests for your StudentManager: testValidCreation(), testInvalidGpaThrowsException(), testAddDuplicateId(), and testSearchExisting().',
          deliverable: 'A green test suite passing with 100% success inside your IDE or command line.',
          estimatedTime: '60 minutes',
          completionCriteria: 'All tests execute in under 2 seconds and produce green checkmarks with clear failure messages.',
          learningResources: [
            {
              title: 'JUnit 5 User Guide',
              url: 'https://junit.org/junit5/docs/current/user-guide/',
              type: 'Official Docs',
            },
          ],
        },
        {
          id: 'task-4-2',
          title: 'Capstone Project Assembly: The College Student Academic Portal',
          whatToLearn: 'Bring together everything learned over the past phases: classes, arrays/HashMaps, database persistence, and clean error handling into one cohesive console or GUI application.',
          whyToLearn: 'A single well-architected project that you can explain end-to-end is 10x more valuable to recruiters than 5 half-finished tutorials.',
          whatToDo: [
            'Organize code into clean packages: model (data objects), repository (database access), and service (business logic).',
            'Implement an interactive CLI menu: 1. Add Student, 2. List All, 3. Find by ID, 4. Compute Department GPA, 5. Exit.',
            'Handle invalid user inputs without letting the program crash.',
          ],
          practiceTask: 'Package your project into a runnable JAR or executable script with clear instructions.',
          deliverable: 'Complete capstone repository on GitHub with clean folder organization.',
          estimatedTime: '90 minutes',
          completionCriteria: 'Application runs smoothly from clean terminal, persists data across sessions, and validates all menu inputs.',
          learningResources: [
            {
              title: 'GitHub Guides: Building a Portfolio',
              url: 'https://docs.github.com/en/get-started',
              type: 'Guide',
            },
          ],
        },
        {
          id: 'task-4-3',
          title: 'Professional Documentation & 2-Minute Project Pitch',
          whatToLearn: 'Technical communication is as important as technical coding. A good README explains what the project does, tech stack used, how to install and run it, and architectural decisions made.',
          whyToLearn: 'Recruiters and hiring managers spend 30 seconds scanning your GitHub repo before deciding whether to call you for an interview.',
          whatToDo: [
            'Create a professional README.md with badges, screenshots, prerequisites, and step-by-step run instructions.',
            'Record a short 2-minute video or write down talking points explaining your project using the STAR method.',
            'Link your repository in your resume and profile.',
          ],
          practiceTask: 'Write down answers to 3 standard interview questions about your project: "What was the hardest bug you encountered?", "Why did you choose SQLite over flat files?", and "How would you scale this to 100,000 users?"',
          deliverable: 'Polished GitHub repository with formatted markdown README and documented interview talking points.',
          estimatedTime: '60 minutes',
          completionCriteria: 'README includes clone command, compile steps, sample output screenshot, and technology badge tags.',
          learningResources: [
            {
              title: 'Make a README Guide',
              url: 'https://www.makeareadme.com/',
              type: 'Guide',
            },
          ],
        },
      ],
      projectMilestone: 'Production-Grade Academic Management Capstone repository live on GitHub with passing tests and comprehensive README.',
      howToVerifyProgress: 'Clone repository on another machine (or incognito environment), follow your own README instructions step-by-step, and verify that the program builds and runs successfully.',
      recommendedResources: [
        'JUnit 5 Official Guide',
        'Make a README (makeareadme.com)',
        'GitHub Student Developer Pack',
      ],
      checkpoint: {
        id: 'checkpoint-phase-4',
        title: 'Phase 4 Checkpoint: Testing, Architecture & Delivery',
        description: 'Verify your understanding of software testing and capstone delivery.',
        passingScorePercent: 70,
        questions: [
          {
            id: 'q4-1',
            question: 'What is the main objective of writing automated Unit Tests?',
            options: [
              'To replace the need for writing documentation.',
              'To isolate individual units of code and verify they produce expected outputs across normal and edge-case inputs, catching regressions.',
              'To make the application bundle size smaller.',
              'To run user interface animations faster.',
            ],
            correctAnswerIndex: 1,
            explanation: 'Unit tests guard individual functions and classes against bugs and regressions when refactoring code in the future.',
            competencyTested: 'Automated Testing and Code Quality',
          },
          {
            id: 'q4-2',
            question: 'What is the recommended practice for organizing code into layers (like Model, Repository, Service)?',
            options: [
              'Put all methods into one giant file with 2,000 lines so it loads faster.',
              'Separation of Concerns: Models hold data, Repositories handle database operations, and Services execute business rules.',
              'Only use global static variables.',
              'Create a separate package for every single variable.',
            ],
            correctAnswerIndex: 1,
            explanation: 'Separation of Concerns makes software easy to test, maintain, and upgrade without touching unrelated parts of the system.',
            competencyTested: 'Software Architecture and Modularity',
          },
          {
            id: 'q4-3',
            question: 'When asked in a technical interview "Why did you choose SQLite/PostgreSQL over flat CSV files?", what is the strongest answer?',
            options: [
              '"Because someone told me to use it."',
              '"Relational databases provide ACID transaction guarantees, structured indexing for fast queries, and data integrity constraints that flat files lack."',
              '"Because CSV files take too much space on hard drives."',
              '"Because SQL is newer than CSV."',
            ],
            correctAnswerIndex: 1,
            explanation: 'Demonstrating awareness of ACID guarantees, concurrent safety, data integrity, and indexing proves maturity to senior interviewers.',
            competencyTested: 'Technical Trade-Offs and Architectural Articulation',
          },
        ],
      },
      expectedOutcomes: [
        'Confidence in writing JUnit test assertions for core methods.',
        'A finished, deployed, or published capstone repository on GitHub.',
        'Ability to articulate architectural decisions during campus placements and interviews.',
      ],
    },
  ];

  return {
    duration: durationTitle,
    title: `${durationTitle}: Path to ${targetRole}`,
    objective: `A structured, beginner-friendly learning roadmap designed for a ${studyYear} student with baseline in ${currentSkills || 'Programming'} aiming to achieve entry-level competence as a ${targetRole}.`,
    studyYear: studyYear || '2nd-Year B.Tech',
    proficiencyLevel: currentLevel || 'Beginner',
    dailyTime: dailyTime || '1 hour/day',
    statedAssumptions,
    skillValidationSummary,
    diagnosticAssessments,
    milestones,
  };
}

export function generateFallbackCareerTwin(
  candidateName: string = 'Candidate',
  currentSkills: string = '',
  targetRole: string = 'Software Developer',
  education: string = '',
  projects: string = ''
) {
  const skillsList = currentSkills
    .split(/[,;\n•]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const role = targetRole || 'Software Developer';
  const name = candidateName || 'Candidate';

  return {
    candidateName: name,
    targetRole: role,
    readinessPercentage: skillsList.length >= 5 ? 68 : skillsList.length >= 3 ? 55 : 42,
    currentSelf: {
      summary: `${name} demonstrates foundational competency in ${skillsList.slice(0, 3).join(', ') || 'core software fundamentals'} through academic coursework and early portfolio projects.`,
      explicitSkills: skillsList.length > 0 ? skillsList : ['Problem Solving', 'Programming Foundations', 'Git'],
      inferredSkills: ['Component Layout', 'Client-Server Communication', 'Data Flow'],
      strongestDomain: skillsList.some((s) => /react|javascript|html|css/i.test(s))
        ? 'Frontend & Web Interface Engineering'
        : 'Backend & Algorithmic Problem Solving',
    },
    futureSelf: {
      roleTitle: role,
      expectedIndustryBaseline: `Production-ready ${role} equipped with scalable design patterns, robust automated testing, reliable relational querying, and containerized deployment pipelines.`,
      mustHaveSkills: [
        'Production REST/GraphQL APIs',
        'Relational Database Indexing & Normalization',
        'Automated Testing (Jest / PyTest)',
        'Containerization (Docker)',
        'Clean Architecture & SOLID Design'
      ],
      emergingAdvantageSkills: [
        'Cloud Infrastructure & CI/CD Pipelines',
        'Redis Caching & Latency Optimization',
        'AI/LLM API Integrations & RAG Patterns'
      ]
    },
    topThreeGaps: [
      {
        skill: 'Automated Testing & Edge-Case Coverage',
        category: 'Testing & Quality',
        priority: 'Critical',
        whyItMatters: 'Production engineering teams expect developers to guard against regression bugs before merging PRs.',
        actionPlan: 'Write unit and integration tests covering positive, negative, and edge-case inputs targeting >80% coverage.',
        expectedDeliverable: 'A suite of 25+ automated tests running inside GitHub Actions with passing status badge.'
      },
      {
        skill: 'Containerization & Docker Orchestration',
        category: 'Architecture & DevOps',
        priority: 'High',
        whyItMatters: 'Eliminates "works on my machine" issues and guarantees consistent execution across cloud deployment environments.',
        actionPlan: 'Create multi-stage Dockerfiles and compose files linking your application to a persistent PostgreSQL database.',
        expectedDeliverable: 'Reproducible Docker Compose setup spinning up the app and DB with a single command.'
      },
      {
        skill: 'Database Indexing & Query Optimization',
        category: 'Data & Persistence',
        priority: 'High',
        whyItMatters: 'Scalability bottlenecks in entry-level projects almost always stem from unindexed N+1 database queries.',
        actionPlan: 'Analyze query execution plans using EXPLAIN ANALYZE and implement composite B-tree indexes.',
        expectedDeliverable: 'Documented performance benchmark showing >30% latency reduction on high-cardinality queries.'
      }
    ],
    competencyDimensions: [
      {
        name: 'Languages & Architecture',
        currentLevel: skillsList.length >= 4 ? 70 : 50,
        targetLevel: 85,
        gapDescription: 'Solid baseline syntax; bridge to modular design patterns and typing rigor.'
      },
      {
        name: 'Frameworks & Production Stack',
        currentLevel: skillsList.some((s) => /react|node|spring|django/i.test(s)) ? 65 : 45,
        targetLevel: 88,
        gapDescription: 'Basic components verified; advance to global state, caching, and optimistic UI.'
      },
      {
        name: 'Data & Persistence',
        currentLevel: skillsList.some((s) => /sql|postgres|mongo/i.test(s)) ? 60 : 40,
        targetLevel: 82,
        gapDescription: 'CRUD operations understood; master indexing, transactions, and migration tools.'
      },
      {
        name: 'Testing & Quality',
        currentLevel: 35,
        targetLevel: 80,
        gapDescription: 'Manual verification common; transition to automated unit and integration suites.'
      },
      {
        name: 'DevOps & Deployment',
        currentLevel: skillsList.some((s) => /docker|git|aws/i.test(s)) ? 45 : 30,
        targetLevel: 75,
        gapDescription: 'Local execution works; containerize services and configure automated CI/CD.'
      }
    ],
    transformationSummary: `By focusing on automated testing, containerized deployments, and database optimization, ${name} can systematically close the gap to become a high-confidence, production-ready ${role}.`
  };
}

// ---------------------------------------------------------------------------
// 7. AI Startup Matcher & Direct Career Redirection Engine (Fallback)
// ---------------------------------------------------------------------------
export function matchStartupsWithFallback(input: StartupJobSearchInput): StartupJobSearchResult {
  const userSkills = (input.skills || []).map((s) => s.trim().toLowerCase());
  const roleLower = (input.targetRole || 'Software Developer').toLowerCase();
  const locLower = (input.preferredLocation || 'Anywhere in India').toLowerCase();
  const expLevel = input.experienceLevel || 'Student';
  const oppType = input.opportunityType || 'Full-Time Job';
  const eduLevel = input.educationLevel || 'B.Tech / B.E.';

  const isInternship = oppType === 'Internship' || expLevel === 'Student' || roleLower.includes('intern');
  const isBdeOrMarketing = /\b(business development|marketing|growth|sales|bde)\b/i.test(roleLower);
  const isDataAnalyst = /data analyst|analytics|business intelligence|\bbi\b/i.test(roleLower);
  const isAimL = /\b(ai|ml|machine learning|deep learning|vision|nlp)\b/i.test(roleLower) || userSkills.some((s) => /\b(ai|ml|pytorch|tensorflow|scikit|opencv)\b/i.test(s) || s === 'machine learning');
  const isFrontend = /frontend|front-end|\bui\b|\bweb\b|react|javascript|css/i.test(roleLower) || userSkills.some((s) => /react|tailwind|html|css|javascript|vue|angular/i.test(s));
  const isJavaBackend = (/backend|software|java|spring|systems/i.test(roleLower) && userSkills.some((s) => /java|dsa|c\+\+|spring|git|sql/i.test(s))) || roleLower.includes('java');

  // Score each curated startup
  const scoredStartups = CURATED_STARTUPS.map((startup) => {
    let score = 50; // base score
    const matchedSkills: string[] = [];
    const skillsToAcquire: string[] = [];

    // 1. Skill overlap
    startup.primaryTechStack.forEach((tech) => {
      const techLower = tech.toLowerCase();
      const hasSkill = userSkills.some((us) => us === techLower || techLower.includes(us) || us.includes(techLower));
      if (hasSkill) {
        matchedSkills.push(tech);
        score += 8;
      } else {
        if (skillsToAcquire.length < 3) {
          skillsToAcquire.push(tech);
        }
      }
    });

    // 2. Role family alignment
    const roleMatch = startup.matchedRoleFamilies.some((rf) => {
      const rfLower = rf.toLowerCase();
      return rfLower.includes(roleLower) || roleLower.includes(rfLower);
    });
    if (roleMatch) score += 15;

    // Domain / Scenario heuristics based on prompt specifications:
    if (isJavaBackend && ['pine-labs', 'moglix', 'credgenics', 'addverb', 'razorpay', 'blinkit'].includes(startup.id)) {
      score += 25;
    }
    if (isFrontend && ['classplus', 'inshorts', 'blinkit', 'clinikally', 'urban-company', 'postman'].includes(startup.id)) {
      score += 25;
    }
    if (isAimL && ['innovaccer', 'orangewood-labs', 'credgenics', 'physicswallah', 'addverb'].includes(startup.id)) {
      score += 25;
    }
    if (isBdeOrMarketing && ['classplus', 'physicswallah', 'moglix', 'salarybox', 'clinikally'].includes(startup.id)) {
      score += 25;
    }

    // 3. Location affinity
    if (locLower === 'noida' && startup.techHub === 'Noida') {
      score += 15;
    } else if ((locLower === 'delhi-ncr' || locLower === 'gurugram') && (startup.techHub === 'Noida' || startup.techHub === 'Gurugram' || startup.techHub === 'Delhi-NCR')) {
      score += 12;
    } else if (locLower === 'bengaluru' && startup.techHub === 'Bengaluru') {
      score += 15;
    } else if (locLower === 'remote') {
      score += 5;
    }

    // 4. Fresher / Internship bonus
    if (isInternship && startup.fresherFriendly) {
      score += 6;
    }

    // Normalize match percentage between 65 and 96
    const finalPercentage = Math.min(96, Math.max(65, Math.round(score)));

    // Determine student / internship vs fresher vs fulltime status
    const isInternshipTarget = isInternship || roleLower.includes('intern');
    const isFresherTarget = !isInternshipTarget && (expLevel === 'Fresher' || roleLower.includes('fresher') || roleLower.includes('entry'));

    const jobTypeLabel: 'Internship' | 'Fresher / Entry-Level' | 'Full-Time Job' | 'Remote' = isInternshipTarget
      ? 'Internship'
      : isFresherTarget
      ? 'Fresher / Entry-Level'
      : locLower === 'remote'
      ? 'Remote'
      : 'Full-Time Job';

    // Generate specific target role matched to candidate (prioritizing explicit role intention)
    let matchedRoleTitle = '';
    let roles: string[] = [];

    if (roleLower.includes('frontend') || roleLower.includes('react') || (isFrontend && !isAimL && !isJavaBackend && !isBdeOrMarketing)) {
      if (isInternshipTarget) {
        matchedRoleTitle = 'Frontend Developer Intern (React / Web)';
        roles = ['Frontend Engineering Intern (React)', 'Web UI Developer Intern'];
      } else if (isFresherTarget) {
        matchedRoleTitle = 'Junior Frontend Engineer (Fresher)';
        roles = ['Frontend Engineer (React / TypeScript)', 'UI Software Developer'];
      } else {
        matchedRoleTitle = 'Frontend Engineer';
        roles = ['Frontend Software Developer', 'UI Systems Engineer'];
      }
    } else if (isDataAnalyst || (roleLower.includes('data') && roleLower.includes('analyst'))) {
      if (isInternshipTarget) {
        matchedRoleTitle = 'Data Analyst Intern';
        roles = ['Data Analytics Intern', 'Business Intelligence Intern'];
      } else {
        matchedRoleTitle = 'Data Analyst (Fresher / Junior)';
        roles = ['Associate Data Analyst', 'BI Operations Analyst'];
      }
    } else if (roleLower.includes('ai') || roleLower.includes('ml') || roleLower.includes('machine learning') || (isAimL && !isFrontend && !isJavaBackend)) {
      if (isInternshipTarget) {
        matchedRoleTitle = 'AI/ML & Data Engineering Intern';
        roles = ['AI/ML Engineering Intern', 'Applied Machine Learning Intern', 'Data Science Intern'];
      } else if (isFresherTarget) {
        matchedRoleTitle = 'Junior AI/ML Engineer (Fresher)';
        roles = ['Associate Machine Learning Engineer', 'Data & Vision Systems SDE'];
      } else {
        matchedRoleTitle = 'AI/ML Software Engineer';
        roles = ['AI/ML Software Engineer', 'Applied Data Scientist'];
      }
    } else if (isBdeOrMarketing) {
      if (isInternshipTarget) {
        matchedRoleTitle = 'Business Development & Growth Intern';
        roles = ['Business Development Intern', 'Campus Growth & Community Intern'];
      } else if (isFresherTarget) {
        matchedRoleTitle = 'Associate - Business Development (Fresher)';
        roles = ['Business Development Executive (BDE)', 'Inside Sales & Partnerships Trainee'];
      } else {
        matchedRoleTitle = 'Business Development Executive';
        roles = ['Business Development Executive', 'Enterprise Growth Lead'];
      }
    } else {
      // Default: Software Developer / Backend / SDE
      if (isInternshipTarget) {
        matchedRoleTitle = (isJavaBackend || roleLower.includes('java')) ? 'Java Software Developer Intern' : 'Software Engineering Intern';
        roles = ['Software Engineering Intern', 'Backend Developer Intern (Java/Node)', 'SDE Intern'];
      } else if (isFresherTarget) {
        matchedRoleTitle = (isJavaBackend || roleLower.includes('java')) ? 'Software Engineer - Java / Backend (Fresher)' : 'Software Development Engineer I (SDE-1)';
        roles = ['Software Development Engineer I (SDE-1)', 'Graduate Engineer Trainee (GET)', 'Backend SDE'];
      } else {
        matchedRoleTitle = (isJavaBackend || roleLower.includes('java')) ? 'Backend Software Engineer (Java)' : 'Software Development Engineer I';
        roles = ['Software Development Engineer I', 'Backend Software Developer'];
      }
    }

    // Generate specific rationale
    let matchRationale = '';
    if (matchedSkills.length > 0) {
      matchRationale = `${startup.name}'s ${startup.domain} stack actively utilizes ${matchedSkills.slice(0, 3).join(', ')}, matching your technical foundation for the ${matchedRoleTitle} role.`;
    } else {
      matchRationale = `${startup.name} actively hires ${matchedRoleTitle} talent in ${startup.techHub}, matching your career aspiration and educational profile.`;
    }

    // Generate targeted search queries and pre-filtered URLs
    const cleanCompanyName = encodeURIComponent(startup.name);
    const cleanRoleForSearch = encodeURIComponent(matchedRoleTitle);
    const locationForSearch = encodeURIComponent(startup.techHub === 'Pan-India' ? 'India' : `${startup.techHub}, India`);

    // LinkedIn pre-filtered query with experience level flags (f_E=1 for internship, f_E=2 for entry-level)
    const linkedInExpParam = isInternshipTarget ? '&f_E=1' : isFresherTarget ? '&f_E=2' : '';
    const relevantJobsLinkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${cleanCompanyName}%20${cleanRoleForSearch}&location=${locationForSearch}${linkedInExpParam}`;

    // Naukri targeted query
    const naukriRoleParam = encodeURIComponent(matchedRoleTitle.replace(/[^a-zA-Z0-9 ]/g, ' '));
    const relevantJobsNaukriUrl = `https://www.naukri.com/${startup.naukriSlug || 'jobs'}-jobs?k=${cleanCompanyName}%20${naukriRoleParam}`;

    // Google Jobs search query
    const googleJobsUrl = `https://www.google.com/search?q=${cleanCompanyName}+${cleanRoleForSearch}+${encodeURIComponent(startup.techHub)}+careers+jobs&ibp=htl;jobs`;

    // Smart link priority decision:
    // If the startup has a dedicated direct ATS (Lever, Greenhouse, Wellfound, etc.) or direct careers opening anchor:
    const hasDirectAts = /lever\.co|greenhouse\.io|wellfound\.com|#open/i.test(startup.officialAtsUrl);
    const officialApplyUrl = startup.officialAtsUrl || startup.careerPortalUrl;
    const relevantJobsUrl = relevantJobsLinkedInUrl;

    const linkPriority: 'Official ATS / Application Link' | 'Role-Specific Career Filter' | 'Filtered Trusted Search' = hasDirectAts
      ? 'Official ATS / Application Link'
      : 'Role-Specific Career Filter';

    const card: StartupMatchCard = {
      id: startup.id,
      name: startup.name,
      domain: startup.domain,
      headquarters: startup.headquarters,
      techHub: startup.techHub,
      description: startup.verifiedDescription,
      matchPercentage: finalPercentage,
      matchRationale,
      matchedRole: matchedRoleTitle,
      relevantRoles: roles,
      jobType: jobTypeLabel,
      matchedSkills: matchedSkills.length > 0 ? matchedSkills : startup.primaryTechStack.slice(0, 2),
      skillsToAcquire: skillsToAcquire.length > 0 ? skillsToAcquire : ['System Architecture', 'CI/CD Pipelines'],
      hiringType: startup.activeHiringType,
      statusIndicator: 'Official Careers Portal',
      vacancyStatus: isInternshipTarget ? 'Verified Vacancy Listings' : 'Active Drives',
      linkPriority,
      relevantJobsUrl,
      officialApplyUrl,
      careerUrl: startup.careerPortalUrl,
      linkedInJobsUrl: relevantJobsLinkedInUrl,
      naukriJobsUrl: relevantJobsNaukriUrl,
      googleJobsUrl,
      notes: startup.verifiedNotes,
    };

    return { card, score };
  });

  // Sort by score descending and pick top 6-8 matching startups
  scoredStartups.sort((a, b) => b.score - a.score);
  const matchedStartups = scoredStartups.slice(0, 8).map((item) => item.card);

  // Generate aggregate destination search URLs with user's filters
  const generalRole = encodeURIComponent(input.targetRole || 'Software Developer');
  const generalSkills = encodeURIComponent(input.skills.slice(0, 3).join(' '));
  const generalLocation = encodeURIComponent(input.preferredLocation || 'India');

  const directAggregatorUrls = {
    linkedIn: `https://www.linkedin.com/jobs/search/?keywords=${generalRole}%20${generalSkills}&location=${generalLocation}`,
    naukri: `https://www.naukri.com/jobs-in-${generalLocation.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'india'}?k=${generalRole}%20${generalSkills}`,
    internshala: `https://internshala.com/internships/${generalRole.toLowerCase().replace(/[^a-z0-9]/g, '-')}-internship/`,
    wellfound: `https://wellfound.com/jobs?role=${generalRole}`,
    googleJobs: `https://www.google.com/search?q=${generalRole}+${generalSkills}+jobs+in+${generalLocation}&ibp=htl;jobs`,
  };

  return {
    querySummary: {
      targetRole: input.targetRole || 'Software Developer',
      skillsCount: input.skills.length,
      location: input.preferredLocation || 'Noida / Delhi-NCR',
      opportunityType: oppType,
      experienceLevel: expLevel,
      education: `${eduLevel} (${input.graduationYear || '2026'})`,
    },
    matchedStartups,
    directAggregatorUrls,
    marketInsights: {
      inDemandSkill: input.skills[0] || 'Java / React',
      recommendedHub: input.preferredLocation === 'Anywhere in India' ? 'Noida & Bengaluru' : input.preferredLocation,
      hiringSeasonTip: isInternship
        ? 'Startup campus hiring drives peak in March–May and August–October. Direct recruiter outreach on LinkedIn with public GitHub demos yields the highest conversion rate.'
        : 'Tech startups in Noida and Bengaluru review GitHub repositories and hands-on projects more closely than academic CGPA alone.',
    },
  };
}


