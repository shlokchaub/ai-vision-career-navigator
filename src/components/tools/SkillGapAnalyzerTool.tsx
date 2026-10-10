import React, { useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, BookOpen, Search, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { UserProfile } from '../../types';

interface SkillGapAnalyzerToolProps {
  userProfile: UserProfile;
  onApplyRoleToJobSearch: (role: string, skills: string[]) => void;
}

const COMMON_TARGET_ROLES = [
  'Software Developer',
  'Data Analyst',
  'Web Developer',
  'AI/ML Engineer',
  'Cybersecurity Analyst',
  'Cloud & DevOps Engineer',
];

interface RoleSkillExpectation {
  skill: string;
  category: 'Core Language' | 'Framework & Lib' | 'Data & DB' | 'Architecture & Cloud' | 'Testing & Quality';
  whyItMatters: string;
  nextLearningStep: string;
}

const ROLE_SKILL_CATALOG: Record<string, RoleSkillExpectation[]> = {
  'Software Developer': [
    { skill: 'Data Structures & Algorithms', category: 'Core Language', whyItMatters: 'Essential for technical interviews, optimal space/time complexity, and problem decomposition.', nextLearningStep: 'Practice medium LeetCode/NeetCode problems focusing on HashMaps, Trees, and Dynamic Programming.' },
    { skill: 'Python / Java / C++', category: 'Core Language', whyItMatters: 'Primary programming foundation for writing enterprise services, backend logic, and object-oriented architectures.', nextLearningStep: 'Build a modular service applying SOLID design principles, clean abstraction, and typing.' },
    { skill: 'REST API & HTTP Architecture', category: 'Architecture & Cloud', whyItMatters: 'Industry standard protocol for web microservices, third-party integrations, and client-server communication.', nextLearningStep: 'Design a RESTful API with status codes, payload validation, pagination, and error handlers.' },
    { skill: 'SQL & Relational Databases (PostgreSQL/MySQL)', category: 'Data & DB', whyItMatters: 'Core requirement for structured transactional persistence, indexing, and normalized schemas.', nextLearningStep: 'Write multi-table JOINs, group-by aggregations, and analyze performance with EXPLAIN query plans.' },
    { skill: 'Automated Testing (Unit & Integration)', category: 'Testing & Quality', whyItMatters: 'Prevents regressions in continuous deployment pipelines; expected by tech leads during code review.', nextLearningStep: 'Write unit tests covering edge cases with PyTest, Jest, or JUnit, targeting >80% code coverage.' },
    { skill: 'Git & Agile Collaboration', category: 'Architecture & Cloud', whyItMatters: 'Fundamental for team pull requests, branch management, merge conflict resolution, and sprint workflows.', nextLearningStep: 'Practice feature branching, squashing commits, and writing structured conventional commit messages.' },
    { skill: 'Docker Containerization', category: 'Architecture & Cloud', whyItMatters: 'Standardizes runtime environments between developer laptops and cloud deployment targets.', nextLearningStep: 'Write a multi-stage Dockerfile and orchestrate your application with a database container via Docker Compose.' },
  ],
  'Data Analyst': [
    { skill: 'Advanced SQL & Data Querying', category: 'Data & DB', whyItMatters: 'The single most tested skill in data analyst screening interviews for extracting business metrics.', nextLearningStep: 'Master window functions (ROW_NUMBER, RANK, LAG/LEAD) and CTEs (Common Table Expressions).' },
    { skill: 'Python (Pandas & NumPy)', category: 'Core Language', whyItMatters: 'Primary scripting stack for data manipulation, handling missing values, and exploratory analysis.', nextLearningStep: 'Perform end-to-end data cleansing on a messy real-world CSV dataset and export summary statistics.' },
    { skill: 'Business Intelligence & Visualization (Tableau/PowerBI)', category: 'Framework & Lib', whyItMatters: 'Transforms raw database tables into executive-ready visual decision dashboards for non-technical stakeholders.', nextLearningStep: 'Build an interactive dashboard tracking 4-5 core business KPIs with drill-down filters and tooltips.' },
    { skill: 'Exploratory Data Analysis (EDA)', category: 'Core Language', whyItMatters: 'Uncovers patterns, distributions, correlations, and anomalies before jumping to modeling conclusions.', nextLearningStep: 'Generate correlation matrices, histograms, and box plots to isolate outliers in customer behavior data.' },
    { skill: 'Statistical Hypothesis Testing', category: 'Testing & Quality', whyItMatters: 'Drives data-backed decision making for A/B testing, cohort analysis, and statistical significance.', nextLearningStep: 'Conduct two-sample t-tests and chi-squared tests, and interpret p-values in business context.' },
    { skill: 'Excel & Spreadsheet Modeling', category: 'Data & DB', whyItMatters: 'Ubiquitous corporate tool for rapid ad-hoc calculations, pivot tables, and client reporting.', nextLearningStep: 'Master XLOOKUP, INDEX/MATCH, Pivot Tables, and dynamic array formulas.' },
  ],
  'Web Developer': [
    { skill: 'Modern JavaScript (ES6+) & TypeScript', category: 'Core Language', whyItMatters: 'The programming foundation of the modern web, ensuring robust typing and fewer runtime bugs.', nextLearningStep: 'Refactor JavaScript projects to strict TypeScript with interfaces, unions, and generics.' },
    { skill: 'React / Frontend Component Architecture', category: 'Framework & Lib', whyItMatters: 'Industry standard for declarative UI, reusable component hierarchies, and modern web apps.', nextLearningStep: 'Master state management, custom hooks, context, and optimistic UI updates.' },
    { skill: 'Responsive CSS, Flexbox & Tailwind CSS', category: 'Framework & Lib', whyItMatters: 'Guarantees seamless user experience across mobile phones, tablets, and desktop displays.', nextLearningStep: 'Build a mobile-first dashboard with dark/light themes and accessible focus states.' },
    { skill: 'REST & GraphQL API Integration', category: 'Architecture & Cloud', whyItMatters: 'Connects frontend interfaces to server data stores, handling async states and errors.', nextLearningStep: 'Implement data fetching with caching, error boundaries, and loading skeletons.' },
    { skill: 'Web Performance & Core Web Vitals', category: 'Testing & Quality', whyItMatters: 'Faster page loads boost user engagement, conversion rates, and Google search ranking.', nextLearningStep: 'Audit your site via Chrome Lighthouse and optimize images, bundle splitting, and CLS scores.' },
    { skill: 'Accessibility (WCAG AA Standards)', category: 'Testing & Quality', whyItMatters: 'Legal and ethical requirement ensuring disabled users can navigate via keyboard and screen readers.', nextLearningStep: 'Add ARIA attributes, semantic HTML tags, keyboard traps, and test with keyboard tab navigation.' },
  ],
  'AI/ML Engineer': [
    { skill: 'Python for Machine Learning', category: 'Core Language', whyItMatters: 'Core lingua franca for data ingestion, model building, tensor manipulation, and inference APIs.', nextLearningStep: 'Write vectorized operations with NumPy without slow Python loops.' },
    { skill: 'Classical Machine Learning (Scikit-Learn)', category: 'Framework & Lib', whyItMatters: 'Foundational baseline algorithms (Random Forests, Gradient Boosting, Logistic Regression) tested in interviews.', nextLearningStep: 'Build a cross-validated classification pipeline with feature scaling, hyperparameter tuning, and ROC-AUC evaluation.' },
    { skill: 'Deep Learning & Neural Networks (PyTorch/TensorFlow)', category: 'Framework & Lib', whyItMatters: 'Required for computer vision, natural language processing, embeddings, and generative AI models.', nextLearningStep: 'Train a CNN or Transformer model using PyTorch with custom Dataset and DataLoader classes.' },
    { skill: 'Model Evaluation & Metric Diagnostics', category: 'Testing & Quality', whyItMatters: 'Critical to prevent data leakage, overfitting, and misleading accuracy figures on imbalanced classes.', nextLearningStep: 'Analyze precision-recall curves, confusion matrices, and F1 scores rather than raw accuracy.' },
    { skill: 'ML Model Deployment & APIs (FastAPI/Flask)', category: 'Architecture & Cloud', whyItMatters: 'Differentiates theoretical researchers from engineers who can serve model predictions in production.', nextLearningStep: 'Wrap a serialized model (ONNX or Pickle) into a high-performance asynchronous FastAPI endpoint.' },
    { skill: 'Vector Databases & LLM Integration', category: 'Architecture & Cloud', whyItMatters: 'Modern standard for building Retrieval-Augmented Generation (RAG) and generative AI applications.', nextLearningStep: 'Build a semantic search system using embeddings and a vector store like ChromaDB or Pinecone.' },
  ],
  'Cybersecurity Analyst': [
    { skill: 'Network Protocols & Packet Analysis (Wireshark)', category: 'Architecture & Cloud', whyItMatters: 'Understanding TCP/IP, DNS, HTTP/S, and packet flows is essential for spotting malicious traffic.', nextLearningStep: 'Capture and inspect network PCAP files to identify port scans and unencrypted credentials.' },
    { skill: 'Linux & Windows Security Fundamentals', category: 'Core Language', whyItMatters: 'Core operating systems where authentication, permissions, processes, and persistence mechanisms live.', nextLearningStep: 'Practice auditing sudo privileges, file permissions, and inspecting active services via systemctl.' },
    { skill: 'SIEM & Threat Monitoring (Splunk/ELK)', category: 'Data & DB', whyItMatters: 'Central tool used in Security Operations Centers (SOC) to triage alerts and aggregate server logs.', nextLearningStep: 'Write search queries to correlate authentication failures and brute force login attempts.' },
    { skill: 'Vulnerability Assessment (Nmap & OpenVAS)', category: 'Testing & Quality', whyItMatters: 'Identifies unpatched software, open ports, and vulnerable configurations before attackers do.', nextLearningStep: 'Perform an ethical vulnerability scan against a target VM in an isolated home lab.' },
    { skill: 'Web Application Security (OWASP Top 10)', category: 'Testing & Quality', whyItMatters: 'Protects customer-facing applications against SQL injection, XSS, SSRF, and broken access controls.', nextLearningStep: 'Practice identifying and remediating SQL injection and cross-site scripting vulnerabilities in vulnerable apps.' },
    { skill: 'Incident Response & Triage Frameworks', category: 'Architecture & Cloud', whyItMatters: 'Standard operating procedure for containing breaches, preserving digital evidence, and post-mortems.', nextLearningStep: 'Study NIST SP 800-61 incident handling lifecycle: Preparation, Detection, Containment, Eradication, Recovery.' },
  ],
  'Cloud & DevOps Engineer': [
    { skill: 'Linux Administration & Shell Scripting', category: 'Core Language', whyItMatters: 'Linux runs 90%+ of production cloud workloads; bash scripting automates repetitive sysadmin tasks.', nextLearningStep: 'Write modular bash scripts for automated backups, log rotation, and server health checks.' },
    { skill: 'Docker Containerization & Multi-Stage Builds', category: 'Architecture & Cloud', whyItMatters: 'Essential for packaging microservices into lightweight, reproducible, secure containers.', nextLearningStep: 'Optimize Dockerfiles using alpine base images and non-root users, achieving image sizes <100MB.' },
    { skill: 'CI/CD Pipelines (GitHub Actions / GitLab CI)', category: 'Architecture & Cloud', whyItMatters: 'Automates building, testing, linting, and deploying code on every pull request merge.', nextLearningStep: 'Build a complete workflow triggering automated tests and deploying to a cloud host on push.' },
    { skill: 'Cloud Core Services (AWS / GCP / Azure)', category: 'Architecture & Cloud', whyItMatters: 'Industry standard infrastructure platforms for compute (EC2/Cloud Run), storage (S3), and networking (VPC).', nextLearningStep: 'Deploy a multi-tier containerized service with managed database and SSL certificates.' },
    { skill: 'Infrastructure as Code (Terraform)', category: 'Architecture & Cloud', whyItMatters: 'Enables repeatable, version-controlled cloud infrastructure provisioning without manual console clicks.', nextLearningStep: 'Write Terraform modules provisioning a VPC, subnets, and an auto-scaling compute instance.' },
    { skill: 'Monitoring & Alerting (Prometheus & Grafana)', category: 'Testing & Quality', whyItMatters: 'Provides observability into server CPU/memory, request rates, error codes, and uptime.', nextLearningStep: 'Configure Prometheus scrapers and build an alert notifying on 5xx error rate spikes.' },
  ],
};

export const SkillGapAnalyzerTool: React.FC<SkillGapAnalyzerToolProps> = ({
  userProfile,
  onApplyRoleToJobSearch,
}) => {
  const [selectedRole, setSelectedRole] = useState(userProfile.targetRole || 'Software Developer');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Strong' | 'Needs Improvement' | 'Not Yet Demonstrated'>('All');

  // Active role expectations
  const activeExpectations =
    ROLE_SKILL_CATALOG[selectedRole] ||
    ROLE_SKILL_CATALOG['Software Developer'];

  // User's declared skills
  const userSkillTokens = (userProfile.skills || '')
    .toLowerCase()
    .split(/[,;\n•]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Categorize skills into "Strong", "Needs Improvement", "Not Yet Demonstrated"
  const evaluatedGaps = activeExpectations.map((exp) => {
    const key = exp.skill.toLowerCase().split(/[\s\/\(&]/)[0];
    const isDirectMatch = userSkillTokens.some((tok) => tok.includes(key) || key.includes(tok));

    let status: 'Strong' | 'Needs Improvement' | 'Not Yet Demonstrated' = 'Not Yet Demonstrated';

    if (isDirectMatch) {
      // If candidate has related experience or coursework
      if (userProfile.experienceYear && !userProfile.experienceYear.includes('1st')) {
        status = 'Strong';
      } else {
        status = 'Needs Improvement';
      }
    } else {
      // Check partial match
      const isPartial = userSkillTokens.some((tok) =>
        exp.whyItMatters.toLowerCase().includes(tok) || exp.skill.toLowerCase().includes(tok)
      );
      if (isPartial) {
        status = 'Needs Improvement';
      } else {
        status = 'Not Yet Demonstrated';
      }
    }

    return {
      ...exp,
      status,
    };
  });

  const strongCount = evaluatedGaps.filter((g) => g.status === 'Strong').length;
  const partialCount = evaluatedGaps.filter((g) => g.status === 'Needs Improvement').length;
  const missingCount = evaluatedGaps.filter((g) => g.status === 'Not Yet Demonstrated').length;
  const totalCount = evaluatedGaps.length;
  const fitPercentage = Math.round(((strongCount * 1.0 + partialCount * 0.5) / totalCount) * 100);

  const filteredItems = evaluatedGaps.filter((item) => {
    if (filterCategory === 'All') return true;
    return item.status === filterCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Feature · Skill Gap Analyser</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Role-Specific Skill Gap Matrix for {userProfile.name ? userProfile.name : 'Candidate'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Compare your declared or resume-derived skills against the competencies expected for your target role. Categorized into Strong, Needs Improvement, and Not Yet Demonstrated.
          </p>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {COMMON_TARGET_ROLES.slice(0, 3).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRole(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedRole === r
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {r.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Role Selection & Metrics Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs uppercase tracking-wider">
              Selected Target Role
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={COMMON_TARGET_ROLES.includes(selectedRole) ? selectedRole : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    setSelectedRole(e.target.value);
                  }
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[200px]"
              >
                {COMMON_TARGET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="custom">Other / Custom Tech Role</option>
              </select>

              {!COMMON_TARGET_ROLES.includes(selectedRole) && (
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder="Enter custom role title..."
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
          </div>

          {/* Fit Match Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Competency Alignment</span>
              <span className="font-bold text-sky-400">{fitPercentage}% Fit</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${fitPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span className="text-emerald-400">{strongCount} Strong</span>
              <span className="text-amber-400">{partialCount} Partial</span>
              <span className="text-rose-400">{missingCount} Gaps</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 flex items-center gap-1 text-[11px] mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter by status:
          </span>

          {(['All', 'Strong', 'Needs Improvement', 'Not Yet Demonstrated'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluated Skills Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item, idx) => {
            const isStrong = item.status === 'Strong';
            const isPartial = item.status === 'Needs Improvement';
            const isMissing = item.status === 'Not Yet Demonstrated';

            const badgeColor = isStrong
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
              : isPartial
              ? 'bg-amber-950/70 text-amber-300 border-amber-800'
              : 'bg-rose-950/50 text-rose-300 border-rose-900/60';

            const Icon = isStrong ? CheckCircle2 : isPartial ? AlertTriangle : HelpCircle;

            return (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  {/* Skill Title & Category */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        {item.category}
                      </span>
                      <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                        {item.skill}
                      </h4>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badgeColor}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.status}</span>
                    </span>
                  </div>

                  {/* Why it Matters */}
                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 font-medium block text-[11px] mb-0.5 uppercase tracking-wider">
                      Recruiter & Industry Expectation:
                    </span>
                    {item.whyItMatters}
                  </div>
                </div>

                {/* What to Learn Next */}
                <div className="pt-3 border-t border-slate-800 text-xs">
                  <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Recommended Next Learning Action:</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {item.nextLearningStep}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Educational Transparency Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-300 font-medium">Important Evidence Distinction: </span>
          Skills marked as <span className="text-rose-300 font-semibold">“Not Yet Demonstrated”</span> indicate that no verifiable proof was found in your supplied profile or resume text. This is a distinction of documentation evidence rather than proof that you lack the skill in real life. Adding relevant project bullet points or coursework will update this status immediately.
        </div>
      </div>
    </div>
  );
};
