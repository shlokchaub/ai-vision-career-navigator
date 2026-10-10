export interface UserProfile {
  name: string;
  email?: string;
  education: string;
  college?: string;
  degree: string;
  experienceYear: string;
  interests: string;
  skills: string;
  targetRole: string;
  preferredLocation: string;
}

export interface StudentProfile {
  name: string;
  education: string;
  degree: string;
  experience: string;
  skills: string;
  interests: string;
  targetRole: string;
  email?: string;
  college?: string;
  preferredLocation?: string;
}

export type SkillStatus = 'demonstrated' | 'partial' | 'missing';
export type SkillPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SkillGapItem {
  skill: string;
  status: SkillStatus;
  priority: SkillPriority;
  resumeEvidence: string;
  jobRequirement: string;
  explanation: string;
  recruiterExpectation: string;
}

export interface KeyStrength {
  title: string;
  evidenceQuote: string;
  impact: string;
}

export interface AtsDimension {
  score: number;
  feedback: string;
}

export interface AtsEvaluation {
  overallScore: number;
  disclaimer: string;
  breakdown: {
    keywordAlignment: AtsDimension;
    readabilityAndStructure: AtsDimension;
    measurableImpact: AtsDimension;
    projectDepth: AtsDimension;
    essentialSections: AtsDimension;
  };
  actionableImprovementTips: string[];
}

export interface CareerRoleRecommendation {
  title: string;
  matchPercentage: number;
  rationale: string;
  leverageSkills: string[];
  bridgeSkills: string[];
  marketOutlook: string;
  salaryOutlook?: string;
  nextSteps?: string[];
}

export interface RoadmapTaskResource {
  title: string;
  url: string;
  type?: 'Official Docs' | 'Guide' | 'Tutorial' | 'Practice';
}

export interface RoadmapTask {
  id: string;
  title: string;
  whatToLearn: string; // Plain beginner-friendly explanation (jargon explained in 1 simple sentence)
  whyToLearn: string; // Direct connection to target career
  whatToDo: string[]; // Step-by-step actionable instructions
  practiceTask: string; // Specific coding problem or exercise
  deliverable: string; // Concrete mini-project or artifact to build/commit
  estimatedTime: string; // Realistic time estimate, e.g. "45-60 mins"
  completionCriteria: string; // Exact checklist for how student knows they have learned it
  learningResources: RoadmapTaskResource[];
}

export interface CheckpointQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  competencyTested: string;
}

export interface PhaseCheckpoint {
  id: string;
  title: string;
  description: string;
  questions: CheckpointQuestion[];
  passingScorePercent?: number;
}

export type SkillCategory = 'You already know' | 'Strengthen this skill' | 'Learn next';

export interface ValidatedSkillItem {
  skill: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  category: SkillCategory; // Foundation / Partially Developed / Learn next
  whyItMatters: string;
  competencyToDemonstrate: string;
  isValidated: boolean; // false = Self-Reported, true = Assessment-Validated
  validationScore?: number;
}

export interface DiagnosticQuestion {
  id: string;
  skill: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  competencyTested: string;
}

export interface RoadmapMilestone {
  phaseOrDay: string;
  title: string;
  timeFrame?: string; // e.g. "Weeks 1 - 2" or "Days 1 - 7"
  learningObjective?: string;
  focusSkills: string[];
  practicalTasks: string[]; // Kept for backward compatibility
  detailedTasks?: RoadmapTask[];
  projectMilestone: string;
  howToVerifyProgress: string;
  recommendedResources: string[];
  checkpoint?: PhaseCheckpoint;
  expectedOutcomes?: string[];
}

export interface LearningRoadmap {
  duration: string;
  title: string;
  objective: string;
  studyYear?: string;
  proficiencyLevel?: string;
  dailyTime?: string;
  statedAssumptions?: string[];
  skillValidationSummary?: ValidatedSkillItem[];
  diagnosticAssessments?: DiagnosticQuestion[];
  milestones: RoadmapMilestone[];
}

export interface StarGuidance {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface InterviewQuestionItem {
  id: string;
  targetedGapSkill: string;
  questionType: string;
  question: string;
  interviewerIntent: string;
  starGuidance: StarGuidance;
  pitfallsToAvoid: string;
  recommendedKeyTalkingPoints: string[];
}

export interface AnalysisResult {
  candidateName?: string;
  executiveSummary: string;
  roleFitScore: number;
  roleFitRationale: string;
  atsEvaluation: AtsEvaluation;
  keyStrengths: KeyStrength[];
  skillGapAnalysis: SkillGapItem[];
  careerNavigatorRoles: CareerRoleRecommendation[];
  learningRoadmap: LearningRoadmap;
  interviewPreparation: InterviewQuestionItem[];
}

export interface InterviewPracticeFeedback {
  scoreOutOf10: number;
  overallCritique: string;
  strengthsInAnswer: string[];
  missedOpportunitiesOrErrors: string[];
  improvedExampleAnswer: string;
}

export interface DemoCandidate {
  id: string;
  name: string;
  tagline: string;
  targetRole: string;
  profile: StudentProfile;
  resumeText: string;
  jobDescription: string;
}

// ----------------------------------------------------
// Navigation & Views
// ----------------------------------------------------

export type ActiveFeature =
  | 'dashboard'
  | 'career-matching'
  | 'resume-analyzer'
  | 'skill-gap'
  | 'career-roadmap'
  | 'virtual-interview'
  | 'job-search'
  | 'profile'
  | 'results'
  | 'career-twin';

export interface CareerTwinGap {
  skill: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium';
  whyItMatters: string;
  actionPlan: string;
  expectedDeliverable: string;
}

export interface CareerTwinDimension {
  name: string;
  currentLevel: number; // 0 - 100
  targetLevel: number; // 0 - 100
  gapDescription: string;
}

export interface CareerTwinData {
  candidateName: string;
  targetRole: string;
  readinessPercentage: number;
  currentSelf: {
    summary: string;
    explicitSkills: string[];
    inferredSkills: string[];
    strongestDomain: string;
  };
  futureSelf: {
    roleTitle: string;
    expectedIndustryBaseline: string;
    mustHaveSkills: string[];
    emergingAdvantageSkills: string[];
  };
  topThreeGaps: CareerTwinGap[];
  competencyDimensions: CareerTwinDimension[];
  transformationSummary: string;
}

export interface CareerMatchInput {
  candidateName?: string;
  technicalSkills: string;
  softSkills: string;
  education: string;
  projects: string;
  interests: string;
  experienceLevel: string;
}

export interface CareerMatchResult {
  candidateName?: string;
  summary: string;
  topRoles: Array<{
    role: string;
    matchPercentage: number;
    fitReason: string;
    requiredSkills: string[];
    skillsYouHave: string[];
    bridgeSkills: string[];
    marketDemand: string;
    recommendedNextSteps: string[];
  }>;
}

export type InterviewType = 'Technical' | 'HR' | 'Behavioural';
export type InterviewDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface InterviewAnswerFeedback {
  scoreOutOf10: number;
  rubricScores: {
    relevance: number;
    clarity: number;
    depthOrCorrectness: number;
    structure: number;
  };
  overallCritique: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  followUpQuestion?: string;
}

export interface InterviewHistoryItem {
  questionNumber: number;
  question: string;
  answer: string;
  feedback: InterviewAnswerFeedback;
}

export interface InterviewFinalSummary {
  candidateName?: string;
  overallScore: number;
  readinessLevel: string;
  executiveSummary: string;
  keyStrengths: string[];
  criticalGrowthAreas: string[];
  preparationRoadmap: string[];
}

export interface StandaloneRoadmapInput {
  candidateName?: string;
  currentSkills: string;
  targetRole: string;
  duration: '7-day' | '30-day' | '60-day' | '90-day';
  currentLevel: string; // 'Beginner' | 'Intermediate' | 'Advanced'
  studyYear?: string; // e.g. '1st Year' | '2nd Year B.Tech IT' | '3rd Year' | '4th Year'
  dailyTime?: string; // e.g. '1 hour/day' | '2 hours/day' | '30 mins/day'
}

export type ExperienceLevel = 'Student' | 'Fresher' | '0-2 years' | 'Experienced';
export type OpportunityType = 'Internship' | 'Entry-Level Job' | 'Graduate Role' | 'Full-Time Job';
export type LocationOption = 'Noida' | 'Delhi-NCR' | 'Gurugram' | 'Bengaluru' | 'Hyderabad' | 'Pune' | 'Remote' | 'Anywhere in India';

export interface StartupMatchCard {
  id: string;
  name: string;
  logoUrl?: string;
  domain: string; // e.g. 'Fintech & Payments', 'Robotics & Automation', 'EdTech SaaS'
  headquarters: string; // e.g. 'Noida Sector 62, Uttar Pradesh'
  techHub: 'Noida' | 'Delhi-NCR' | 'Gurugram' | 'Bengaluru' | 'Hyderabad' | 'Pune' | 'Pan-India';
  description: string;
  matchPercentage: number;
  matchRationale: string;
  matchedRole: string; // Specific targeted role (e.g. "Java Developer Intern", "Frontend Developer Fresher")
  relevantRoles: string[];
  jobType: 'Internship' | 'Fresher / Entry-Level' | 'Full-Time Job' | 'Remote';
  matchedSkills: string[];
  skillsToAcquire: string[];
  hiringType: 'Actively Hiring' | 'Regular Drives' | 'Internships & Fresher Pool';
  statusIndicator: 'Official Careers Portal' | 'Direct Vacancy Filter';
  vacancyStatus: 'Verified Vacancy Listings' | 'Active Drives' | 'Role Search Verified';
  linkPriority: 'Official ATS / Application Link' | 'Role-Specific Career Filter' | 'Filtered Trusted Search';
  relevantJobsUrl: string; // "View Relevant Jobs" button destination (role-specific filtered job search)
  officialApplyUrl: string; // "Apply on Official Website" button destination (direct company application portal/ATS)
  careerUrl: string; // Verified direct link to company careers
  linkedInJobsUrl: string; // Pre-filled company + role search query
  naukriJobsUrl: string; // Pre-filled Naukri search query
  googleJobsUrl: string; // Pre-filled Google search
  notes?: string;
}

export interface StartupJobSearchInput {
  skills: string[];
  targetRole: string;
  educationLevel: string;
  graduationYear: string;
  experienceLevel: ExperienceLevel;
  preferredLocation: LocationOption;
  opportunityType: OpportunityType;
  candidateName?: string;
}

export interface StartupJobSearchResult {
  querySummary: {
    targetRole: string;
    skillsCount: number;
    location: string;
    opportunityType: string;
    experienceLevel: string;
    education: string;
  };
  matchedStartups: StartupMatchCard[];
  directAggregatorUrls: {
    linkedIn: string;
    naukri: string;
    internshala: string;
    wellfound: string;
    googleJobs: string;
  };
  marketInsights: {
    inDemandSkill: string;
    recommendedHub: string;
    hiringSeasonTip: string;
  };
}

