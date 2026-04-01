import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  FileText,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  MessageSquare,
  Lightbulb,
  Code2,
  Zap,
  TrendingUp,
  Lock,
  Clock,
  Target,
  Award,
  BarChart3,
  Download,
  Maximize2,
  X,
  Send,
  Layers,
  PanelLeftClose,
  PanelRightClose,
  BookOpen,
  AlertCircle,
  Loader2,
  RotateCcw,
  Star,
  ChevronDown,
  ChevronUp,
  Info,
  Bookmark,
  Share2,
  FlaskConical,
  GraduationCap,
  Link,
  Paperclip,
  Trophy,
  FolderOpen,
  Microscope,
} from 'lucide-react';
import './course-details.css';

/* ═══════════════════════════════════════════════════════════════
   TYPES  (aligned with JSON schemas)
   ═══════════════════════════════════════════════════════════════ */

type StageKey = 'engage' | 'explore' | 'explain' | 'express' | 'empower' | 'evolve';
type StageStatus = 'completed' | 'in_progress' | 'not_started';
type ModStatus = 'completed' | 'in_progress' | 'available';
type ArtifactType = 'practice' | 'final';

// learner_6e_stage_progress row
interface StageProg {
  key: StageKey;
  status: StageStatus;
  time_spent_seconds: number;
}

// learner_module_progress row
interface ModuleProg {
  id: string;
  module_no: number;
  title: string;
  description: string;
  engineering_workflow_stage: string;
  module_specific_problem_statement: string;
  pressure_points: string;
  student_confusion: string;
  learning_content: {
    major_concepts: string;
    implementation_context_when_to_use: string;
    reason_behind_concept: string;
  };
  support: {
    ai_support_tips: string;
    module_continuity_link: string;
  };
  knowledge: {
    technical_concepts_learnt: string;
    academic_refresher_concepts: string;
  };
  tools: {
    tools_used: string;
    tool_type_free_or_paid: string | null;
  };
  status: ModStatus;
  completion_percentage: number;
  artifact_submitted: boolean;
  estimatedTime: string;
  score?: number;
  stages: StageProg[];
}

// artifact_submissions row
type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'evaluated'
  | 'returned_for_rework'
  | 'approved'
  | 'rejected';

interface Submission {
  id: string;
  attempt_no: number;
  version_label: string;
  is_latest: boolean;
  previous_submission_id: string | null;
  submission_mode: 'fast' | 'normal';
  submission_text: string | null;
  submission_url: string | null;
  status: SubmissionStatus;
  // artifact_evaluation_flows data
  ai_score?: number;
  ai_feedback?: string;
  ai_improvements?: string;
  staff_score?: number;
  staff_feedback?: string;
  industry_score?: number;
  industry_feedback?: string;
  overall_status:
    | 'initiated'
    | 'in_progress'
    | 'completed'
    | 'returned_for_rework'
    | 'approved'
    | 'rejected';
  current_eval_stage?: 'ai' | 'staff' | 'industry';
  rubric?: { criterion: string; score: number; max: number }[];
  submitted_at: string;
  sealed_at: string | null;
}

// artifact_questions row
interface ArtifactQuestion {
  id: string;
  order: number;
  title: string;
  description: string;
  instructions: string;
  submission_required: boolean;
  expected_submission_type?: 'text' | 'file' | 'url' | 'code'; // What type of submission this question expects
  accepted_file_types?: string[]; // e.g., ['.xlsx', '.xls'] for Excel, ['.py', '.js'] for code files
}

// artifact_templates row
interface ArtifactTemplate {
  id: string;
  artifact_id: string;
  question_id: string | null;
  file_name: string;
  file_url: string;
  file_type: 'doc' | 'ppt' | 'excel' | 'pdf' | 'mp4' | 'mp3' | 'jpeg' | 'png' | 'sheet' | 'xls' | 'docs' | 'text' | 'zip';
  version: number;
  is_downloadable: boolean;
}

// module_artifacts row
interface ModuleArtifact {
  id: string;
  artifact_type: ArtifactType;
  total_score: number;
  passing_score: number | null;
  allow_resubmission: boolean;
  require_review_unlock: boolean;
  max_attempts: number | null;
  questions: ArtifactQuestion[];
  submissions: Submission[];
  templates: ArtifactTemplate[];
}

// 6e_content row
interface ContentItem {
  id: string;
  title: string;
  content_type: 'video' | 'pdf' | 'slide' | 'doc' | 'image' | 'text' | 'link';
  duration_seconds?: number;
  url: string;
  status: 'published';
  isViewed: boolean;
}

// Problem track artifact (course-level)
interface ProblemArtifact {
  id: string;
  no: number;
  title: string;
  module: string;
  prompt: string;
  text: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'approved';
  score: number;
}

/* ═══════════════════════════════════════════════════════════════
   STAGE META
   ═══════════════════════════════════════════════════════════════ */
const STAGE_META: Record<
  StageKey,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
    description: string;
    purposeTag: string;
  }
> = {
  engage: {
    label: 'Engage',
    color: '#6366f1',
    icon: <Lightbulb size={14} />,
    description: 'Hook into the real-world problem. Understand the context and stakes.',
    purposeTag: 'Hook & Context',
  },
  explore: {
    label: 'Explore',
    color: '#8b5cf6',
    icon: <FlaskConical size={14} />,
    description: 'Investigate, gather signals, and form initial hypotheses.',
    purposeTag: 'Investigate',
  },
  explain: {
    label: 'Explain',
    color: '#0ea5e9',
    icon: <Layers size={14} />,
    description: 'Understand the core concepts and principles behind the solution.',
    purposeTag: 'Learn Concepts',
  },
  express: {
    label: 'Express',
    color: '#f59e0b',
    icon: <Code2 size={14} />,
    description: 'Apply knowledge — draft your practice artifact.',
    purposeTag: 'Practice Artifact',
  },
  empower: {
    label: 'Empower',
    color: '#10b981',
    icon: <Zap size={14} />,
    description: 'Build and submit your final evaluated artifact.',
    purposeTag: 'Final Artifact',
  },
  evolve: {
    label: 'Evolve',
    color: '#ec4899',
    icon: <TrendingUp size={14} />,
    description: 'Reflect on feedback. Advance your understanding beyond basics.',
    purposeTag: 'Reflect & Grow',
  },
};

const STAGES_ORDER: StageKey[] = ['engage', 'explore', 'explain', 'express', 'empower', 'evolve'];

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA  (structured exactly like DB rows)
   ═══════════════════════════════════════════════════════════════ */

const MOCK_CONTENT_MAP: Record<string, ContentItem[]> = {
  engage: [
    {
      id: 'c1',
      title: 'Incident Kickoff: API Latency Spike',
      content_type: 'video',
      duration_seconds: 540,
      url: '#',
      status: 'published',
      isViewed: true,
    },
    {
      id: 'c2',
      title: 'Failure Investigation Worksheet',
      content_type: 'pdf',
      url: '#',
      status: 'published',
      isViewed: true,
    },
  ],
  explore: [
    {
      id: 'c3',
      title: 'Structured Log Analysis Guide',
      content_type: 'pdf',
      url: '#',
      status: 'published',
      isViewed: true,
    },
    {
      id: 'c4',
      title: 'Service Architecture Diagram',
      content_type: 'image',
      url: '#',
      status: 'published',
      isViewed: false,
    },
    {
      id: 'c5',
      title: 'Reading Trace IDs in Distributed Systems',
      content_type: 'video',
      duration_seconds: 780,
      url: '#',
      status: 'published',
      isViewed: false,
    },
  ],
  explain: [
    {
      id: 'c6',
      title: 'System Architecture Overview',
      content_type: 'slide',
      url: '#',
      status: 'published',
      isViewed: true,
    },
    {
      id: 'c7',
      title: 'Request Lifecycle Deep Dive',
      content_type: 'video',
      duration_seconds: 960,
      url: '#',
      status: 'published',
      isViewed: true,
    },
  ],
  express: [
    {
      id: 'c8',
      title: 'Practice: Draft Logging Schema',
      content_type: 'doc',
      url: '#',
      status: 'published',
      isViewed: false,
    },
  ],
  empower: [
    {
      id: 'c9',
      title: 'Final: Incident Investigation Report',
      content_type: 'doc',
      url: '#',
      status: 'published',
      isViewed: false,
    },
  ],
  evolve: [
    {
      id: 'c10',
      title: 'Reflection Prompts & Next Steps',
      content_type: 'text',
      url: '#',
      status: 'published',
      isViewed: false,
    },
  ],
};

// module_artifacts + artifact_questions + artifact_templates
const MOCK_ARTIFACT_EXPRESS: ModuleArtifact = {
  id: 'ma-001',
  artifact_type: 'practice',
  total_score: 0,
  passing_score: null,
  allow_resubmission: true,
  require_review_unlock: false,
  max_attempts: null, // Unlimited attempts for practice
  questions: [
    {
      id: 'aq-001',
      order: 1,
      title: 'Failure Investigation Map',
      description:
        'Create a first-pass incident map showing service boundaries and symptom points.',
      instructions: '1) Read incident context. 2) Draw request flow. 3) Mark weak signals.',
      submission_required: false,
      expected_submission_type: 'text',
    },
    {
      id: 'aq-002',
      order: 2,
      title: 'Hypothesis List',
      description: 'List at least 3 root-cause hypotheses based on your investigation map.',
      instructions: '1) Review your map. 2) List hypotheses. 3) Rank by likelihood.',
      submission_required: false, // Practice - not required
      expected_submission_type: 'text',
    },
  ],
  submissions: [],
  templates: [],
};

const MOCK_ARTIFACT_EMPOWER: ModuleArtifact = {
  id: 'ma-002',
  artifact_type: 'final',
  total_score: 100,
  passing_score: 70,
  allow_resubmission: true,
  require_review_unlock: true,
  max_attempts: 3,
  questions: [
    {
      id: 'aq-003',
      order: 1,
      title: 'Evidence Mapping Spreadsheet',
      description: 'Download the Excel template and map log/trace evidence to each root-cause hypothesis.',
      instructions: '1) Download evidence-mapping-template.xlsx. 2) Fill in log entries. 3) Map to hypotheses. 4) Upload completed file.',
      submission_required: true,
      expected_submission_type: 'file',
      accepted_file_types: ['.xlsx', '.xls'],
    },
    {
      id: 'aq-004',
      order: 2,
      title: 'Root Cause Analysis Code',
      description:
        'Write Python code to analyze the log patterns and identify the root cause.',
      instructions: '1) Use the provided log data. 2) Write analysis script. 3) Submit your code.',
      submission_required: true,
      expected_submission_type: 'code',
      accepted_file_types: ['.py'],
    },
    {
      id: 'aq-005',
      order: 3,
      title: 'GitHub Repository Link',
      description:
        'Create a GitHub repository with your complete investigation including code, data, and documentation.',
      instructions: '1) Create GitHub repo. 2) Push all files. 3) Submit repository URL.',
      submission_required: true,
      expected_submission_type: 'url',
    },
  ],
  submissions: [
    {
      id: 'as-001',
      attempt_no: 1,
      version_label: 'v1',
      is_latest: false,
      previous_submission_id: null,
      submission_mode: 'normal',
      submission_text: 'Root cause likely originates from unbounded DB retries under high load.',
      submission_url: null,
      status: 'returned_for_rework',
      overall_status: 'returned_for_rework',
      ai_score: 62,
      ai_feedback: 'Clear incident context. Add stronger evidence correlation.',
      ai_improvements: 'Strengthen evidence chain with trace IDs.',
      staff_score: 58,
      staff_feedback:
        'Strong framing. Improve hypothesis prioritization and add trace correlation.',
      current_eval_stage: 'staff',
      rubric: [
        { criterion: 'Evidence Quality', score: 2, max: 4 },
        { criterion: 'Hypothesis Prioritization', score: 1, max: 4 },
        { criterion: 'Trace Correlation', score: 1, max: 4 },
        { criterion: 'Report Clarity', score: 2, max: 4 },
      ],
      submitted_at: '2024-01-21T10:15:00Z',
      sealed_at: '2024-01-21T10:15:00Z',
    },
    {
      id: 'as-002',
      attempt_no: 2,
      version_label: 'v2',
      is_latest: true,
      previous_submission_id: 'as-001',
      submission_mode: 'fast',
      submission_text:
        'Updated report includes trace-to-service mapping and ranked hypotheses with confidence scores.',
      submission_url: null,
      status: 'approved',
      overall_status: 'approved',
      ai_score: 88,
      ai_feedback: 'Excellent trace correlation and structured hypotheses.',
      ai_improvements: 'Minor: could expand on remediation timeline.',
      staff_score: 90,
      staff_feedback:
        'Strong investigation methodology. Well-ranked hypotheses with solid evidence.',
      current_eval_stage: 'staff',
      rubric: [
        { criterion: 'Evidence Quality', score: 4, max: 4 },
        { criterion: 'Hypothesis Prioritization', score: 4, max: 4 },
        { criterion: 'Trace Correlation', score: 3, max: 4 },
        { criterion: 'Report Clarity', score: 3, max: 4 },
      ],
      submitted_at: '2024-01-22T09:20:00Z',
      sealed_at: '2024-01-22T09:20:00Z',
    },
  ],
  templates: [
    {
      id: 'at-004',
      artifact_id: 'ma-002',
      question_id: 'aq-003',
      file_name: 'evidence-mapping-template.xlsx',
      file_url: 'https://content.rareminds.dev/templates/mod-001/evidence-mapping-template.xlsx',
      file_type: 'excel',
      version: 1,
      is_downloadable: true,
    },
  ],
};

const ARTIFACT_MAP: Record<string, { express?: ModuleArtifact; empower?: ModuleArtifact }> = {
  'mod-001': { express: MOCK_ARTIFACT_EXPRESS, empower: MOCK_ARTIFACT_EMPOWER },
};

const MOCK_MODULES: ModuleProg[] = [
  {
    id: 'mod-001',
    module_no: 1,
    title: 'System Failure Investigation',
    description: 'Learn how to investigate and debug system failures in production environments.',
    engineering_workflow_stage: 'System Investigation',
    module_specific_problem_statement: 'Production API latency increases during peak traffic.',
    pressure_points: 'Engineers rely on print statements and cannot locate failure source.',
    student_confusion: 'How backend systems fail under load.',
    learning_content: {
      major_concepts: 'System architecture, request lifecycle, observability overview',
      implementation_context_when_to_use: 'Understanding system interactions before debugging',
      reason_behind_concept: 'Logs investigation',
    },
    support: {
      ai_support_tips: 'Foundation for logging module',
      module_continuity_link: 'Output becomes input baseline for Module 2 structured logging.',
    },
    knowledge: {
      technical_concepts_learnt: 'Operating systems basics',
      academic_refresher_concepts: 'Logs dashboards',
    },
    tools: {
      tools_used: 'Free',
      tool_type_free_or_paid: null,
    },
    status: 'in_progress',
    completion_percentage: 33,
    artifact_submitted: false,
    estimatedTime: '2.5 hrs',
    stages: [
      { key: 'engage', status: 'completed', time_spent_seconds: 3600 },
      { key: 'explore', status: 'completed', time_spent_seconds: 2700 },
      { key: 'explain', status: 'in_progress', time_spent_seconds: 1200 },
      { key: 'express', status: 'not_started', time_spent_seconds: 0 },
      { key: 'empower', status: 'not_started', time_spent_seconds: 0 },
      { key: 'evolve', status: 'not_started', time_spent_seconds: 0 },
    ],
  },
  {
    id: 'mod-002',
    module_no: 2,
    title: 'Structured Logging',
    description: 'Learn how to produce high-signal logs for faster incident diagnosis.',
    engineering_workflow_stage: 'Signal Analysis (Logging)',
    module_specific_problem_statement: 'System failures lack traceability due to poor logging.',
    pressure_points: 'Developers rely on console prints.',
    student_confusion: 'What meaningful logs look like.',
    learning_content: {
      major_concepts: 'Structured logging, log levels',
      implementation_context_when_to_use: 'Implement logs for observability',
      reason_behind_concept: 'Review poorly logged systems',
    },
    support: {
      ai_support_tips: 'Feeds debugging workflow',
      module_continuity_link: 'Log report guides debugger inspection in Module 3.',
    },
    knowledge: {
      technical_concepts_learnt: 'Programming basics',
      academic_refresher_concepts: 'Python logging',
    },
    tools: {
      tools_used: 'Free',
      tool_type_free_or_paid: null,
    },
    status: 'available',
    completion_percentage: 0,
    artifact_submitted: false,
    estimatedTime: '2 hrs',
    stages: STAGES_ORDER.map(k => ({
      key: k,
      status: 'not_started' as StageStatus,
      time_spent_seconds: 0,
    })),
  },
  {
    id: 'mod-003',
    module_no: 3,
    title: 'Debugging Tools',
    description: 'Use breakpoints and runtime inspection to isolate backend failures.',
    engineering_workflow_stage: 'Runtime Diagnosis (Debugging)',
    module_specific_problem_statement: 'Backend bug crashes services in production.',
    pressure_points: 'Developers cannot reproduce bugs locally.',
    student_confusion: 'Debugger usage unclear.',
    learning_content: {
      major_concepts: 'Breakpoints, stack traces',
      implementation_context_when_to_use: 'Use debugging tools systematically',
      reason_behind_concept: 'Inspect failing backend service',
    },
    support: {
      ai_support_tips: 'Builds on logging analysis',
      module_continuity_link: 'Debug trace identifies conditions to reproduce in Module 4.',
    },
    knowledge: {
      technical_concepts_learnt: 'Processes and threads',
      academic_refresher_concepts: 'VS Code debugger',
    },
    tools: {
      tools_used: 'Free',
      tool_type_free_or_paid: null,
    },
    status: 'available',
    completion_percentage: 0,
    artifact_submitted: false,
    estimatedTime: '3 hrs',
    stages: STAGES_ORDER.map(k => ({
      key: k,
      status: 'not_started' as StageStatus,
      time_spent_seconds: 0,
    })),
  },
  {
    id: 'mod-004',
    module_no: 4,
    title: 'Reproducing Bugs',
    description: 'Create controlled test setups to reproduce intermittent production defects.',
    engineering_workflow_stage: 'Bug Reproduction',
    module_specific_problem_statement: 'Intermittent production bug cannot be replicated.',
    pressure_points: 'Developers guess fixes.',
    student_confusion: 'How to reproduce bugs systematically.',
    learning_content: {
      major_concepts: 'Test cases, controlled reproduction',
      implementation_context_when_to_use: 'Recreate failure conditions',
      reason_behind_concept: 'Analyze intermittent bug',
    },
    support: {
      ai_support_tips: 'Supports root cause discovery',
      module_continuity_link: 'Reproduction plan supplies validated failure conditions for Module 5 RCA.',
    },
    knowledge: {
      technical_concepts_learnt: 'Operating systems',
      academic_refresher_concepts: 'Test frameworks',
    },
    tools: {
      tools_used: 'Free',
      tool_type_free_or_paid: null,
    },
    status: 'available',
    completion_percentage: 0,
    artifact_submitted: false,
    estimatedTime: '2 hrs',
    stages: STAGES_ORDER.map(k => ({
      key: k,
      status: 'not_started' as StageStatus,
      time_spent_seconds: 0,
    })),
  },
  {
    id: 'mod-005',
    module_no: 5,
    title: 'Root Cause Analysis',
    description: 'Separate symptom and cause to produce evidence-based corrective actions.',
    engineering_workflow_stage: 'Root Cause Identification',
    module_specific_problem_statement: 'Engineers fix symptoms rather than root cause.',
    pressure_points: 'Temporary fixes hide underlying issue.',
    student_confusion: 'Root cause analysis process.',
    learning_content: {
      major_concepts: 'Root cause analysis frameworks',
      implementation_context_when_to_use: 'Identify underlying system issue',
      reason_behind_concept: 'Review production incident',
    },
    support: {
      ai_support_tips: 'Leads into final project',
      module_continuity_link: 'RCA report drives final resolution and validation in Module 6.',
    },
    knowledge: {
      technical_concepts_learnt: 'System concepts',
      academic_refresher_concepts: 'Logs debugger',
    },
    tools: {
      tools_used: 'Free',
      tool_type_free_or_paid: null,
    },
    status: 'available',
    completion_percentage: 0,
    artifact_submitted: false,
    estimatedTime: '2 hrs',
    stages: STAGES_ORDER.map(k => ({
      key: k,
      status: 'not_started' as StageStatus,
      time_spent_seconds: 0,
    })),
  },
  {
    id: 'mod-006',
    module_no: 6,
    title: 'Observability Capstone',
    description:
      'Execute end-to-end incident handling from investigation to validated fix and communication.',
    engineering_workflow_stage: 'Incident Resolution Capstone',
    module_specific_problem_statement:
      'Learners must investigate, diagnose, and resolve a realistic backend production incident.',
    pressure_points: 'Engineers must combine logs, debugging, and RCA.',
    student_confusion: 'Complete debugging workflow.',
    learning_content: {
      major_concepts: 'Full observability workflow, incident comms, post-mortems',
      implementation_context_when_to_use: 'End to end investigation',
      reason_behind_concept: 'Review full production scenario',
    },
    support: {
      ai_support_tips: 'Integrates all modules',
      module_continuity_link: 'Integrates all prior module artifacts into one capstone output.',
    },
    knowledge: {
      technical_concepts_learnt: 'Programming OS',
      academic_refresher_concepts: 'Logs debugger monitoring',
    },
    tools: {
      tools_used: 'Free',
      tool_type_free_or_paid: null,
    },
    status: 'available',
    completion_percentage: 0,
    artifact_submitted: false,
    estimatedTime: '4 hrs',
    stages: STAGES_ORDER.map(k => ({
      key: k,
      status: 'not_started' as StageStatus,
      time_spent_seconds: 0,
    })),
  },
];

const INIT_PROBLEM_ARTIFACTS: ProblemArtifact[] = [
  {
    id: 'pa1',
    no: 1,
    title: 'System Failure Investigation Report',
    module: 'System Failure Investigation',
    prompt:
      'Production API latency increases during peak traffic. Create a first-pass incident map and list root-cause hypotheses.',
    text: '',
    status: 'not_started',
    score: 0,
  },
  {
    id: 'pa2',
    no: 2,
    title: 'Structured Logging Plan',
    module: 'Structured Logging',
    prompt:
      'System failures lack traceability. Design a structured logging schema with severity levels and correlation IDs.',
    text: '',
    status: 'not_started',
    score: 0,
  },
  {
    id: 'pa3',
    no: 3,
    title: 'Debugging Trace & Root Cause',
    module: 'Debugging Tools',
    prompt: 'Backend bug crashes services. Produce a debug trace and identify the root cause.',
    text: '',
    status: 'not_started',
    score: 0,
  },
  {
    id: 'pa4',
    no: 4,
    title: 'Bug Reproduction Plan',
    module: 'Reproducing Bugs',
    prompt:
      'Intermittent production bug cannot be replicated. Create a controlled reproduction plan.',
    text: '',
    status: 'not_started',
    score: 0,
  },
  {
    id: 'pa5',
    no: 5,
    title: 'Root Cause Analysis Document',
    module: 'Root Cause Analysis',
    prompt:
      'Engineers fix symptoms rather than root cause. Produce an evidence-based RCA document.',
    text: '',
    status: 'not_started',
    score: 0,
  },
  {
    id: 'pa6',
    no: 6,
    title: 'Incident Resolution Capstone',
    module: 'Observability Capstone',
    prompt:
      'Investigate, diagnose, and resolve a realistic backend production incident using a full observability workflow.',
    text: '',
    status: 'not_started',
    score: 0,
  },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function fmtDuration(secs?: number) {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  return m > 0 ? `${m} min` : `${secs}s`;
}

function fmtTime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function contentIcon(type: string, size = 15) {
  if (type === 'video') return <PlayCircle size={size} />;
  if (type === 'pdf') return <FileText size={size} />;
  if (type === 'slide') return <Layers size={size} />;
  if (type === 'doc') return <FileText size={size} />;
  return <BookOpen size={size} />;
}

function statusColor(status: SubmissionStatus | string) {
  if (status === 'approved') return { bg: '#ecfdf5', color: '#059669', label: 'Approved' };
  if (status === 'returned_for_rework')
    return { bg: '#fef3c7', color: '#d97706', label: 'Returned for Rework' };
  if (status === 'under_review') return { bg: '#eff6ff', color: '#2563eb', label: 'Under Review' };
  if (status === 'submitted') return { bg: '#f5f3ff', color: '#7c3aed', label: 'Submitted' };
  if (status === 'rejected') return { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' };
  if (status === 'evaluated') return { bg: '#ecfdf5', color: '#059669', label: 'Evaluated' };
  return { bg: '#f8fafc', color: '#64748b', label: status };
}

/* ═══════════════════════════════════════════════════════════════
   EVALUATION PIPELINE DISPLAY
   ═══════════════════════════════════════════════════════════════ */
function EvalPipeline({ submission }: { submission: Submission }) {
  const stages = ['ai', 'staff', 'industry'] as const;
  const order = { ai: 1, staff: 2, industry: 3 };
  const current = submission.current_eval_stage;

  const getStageStatus = (s: 'ai' | 'staff' | 'industry') => {
    if (!current) return 'pending';
    if (order[s] < order[current]) return 'completed';
    if (s === current)
      return submission.overall_status === 'returned_for_rework' ? 'returned' : 'active';
    return 'pending';
  };

  return (
    <div className="cd-eval-pipeline">
      {stages.map((s, i) => {
        const st = getStageStatus(s);
        return (
          <React.Fragment key={s}>
            <div className={`cd-eval-stage cd-eval-stage--${st}`}>
              <div className="cd-eval-stage-icon">
                {st === 'completed' ? (
                  <CheckCircle2 size={14} />
                ) : st === 'active' ? (
                  <Loader2 size={14} className="cd-spin" />
                ) : st === 'returned' ? (
                  <RotateCcw size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </div>
              <span className="cd-eval-stage-label">
                {s === 'ai' ? 'AI Review' : s === 'staff' ? 'Staff Review' : 'Industry Review'}
              </span>
            </div>
            {i < 2 && <div className={`cd-eval-connector ${st === 'completed' ? 'filled' : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Circle({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCORE RING
   ═══════════════════════════════════════════════════════════════ */
function ScoreRing({
  score,
  size = 72,
  passingScore,
}: {
  score: number;
  size?: number;
  passingScore?: number | null;
}) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const passed = passingScore == null || score >= passingScore;
  const stroke = passed ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="cd-score-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="cd-score-ring-num" style={{ color: stroke }}>
        {score}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ARTIFACT PANEL (right panel content for express / empower)
   ═══════════════════════════════════════════════════════════════ */
interface ArtifactPanelProps {
  artifact: ModuleArtifact;
  moduleId: string;
  onSubmit: (
    moduleId: string,
    artifactId: string,
    text: string,
    mode: 'fast' | 'normal',
    url?: string
  ) => void;
}

function ArtifactPanel({ artifact, onSubmit }: ArtifactPanelProps) {
  const [tab, setTab] = useState<'submit' | 'feedback'>('submit');
  const [expandedQ, setExpandedQ] = useState<string | null>(artifact.questions[0]?.id ?? null);
  
  // Per-question submission state
  const [questionSubmissions, setQuestionSubmissions] = useState<Record<string, {
    type: 'text' | 'url' | 'file' | 'code';
    text: string;
    url: string;
    file: File | null;
    codeLanguage: string;
  }>>({});
  
  const [activeAttempt, setActiveAttempt] = useState(
    artifact.submissions.length > 0 ? artifact.submissions.length : 0
  );

  // Initialize question submissions
  React.useEffect(() => {
    const initial: typeof questionSubmissions = {};
    artifact.questions.forEach(q => {
      // For practice artifacts, all questions get submission UI
      // For final artifacts, only required questions get submission UI
      if (artifact.artifact_type === 'practice' || q.submission_required) {
        initial[q.id] = {
          type: q.expected_submission_type || 'text',
          text: '',
          url: '',
          file: null,
          codeLanguage: 'javascript',
        };
      }
    });
    setQuestionSubmissions(initial);
  }, [artifact.questions, artifact.artifact_type]);

  const latestSub = artifact.submissions.find(s => s.is_latest);
  const canSubmit =
    !latestSub ||
    (artifact.allow_resubmission &&
      (!artifact.require_review_unlock ||
        ['returned_for_rework', 'approved', 'rejected'].includes(latestSub.overall_status)));

  const attemptsLeft =
    artifact.max_attempts == null ? '∞' : artifact.max_attempts - artifact.submissions.length;

  const displaySub = artifact.submissions[activeAttempt - 1];

  const handleSubmit = () => {
    // Collect all question submissions
    const submissions = Object.entries(questionSubmissions).map(([qId, data]) => {
      const question = artifact.questions.find(q => q.id === qId);
      if (!question?.submission_required) return null;
      
      let content = '';
      let url = '';
      
      if (data.type === 'text' || data.type === 'code') {
        content = data.text;
      } else if (data.type === 'url') {
        url = data.url;
      } else if (data.type === 'file' && data.file) {
        // In real implementation, upload file and get URL
        url = `https://storage.example.com/submissions/${data.file.name}`;
      }
      
      return { questionId: qId, content, url };
    }).filter(Boolean);
    
    // Combine all submissions into one
    const combinedText = submissions
      .map(s => s?.content)
      .filter(Boolean)
      .join('\n\n---\n\n');
    const combinedUrl = submissions.find(s => s?.url)?.url || '';
    
    onSubmit('', artifact.id, combinedText, 'normal', combinedUrl);
    
    // Reset submissions
    const reset: typeof questionSubmissions = {};
    artifact.questions.forEach(q => {
      if (q.submission_required) {
        reset[q.id] = {
          type: q.expected_submission_type || 'text',
          text: '',
          url: '',
          file: null,
          codeLanguage: 'javascript',
        };
      }
    });
    setQuestionSubmissions(reset);
  };
  
  const isSubmitDisabled = () => {
    // For practice artifacts, never disable submit
    if (artifact.artifact_type === 'practice') return false;
    
    // For final artifacts, check required questions
    return artifact.questions
      .filter(q => q.submission_required)
      .some(q => {
        const data = questionSubmissions[q.id];
        if (!data) return true;
        
        if (data.type === 'text' || data.type === 'code') return !data.text.trim();
        if (data.type === 'url') return !data.url.trim();
        if (data.type === 'file') return !data.file;
        return true;
      });
  };
  
  const updateQuestionSubmission = (questionId: string, updates: Partial<typeof questionSubmissions[string]>) => {
    setQuestionSubmissions(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...updates },
    }));
  };

  // Force show feedback tab if there are submissions and latest is not rework
  const hasFeedback = artifact.submissions.length > 0;

  return (
    <div className="cd-artifact-panel">
      {/* Artifact header */}
      <div className="cd-ap-header">
        <div>
          <span className={`cd-ap-type-badge cd-ap-type--${artifact.artifact_type}`}>
            {artifact.artifact_type === 'practice' ? (
              <>
                <FlaskConical size={12} /> Practice
              </>
            ) : (
              <>
                <Trophy size={12} /> Final Artifact
              </>
            )}
          </span>
          <div className="cd-ap-rules">
            {artifact.artifact_type === 'final' && (
              <>
                <span>
                  Pass: {artifact.passing_score}/{artifact.total_score}
                </span>
                {artifact.max_attempts && <span>Max: {artifact.max_attempts} attempts</span>}
              </>
            )}
          </div>
        </div>
        {hasFeedback && (
          <div className="cd-ap-tabs">
            <button
              className={`cd-ap-tab${tab === 'submit' ? '--active' : ''}`}
              onClick={() => setTab('submit')}
            >
              {canSubmit ? 'Submit' : 'View'}
            </button>
            <button
              className={`cd-ap-tab${tab === 'feedback' ? '--active' : ''}`}
              onClick={() => setTab('feedback')}
            >
              Feedback <span className="cd-ap-count">{artifact.submissions.length}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── SUBMIT TAB ── */}
      {tab === 'submit' && (
        <div className="cd-ap-body">
          {/* Practice artifact info banner */}
          {artifact.artifact_type === 'practice' && (
            <div className="cd-ap-status-banner cd-ap-status--info">
              <Info size={14} /> This is a practice artifact. Complete it to understand the concepts — no evaluation or scoring.
            </div>
          )}
          
          {/* Resubmission status banner (final artifacts only) */}
          {artifact.artifact_type === 'final' && latestSub && (
            <div className={`cd-ap-status-banner cd-ap-status--${latestSub.overall_status}`}>
              {latestSub.overall_status === 'returned_for_rework' && (
                <>
                  <RotateCcw size={14} /> Returned for rework. Review feedback and resubmit.
                </>
              )}
              {latestSub.overall_status === 'in_progress' && latestSub.status === 'under_review' && (
                <>
                  <Loader2 size={14} className="cd-spin" /> Under review — cannot resubmit yet.
                </>
              )}
              {latestSub.overall_status === 'approved' && (
                <>
                  <CheckCircle2 size={14} /> Approved! Score:{' '}
                  {latestSub.staff_score ?? latestSub.ai_score}
                </>
              )}
              {latestSub.overall_status === 'in_progress' && (
                <>
                  <Loader2 size={14} className="cd-spin" /> In review pipeline…
                </>
              )}
            </div>
          )}

          {/* Questions with per-question submissions */}
          {artifact.questions.map(q => {
            // Get templates for this question
            const questionTemplates = artifact.templates.filter(t => t.question_id === q.id);
            const qData = questionSubmissions[q.id];
            
            return (
              <div key={q.id} className="cd-ap-question">
                <button
                  className="cd-ap-q-header"
                  onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                >
                  <div className="cd-ap-q-title-row">
                    <span className="cd-ap-q-num">Q{q.order}</span>
                    <span className="cd-ap-q-title">{q.title}</span>
                    {artifact.artifact_type === 'final' && q.submission_required && <span className="cd-ap-q-required">Required</span>}
                    {q.expected_submission_type && (
                      <span className="cd-ap-q-type-badge">
                        {q.expected_submission_type === 'file' && (
                          <>
                            <Paperclip size={11} /> File
                          </>
                        )}
                        {q.expected_submission_type === 'code' && (
                          <>
                            <Code2 size={11} /> Code
                          </>
                        )}
                        {q.expected_submission_type === 'url' && (
                          <>
                            <Link size={11} /> Link
                          </>
                        )}
                        {q.expected_submission_type === 'text' && (
                          <>
                            <FileText size={11} /> Text
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  {expandedQ === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {expandedQ === q.id && (
                  <div className="cd-ap-q-body">
                    <p className="cd-ap-q-desc">{q.description}</p>
                    <div className="cd-ap-q-instructions">
                      <Info size={12} /> <span>{q.instructions}</span>
                    </div>
                    
                    {/* Question-specific templates */}
                    {questionTemplates.length > 0 && (
                      <div className="cd-ap-q-templates">
                        <span className="cd-ap-q-templates-label">Templates:</span>
                        {questionTemplates.map(t => (
                          <a
                            key={t.id}
                            href={t.file_url}
                            className="cd-ap-template-link"
                            download={t.is_downloadable}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download size={11} />
                            {t.file_name}
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {/* Per-question submission area */}
                    {qData && canSubmit && (
                      <div className="cd-ap-q-submission">
                        {/* File Upload for this question */}
                        {qData.type === 'file' && (
                          <div className="cd-ap-file-upload-wrap">
                            <label className="cd-ap-file-upload-area cd-ap-file-upload-area--compact">
                              <input
                                type="file"
                                className="cd-ap-file-input"
                                onChange={e => updateQuestionSubmission(q.id, { file: e.target.files?.[0] || null })}
                                accept={q.accepted_file_types?.join(',') || '*'}
                              />
                              {qData.file ? (
                                <div className="cd-ap-file-selected cd-ap-file-selected--compact">
                                  <FileText size={20} />
                                  <span className="cd-ap-file-name">{qData.file.name}</span>
                                  <button
                                    className="cd-ap-file-remove cd-ap-file-remove--compact"
                                    onClick={e => {
                                      e.preventDefault();
                                      updateQuestionSubmission(q.id, { file: null });
                                    }}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="cd-ap-file-placeholder cd-ap-file-placeholder--compact">
                                  <Download size={20} />
                                  <span className="cd-ap-file-placeholder-text">
                                    Upload {q.accepted_file_types?.join(', ') || 'file'}
                                  </span>
                                </div>
                              )}
                            </label>
                          </div>
                        )}

                        {/* URL Input for this question */}
                        {qData.type === 'url' && (
                          <div className="cd-ap-url-input-wrap">
                            <input
                              type="url"
                              className="cd-ap-url-input cd-ap-url-input--compact"
                              placeholder="https://github.com/username/repo"
                              value={qData.url}
                              onChange={e => updateQuestionSubmission(q.id, { url: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Code Editor for this question */}
                        {qData.type === 'code' && (
                          <div className="cd-ap-code-wrap">
                            <div className="cd-ap-code-header">
                              <label className="cd-ap-input-label">Language:</label>
                              <select
                                className="cd-ap-code-lang-select"
                                value={qData.codeLanguage}
                                onChange={e => updateQuestionSubmission(q.id, { codeLanguage: e.target.value })}
                              >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                              </select>
                            </div>
                            <textarea
                              className="cd-ap-textarea cd-ap-code-textarea"
                              placeholder={`# Write your ${qData.codeLanguage} code here...\n\ndef analyze_logs():\n    # Your implementation\n    pass`}
                              value={qData.text}
                              onChange={e => updateQuestionSubmission(q.id, { text: e.target.value })}
                              rows={10}
                              spellCheck={false}
                            />
                          </div>
                        )}

                        {/* Text Input for this question */}
                        {qData.type === 'text' && (
                          <div className="cd-ap-textarea-wrap">
                            <textarea
                              className="cd-ap-textarea"
                              placeholder="Write your response here..."
                              value={qData.text}
                              onChange={e => updateQuestionSubmission(q.id, { text: e.target.value })}
                              rows={6}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Submission area */}
          {canSubmit ? (
            <>
              <div className="cd-ap-actions">
                <div className="cd-ap-submit-group">
                  {artifact.artifact_type === 'final' && attemptsLeft !== '∞' && (
                    <span className="cd-ap-attempts-left">{attemptsLeft} attempts left</span>
                  )}
                  <button
                    className="cd-btn-sm-primary"
                    disabled={artifact.artifact_type === 'final' && isSubmitDisabled()}
                    onClick={handleSubmit}
                  >
                    <Send size={13} /> {artifact.artifact_type === 'practice' ? 'Save Practice Work' : 'Submit All Answers'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="cd-ap-locked-submit">
              <Lock size={14} />
              <span>
                {latestSub?.overall_status === 'in_progress' && latestSub?.status === 'under_review'
                  ? 'Awaiting review before resubmission is unlocked'
                  : latestSub?.overall_status === 'approved'
                    ? `Max score achieved (${latestSub.staff_score ?? latestSub.ai_score})`
                    : 'Resubmission not available'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── FEEDBACK TAB ── (only for final artifacts) */}
      {tab === 'feedback' && hasFeedback && artifact.artifact_type === 'final' && (
        <div className="cd-ap-body cd-ap-feedback-body">
          {/* Attempt selector */}
          {artifact.submissions.length > 1 && (
            <div className="cd-ap-attempt-tabs">
              {artifact.submissions.map((s, i) => {
                const sc = statusColor(s.overall_status);
                return (
                  <button
                    key={s.id}
                    className={`cd-ap-attempt-btn${activeAttempt === i + 1 ? ' active' : ''}`}
                    onClick={() => setActiveAttempt(i + 1)}
                    style={
                      activeAttempt === i + 1 ? { borderColor: sc.color, color: sc.color } : {}
                    }
                  >
                    {s.version_label}
                    {s.staff_score != null && (
                      <span className="cd-ap-att-score">{s.staff_score}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {displaySub && (
            <>
              {/* Status + Score */}
              <div className="cd-ap-feedback-hero">
                <ScoreRing
                  score={displaySub.staff_score ?? displaySub.ai_score ?? 0}
                  size={72}
                  passingScore={artifact.passing_score}
                />
                <div className="cd-ap-feedback-hero-info">
                  <div
                    className="cd-ap-feedback-status"
                    style={(() => {
                      const c = statusColor(displaySub.overall_status);
                      return { background: c.bg, color: c.color };
                    })()}
                  >
                    {statusColor(displaySub.overall_status).label}
                  </div>
                  <p className="cd-ap-feedback-date">
                    Submitted{' '}
                    {new Date(displaySub.submitted_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="cd-ap-feedback-mode">
                    Mode: <strong>{displaySub.submission_mode}</strong>
                  </p>
                </div>
              </div>

              {/* Eval pipeline */}
              <EvalPipeline submission={displaySub} />

              {/* Submitted Content */}
              <div className="cd-ap-submission-display">
                <div className="cd-ap-submission-type-badge">
                  {displaySub.submission_url ? (
                    displaySub.submission_url.includes('github.com') ? (
                      <>
                        <Code2 size={10} /> GitHub Link
                      </>
                    ) : displaySub.submission_url.match(/\.(pdf|doc|docx|ppt|pptx)$/i) ? (
                      <>
                        <FileText size={10} /> File Upload
                      </>
                    ) : (
                      <>
                        <Layers size={10} /> URL Link
                      </>
                    )
                  ) : (
                    <>
                      <FileText size={10} /> Text Submission
                    </>
                  )}
                </div>
                
                {displaySub.submission_url ? (
                  <a
                    href={displaySub.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cd-ap-submission-url"
                  >
                    <Layers size={14} />
                    {displaySub.submission_url}
                    <ChevronRight size={14} />
                  </a>
                ) : displaySub.submission_text ? (
                  <div className="cd-ap-submission-content">
                    {displaySub.submission_text}
                  </div>
                ) : (
                  <p className="cd-ap-submission-content" style={{ color: '#94a3b8' }}>
                    No content available
                  </p>
                )}
              </div>

              {/* Rubric */}
              {displaySub.rubric && (
                <div className="cd-ap-rubric">
                  <h5 className="cd-ap-section-title">Rubric Breakdown</h5>
                  {displaySub.rubric.map(r => (
                    <div key={r.criterion} className="cd-ap-rubric-row">
                      <div className="cd-ap-rubric-top">
                        <span>{r.criterion}</span>
                        <span className="cd-ap-rubric-score">
                          {r.score}/{r.max}
                        </span>
                      </div>
                      <div className="cd-ap-rubric-track">
                        <div
                          className="cd-ap-rubric-fill"
                          style={{
                            width: `${(r.score / r.max) * 100}%`,
                            background:
                              r.score / r.max >= 0.75
                                ? '#10b981'
                                : r.score / r.max >= 0.5
                                  ? '#f59e0b'
                                  : '#ef4444',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Staff feedback */}
              {displaySub.staff_feedback && (
                <div className="cd-ap-fb-card cd-ap-fb-card--staff">
                  <div className="cd-ap-fb-card-header">
                    <Star size={13} /> Staff Feedback
                  </div>
                  <p>{displaySub.staff_feedback}</p>
                  {displaySub.ai_improvements && (
                    <div className="cd-ap-improvements">
                      <AlertCircle size={12} /> <span>{displaySub.ai_improvements}</span>
                    </div>
                  )}
                </div>
              )}

              {displaySub.overall_status === 'returned_for_rework' && (
                <button
                  className="cd-btn-sm-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setTab('submit')}
                >
                  <RotateCcw size={13} /> Resubmit
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function CourseDetails() {
  const navigate = useNavigate();

  /* ── View state ── */
  const [viewerActive, setViewerActive] = useState(false);
  const [learningMode, setLearningMode] = useState<'module' | 'problem' | null>('module');

  /* ── Viewer state ── */
  const [leftOpen, setLeftOpen] = useState(true);
  const [leftExpanded, setLeftExpanded] = useState(false); // New: expanded state for left panel
  const [rightOpen, setRightOpen] = useState(true);
  const [rightExpanded, setRightExpanded] = useState(false); // New: expanded state for right panel
  const [activeModId, setActiveModId] = useState('mod-001');
  const [activeStage, setActiveStage] = useState<StageKey>('explain');
  const [activeContentId, setActiveContentId] = useState('c1');

  /* ── Mobile sidebar state ── */
  const [mobileLeftVisible, setMobileLeftVisible] = useState(false);
  const [mobileRightVisible, setMobileRightVisible] = useState(false);

  /* ── Module data (learner_module_progress) ── */
  const [modules, setModules] = useState<ModuleProg[]>(MOCK_MODULES);

  /* ── Artifact state per module ── */
  const [artifactMap, setArtifactMap] = useState(ARTIFACT_MAP);

  /* ── Problem track state ── */
  const [problemArtifacts, setProblemArtifacts] =
    useState<ProblemArtifact[]>(INIT_PROBLEM_ARTIFACTS);
  const [activeProblemId, setActiveProblemId] = useState('pa1');

  const activeMod = modules.find(m => m.id === activeModId)!;
  const stageIdx = STAGES_ORDER.indexOf(activeStage);
  const stageMeta = STAGE_META[activeStage];
  const contentItems = MOCK_CONTENT_MAP[activeStage] ?? [];
  const activeContent = contentItems.find(c => c.id === activeContentId) ?? contentItems[0];
  const isArtifactStage = activeStage === 'express' || activeStage === 'empower';
  const currentArtifact = isArtifactStage
    ? artifactMap[activeModId]?.[activeStage === 'express' ? 'express' : 'empower']
    : undefined;

  /* ── Derived course stats ── */
  const completedMods = modules.filter(m => m.status === 'completed').length;
  const overallPct = Math.round(
    modules.reduce((a, m) => a + m.completion_percentage, 0) / modules.length
  );

  /* ── Enter viewer ── */
  const enterViewer = (modId: string, stage: StageKey) => {
    const mod = modules.find(m => m.id === modId);
    if (!mod) return;
    setActiveModId(modId);
    setActiveStage(stage);
    const items = MOCK_CONTENT_MAP[stage] ?? [];
    setActiveContentId(items[0]?.id ?? '');
    setViewerActive(true);
  };

  /* ── Mark stage in_progress (learner_6e_stage_progress insert) ── */
  const markStageVisited = (modId: string, stage: StageKey) => {
    setModules(prev =>
      prev.map(m => {
        if (m.id !== modId) return m;
        const stages = m.stages.map(s => {
          if (s.key !== stage) return s;
          if (s.status === 'not_started') return { ...s, status: 'in_progress' as StageStatus };
          return s;
        });
        // Recalculate completion_percentage
        const done = stages.filter(s => s.status === 'completed').length;
        const inp = stages.filter(s => s.status === 'in_progress').length;
        const pct = Math.round(((done + inp * 0.5) / 6) * 100);
        const modStatus: ModStatus =
          done === 6 ? 'completed' : inp > 0 || done > 0 ? 'in_progress' : 'available';
        return { ...m, stages, completion_percentage: pct, status: modStatus };
      })
    );
  };

  /* ── Complete stage (learner_6e_stage_progress update) ── */
  const completeStage = (modId: string, stage: StageKey) => {
    setModules(prev =>
      prev.map(m => {
        if (m.id !== modId) return m;
        const stages = m.stages.map(s => {
          if (s.key === stage) return { ...s, status: 'completed' as StageStatus };
          return s;
        });
        const done = stages.filter(s => s.status === 'completed').length;
        const inp = stages.filter(s => s.status === 'in_progress').length;
        const pct = Math.round(((done + inp * 0.5) / 6) * 100);
        const modStatus: ModStatus = done === 6 ? 'completed' : 'in_progress';
        return { ...m, stages, completion_percentage: pct, status: modStatus };
      })
    );
  };

  /* ── Handle artifact submission ── */
  const handleArtifactSubmit = (
    _modId: string,
    artifactId: string,
    text: string,
    mode: 'fast' | 'normal',
    url?: string
  ) => {
    setArtifactMap(prev => {
      const modArts = prev[activeModId] ?? {};
      const key = artifactId === modArts.express?.id ? 'express' : 'empower';
      const art = modArts[key];
      if (!art) return prev;
      const attemptNo = art.submissions.length + 1;
      const prevSubId = art.submissions.find(s => s.is_latest)?.id ?? null;
      const newSub: Submission = {
        id: `as-new-${Date.now()}`,
        attempt_no: attemptNo,
        version_label: `v${attemptNo}`,
        is_latest: true,
        previous_submission_id: prevSubId,
        submission_mode: mode,
        submission_text: text || null,
        submission_url: url || null,
        status: 'submitted',
        overall_status: 'in_progress',
        current_eval_stage: 'ai',
        submitted_at: new Date().toISOString(),
        sealed_at: new Date().toISOString(),
      };
      const updatedSubs = art.submissions.map(s => ({ ...s, is_latest: false })).concat(newSub);
      return {
        ...prev,
        [activeModId]: { ...modArts, [key]: { ...art, submissions: updatedSubs } },
      };
    });
    // Mark empower stage artifact_submitted
    if (activeStage === 'empower') {
      setModules(prev =>
        prev.map(m => (m.id === activeModId ? { ...m, artifact_submitted: true } : m))
      );
    }
  };

  /* ── Navigate stages ── */
  const goStage = (direction: 'prev' | 'next') => {
    const newIdx = direction === 'next' ? stageIdx + 1 : stageIdx - 1;
    if (newIdx < 0 || newIdx >= STAGES_ORDER.length) return;
    const newStage = STAGES_ORDER[newIdx];
    markStageVisited(activeModId, newStage);
    setActiveStage(newStage);
    const items = MOCK_CONTENT_MAP[newStage] ?? [];
    setActiveContentId(items[0]?.id ?? '');
  };

  /* ═════════════════════════════════════════════════
     COURSE OVERVIEW
     ═════════════════════════════════════════════════ */
  if (!viewerActive) {
    const activeProblem = problemArtifacts.find(a => a.id === activeProblemId)!;

    return (
      <div className="cd-overview">
        {/* ── Hero ── */}
        <div className="cd-hero">
          <div className="cd-hero-inner">
            <button className="cd-back" onClick={() => navigate('/courses')}>
              <ArrowLeft size={15} /> Back to Courses
            </button>

            <div className="cd-hero-layout">
              <div className="cd-hero-left">
                <div className="cd-hero-tags">
                  <span className="cd-hero-tag">Backend Engineering</span>
                  <span className="cd-hero-tag cd-hero-tag--level">Beginner</span>
                </div>
                <h1 className="cd-hero-title">
                  Debugging &amp; Observability
                  <br />
                  for Backend Systems
                </h1>
                <p className="cd-hero-desc">
                  Master production-grade debugging and observability using real-world incident
                  scenarios. Build from structured logging through full incident resolution.
                </p>
                <div className="cd-hero-meta">
                  <span>
                    <Clock size={13} /> 45 hours
                  </span>
                  <span>
                    <Layers size={13} /> 6 modules
                  </span>
                  <span>
                    <Target size={13} /> 6 artifacts
                  </span>
                  <span>
                    <Award size={13} /> Certificate
                  </span>
                </div>
                <div className="cd-hero-actions">
                  <button
                    className="cd-btn-primary"
                    onClick={() => enterViewer('mod-001', 'explain')}
                  >
                    Continue Learning <ChevronRight size={16} />
                  </button>
                  <button className="cd-btn-ghost">
                    <Share2 size={15} /> Share
                  </button>
                  <button className="cd-btn-icon-only">
                    <Bookmark size={15} />
                  </button>
                </div>
              </div>

              <div className="cd-hero-right">
                <div className="cd-progress-card">
                  <div className="cd-pc-header">
                    <span className="cd-pc-label">Overall Progress</span>
                    <span className="cd-pc-pct">{overallPct}%</span>
                  </div>
                  <div className="cd-pc-bar">
                    <div className="cd-pc-fill" style={{ width: `${overallPct}%` }} />
                  </div>
                  <div className="cd-pc-stats">
                    <div className="cd-pc-stat">
                      <strong>{completedMods}</strong>
                      <span>Done</span>
                    </div>
                    <div className="cd-pc-stat">
                      <strong>{modules.filter(m => m.status === 'in_progress').length}</strong>
                      <span>Active</span>
                    </div>
                    <div className="cd-pc-stat">
                      <strong>{modules.filter(m => m.status === 'available').length}</strong>
                      <span>Available</span>
                    </div>
                  </div>
                  <div className="cd-pc-next">
                    <span className="cd-pc-next-lbl">Next Up</span>
                    <span className="cd-pc-next-val">Module 1 · Explain Stage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Learning Path Selector ── */}
        <div className="cd-path-section">
          <div className="cd-path-section-inner">
            <div className="cd-path-header">
              <h2>Choose Your Learning Path</h2>
              <p>Both paths award the same certificate. Pick what works best for you.</p>
            </div>
            <div className="cd-path-cards">
              {/* Problem Track */}
              <button
                className={`cd-path-card${learningMode === 'problem' ? ' cd-path-card--active' : ''}`}
                onClick={() => setLearningMode(learningMode === 'problem' ? null : 'problem')}
              >
                <div className="cd-path-card-icon" style={{ background: '#eef2ff' }}>
                  <Target size={28} color="#6366f1" />
                </div>
                <div className="cd-path-card-content">
                  <span className="cd-path-card-badge">Recommended</span>
                  <h3>Problem Statement Track</h3>
                  <p>
                    Start with the real-world problem. Submit 6 progressive artifacts — no need to
                    follow every module step by step.
                  </p>
                  <div className="cd-path-card-meta">
                    <span>
                      <FolderOpen size={13} /> 6 Artifacts
                    </span>
                    <span>
                      <Zap size={13} /> Flexible pacing
                    </span>
                    <span>
                      <Award size={13} /> Certificate
                    </span>
                  </div>
                </div>
                {learningMode === 'problem' && (
                  <div className="cd-path-check">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </button>

              {/* Module Track */}
              <button
                className={`cd-path-card${learningMode === 'module' ? ' cd-path-card--active' : ''}`}
                onClick={() => setLearningMode(learningMode === 'module' ? null : 'module')}
              >
                <div className="cd-path-card-icon" style={{ background: '#f0fdf4' }}>
                  <BookOpen size={28} color="#10b981" />
                </div>
                <div className="cd-path-card-content">
                  <h3>Module-by-Module Track</h3>
                  <p>
                    Work through each module using the 6E framework — guided content, stage by stage
                    with full AI support.
                  </p>
                  <div className="cd-path-card-meta">
                    <span>
                      <BookOpen size={13} /> 6 Modules
                    </span>
                    <span>
                      <Microscope size={13} /> Guided 6E stages
                    </span>
                    <span>
                      <Award size={13} /> Certificate
                    </span>
                  </div>
                </div>
                {learningMode === 'module' && (
                  <div className="cd-path-check">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ════════════ PROBLEM TRACK ════════════ */}
        {learningMode === 'problem' && (
          <div className="cd-problem-track">
            {/* Course problem banner */}
            <div className="cd-prob-banner">
              <div className="cd-prob-banner-left">
                <div className="cd-prob-banner-tag">Course Problem Statement</div>
                <h3>Production backend service begins failing under load</h3>
                <p>
                  A production backend service fails under load and engineers must identify root
                  causes using logs, debugging tools and structured investigation. Complete 6
                  progressive artifacts to resolve this incident using a professional observability
                  workflow.
                </p>
              </div>
              <div className="cd-prob-prog-card">
                <div className="cd-prob-prog-num">
                  {
                    problemArtifacts.filter(
                      a => a.status === 'submitted' || a.status === 'approved'
                    ).length
                  }
                  <span>/{problemArtifacts.length}</span>
                </div>
                <div className="cd-prob-prog-lbl">Submitted</div>
                <div className="cd-prob-prog-bar">
                  <div
                    className="cd-prob-prog-fill"
                    style={{
                      width: `${(problemArtifacts.filter(a => a.status === 'submitted' || a.status === 'approved').length / problemArtifacts.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="cd-prob-layout">
              {/* Artifact list */}
              <div className="cd-prob-list">
                {problemArtifacts.map(a => {
                  return (
                    <button
                      key={a.id}
                      className={`cd-prob-item${a.id === activeProblemId ? ' active' : ''}  cd-prob-item--${a.status}`}
                      onClick={() => setActiveProblemId(a.id)}
                    >
                      <div className={`cd-prob-item-num cd-prob-num--${a.status}`}>
                        {a.status === 'submitted' || a.status === 'approved' ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          a.no
                        )}
                      </div>
                      <div className="cd-prob-item-info">
                        <span className="cd-prob-item-mod">{a.module}</span>
                        <span className="cd-prob-item-title">{a.title}</span>
                      </div>
                      {a.status === 'approved' && a.score > 0 && (
                        <span className="cd-prob-score">{a.score}%</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Editor */}
              <div className="cd-prob-editor">
                <div className="cd-prob-editor-header">
                  <div>
                    <span className="cd-prob-artifact-no">Artifact {activeProblem.no} of 6</span>
                    <h4 className="cd-prob-artifact-title">{activeProblem.title}</h4>
                    <p className="cd-prob-artifact-mod">{activeProblem.module}</p>
                  </div>
                  <span className={`cd-prob-status cd-prob-status--${activeProblem.status}`}>
                    {activeProblem.status === 'not_started'
                      ? 'Not Started'
                      : activeProblem.status === 'in_progress'
                        ? 'In Progress'
                        : activeProblem.status === 'approved'
                          ? '✓ Approved'
                          : '✓ Submitted'}
                  </span>
                </div>

                <div className="cd-prob-prompt">
                  <span className="cd-prob-prompt-tag">Your Task</span>
                  <p>{activeProblem.prompt}</p>
                  <p className="cd-prob-prompt-hint">
                    Provide a structured, professional response demonstrating understanding and
                    practical application.
                  </p>
                </div>

                {activeProblem.status !== 'submitted' && activeProblem.status !== 'approved' ? (
                  <>
                    <textarea
                      className="cd-prob-textarea"
                      placeholder={`Write your ${activeProblem.title} here…`}
                      value={activeProblem.text}
                      onChange={e =>
                        setProblemArtifacts(prev =>
                          prev.map(a =>
                            a.id === activeProblemId
                              ? {
                                  ...a,
                                  text: e.target.value,
                                  status: e.target.value ? 'in_progress' : 'not_started',
                                }
                              : a
                          )
                        )
                      }
                      rows={12}
                    />
                    <div className="cd-prob-editor-footer">
                      <button className="cd-btn-sm-ghost">
                        <Download size={13} /> Template
                      </button>
                      <button
                        className="cd-btn-sm-primary"
                        disabled={!activeProblem.text.trim()}
                        onClick={() =>
                          setProblemArtifacts(prev =>
                            prev.map(a =>
                              a.id === activeProblemId ? { ...a, status: 'submitted' } : a
                            )
                          )
                        }
                      >
                        <Send size={13} /> Submit Artifact
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="cd-prob-submitted">
                    <div className="cd-prob-submitted-icon">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <p className="cd-prob-submitted-title">Artifact Submitted</p>
                      <p className="cd-prob-submitted-sub">
                        Feedback will appear here once reviewed
                      </p>
                    </div>
                    {activeProblem.score > 0 && (
                      <span className="cd-prob-score" style={{ fontSize: '1.1rem' }}>
                        {activeProblem.score}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ MODULE TRACK ════════════ */}
        {learningMode === 'module' && (
          <div className="cd-module-track">
            <div className="cd-module-track-header">
              <h2>Course Modules</h2>
              <span>6 modules · 6E Problem-Based Learning Framework</span>
            </div>

            <div className="cd-module-list">
              {modules.map(mod => (
                <div key={mod.id} className={`cd-module-row cd-module-row--${mod.status}`}>
                  {/* Step indicator */}
                  <div className="cd-mod-step">
                    <div className={`cd-mod-step-circle cd-mod-step--${mod.status}`}>
                      {mod.status === 'completed' ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <span>{mod.module_no}</span>
                      )}
                    </div>
                    {mod.module_no < modules.length && (
                      <div
                        className={`cd-mod-step-line ${mod.status === 'completed' ? 'cd-mod-step-line--filled' : ''}`}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <div className="cd-mod-card">
                    {/* Top Bar with Status */}
                    <div className="cd-mod-top-bar">
                      <div className="cd-mod-meta-row">
                        <span className="cd-mod-workflow">{mod.engineering_workflow_stage}</span>
                        <span className="cd-mod-duration">
                          <Clock size={11} /> {mod.estimatedTime}
                        </span>
                      </div>
                      {mod.status === 'in_progress' && (
                        <div className="cd-mod-progress-indicator">
                          <div className="cd-mod-progress-bar">
                            <div 
                              className="cd-mod-progress-fill" 
                              style={{ width: `${mod.completion_percentage}%` }}
                            />
                          </div>
                          <span className="cd-mod-progress-text">{mod.completion_percentage}%</span>
                        </div>
                      )}
                      {mod.status === 'completed' && mod.score && (
                        <div className="cd-mod-score-pill">
                          <BarChart3 size={12} /> {mod.score}%
                        </div>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="cd-mod-main">
                      <h3 className="cd-mod-title">{mod.title}</h3>
                      <p className="cd-mod-description">{mod.description}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="cd-mod-details">
                      <div className="cd-mod-detail-item">
                        <span className="cd-mod-detail-icon">
                          <AlertCircle size={14} />
                        </span>
                        <div className="cd-mod-detail-content">
                          <span className="cd-mod-detail-label">Problem</span>
                          <span className="cd-mod-detail-text">{mod.module_specific_problem_statement}</span>
                        </div>
                      </div>

                      <div className="cd-mod-detail-item">
                        <span className="cd-mod-detail-icon">
                          <TrendingUp size={14} />
                        </span>
                        <div className="cd-mod-detail-content">
                          <span className="cd-mod-detail-label">Industry Challenge</span>
                          <span className="cd-mod-detail-text">{mod.pressure_points}</span>
                        </div>
                      </div>

                      <div className="cd-mod-detail-item">
                        <span className="cd-mod-detail-icon">
                          <Info size={14} />
                        </span>
                        <div className="cd-mod-detail-content">
                          <span className="cd-mod-detail-label">Common Confusion</span>
                          <span className="cd-mod-detail-text">{mod.student_confusion}</span>
                        </div>
                      </div>

                      <div className="cd-mod-detail-item">
                        <span className="cd-mod-detail-icon">
                          <GraduationCap size={14} />
                        </span>
                        <div className="cd-mod-detail-content">
                          <span className="cd-mod-detail-label">Prerequisites</span>
                          <span className="cd-mod-detail-text">{mod.knowledge.technical_concepts_learnt}</span>
                        </div>
                      </div>

                      <div className="cd-mod-detail-item cd-mod-detail-item--full">
                        <span className="cd-mod-detail-icon">
                          <BookOpen size={14} />
                        </span>
                        <div className="cd-mod-detail-content">
                          <span className="cd-mod-detail-label">What You'll Learn</span>
                          <span className="cd-mod-detail-text">{mod.learning_content.major_concepts}</span>
                        </div>
                      </div>

                      <div className="cd-mod-detail-item cd-mod-detail-item--full">
                        <span className="cd-mod-detail-icon">
                          <Target size={14} />
                        </span>
                        <div className="cd-mod-detail-content">
                          <span className="cd-mod-detail-label">When to Apply</span>
                          <span className="cd-mod-detail-text">{mod.learning_content.implementation_context_when_to_use}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stages Row */}
                    <div className="cd-mod-stages-row">
                      {mod.stages.map(stage => {
                        const stageMeta = STAGE_META[stage.key];
                        return (
                          <button
                            key={stage.key}
                            className={`cd-mod-stage-chip cd-mod-stage-chip--${stage.status}`}
                            onClick={() => enterViewer(mod.id, stage.key)}
                            title={stageMeta.description}
                          >
                            {stage.status === 'completed' ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              stageMeta.icon
                            )}
                            <span className="cd-mod-stage-name">{stageMeta.label}</span>
                            {stage.time_spent_seconds > 0 && (
                              <span className="cd-mod-stage-duration">{fmtTime(stage.time_spent_seconds)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action Footer */}
                    <div className="cd-mod-footer">
                      {mod.status === 'completed' && (
                        <button
                          className="cd-mod-btn cd-mod-btn--secondary"
                          onClick={() => enterViewer(mod.id, 'engage')}
                        >
                          Review Module
                        </button>
                      )}
                      {mod.status === 'in_progress' && (
                        <>
                          <button
                            className="cd-mod-btn cd-mod-btn--primary"
                            onClick={() => {
                              const next = mod.stages.find(
                                s => s.status === 'in_progress' || s.status === 'not_started'
                              );
                              enterViewer(mod.id, next?.key ?? 'engage');
                            }}
                          >
                            Continue Learning
                            <ChevronRight size={15} />
                          </button>
                          <button
                            className="cd-mod-btn cd-mod-btn--ghost"
                            onClick={() => enterViewer(mod.id, 'engage')}
                          >
                            View All Stages
                          </button>
                        </>
                      )}
                      {mod.status === 'available' && (
                        <button
                          className="cd-mod-btn cd-mod-btn--primary"
                          onClick={() => enterViewer(mod.id, 'engage')}
                        >
                          Start Module
                          <ChevronRight size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═════════════════════════════════════════════════
     3-PANEL STAGE VIEWER
     ═════════════════════════════════════════════════ */
  return (
    <div className="cd-viewer">
      {/* ── Top bar ── */}
      <div className="cd-viewer-topbar">
        <div className="cd-topbar-left">
          <button className="cd-topbar-back" onClick={() => setViewerActive(false)}>
            <ArrowLeft size={14} /> Overview
          </button>
          <span className="cd-topbar-sep">/</span>
          <span className="cd-topbar-mod">{activeMod?.title}</span>
          <span className="cd-topbar-sep">/</span>
          <span className="cd-topbar-stage" style={{ color: stageMeta.color }}>
            {stageMeta.icon} {stageMeta.label}
          </span>
        </div>
        <div className="cd-topbar-right">
          <button
            className={`cd-mobile-sidebar-toggle${mobileLeftVisible ? ' cd-mobile-sidebar-toggle--active' : ''}`}
            onClick={() => {
              setMobileLeftVisible(!mobileLeftVisible);
              setMobileRightVisible(false);
            }}
            title="Toggle modules"
          >
            <PanelLeftClose size={15} />
          </button>
          <button
            className={`cd-mobile-sidebar-toggle${mobileRightVisible ? ' cd-mobile-sidebar-toggle--active' : ''}`}
            onClick={() => {
              setMobileRightVisible(!mobileRightVisible);
              setMobileLeftVisible(false);
            }}
            title="Toggle content"
          >
            <PanelRightClose size={15} />
          </button>
          <button
            className="cd-topbar-btn"
            onClick={() => setLeftOpen(p => !p)}
            title="Toggle module list"
          >
            <PanelLeftClose size={15} />
          </button>
          <button
            className="cd-topbar-btn"
            onClick={() => setRightOpen(p => !p)}
            title="Toggle panel"
          >
            <PanelRightClose size={15} />
          </button>
          <button className="cd-topbar-btn">
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* ── 6E Stepper ── */}
      <div className="cd-stepper">
        {STAGES_ORDER.map((key, i) => {
          const s = activeMod.stages.find(st => st.key === key)!;
          const meta = STAGE_META[key];
          const isActive = key === activeStage;
          return (
            <React.Fragment key={key}>
              <button
                className={`cd-stepper-step${isActive ? ' cd-stepper-step--active' : ''}${s.status === 'completed' ? ' cd-stepper-step--done' : ''}`}
                style={
                  isActive
                    ? ({ borderBottomColor: meta.color, color: meta.color } as React.CSSProperties)
                    : {}
                }
                onClick={() => {
                  markStageVisited(activeModId, key);
                  setActiveStage(key);
                  const items = MOCK_CONTENT_MAP[key] ?? [];
                  setActiveContentId(items[0]?.id ?? '');
                }}
              >
                <span
                  className={`cd-stepper-icon-wrap${s.status === 'completed' ? '-done' : isActive ? '-active' : ''}`}
                >
                  {s.status === 'completed' ? <CheckCircle2 size={13} /> : meta.icon}
                </span>
                <span className="cd-stepper-label">{meta.label}</span>
                <span className="cd-stepper-tag">{meta.purposeTag}</span>
              </button>
              {i < STAGES_ORDER.length - 1 && (
                <div
                  className={`cd-stepper-connector${s.status === 'completed' ? ' cd-stepper-connector--done' : ''}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── 3 Panels ── */}
      <div className="cd-panels">
        {/* Mobile overlay backdrop */}
        {(mobileLeftVisible || mobileRightVisible) && (
          <div
            className="cd-mobile-overlay cd-mobile-overlay--visible"
            onClick={() => {
              setMobileLeftVisible(false);
              setMobileRightVisible(false);
            }}
          />
        )}

        {/* LEFT: Module Navigator */}
        <aside className={`cd-panel-left${leftExpanded ? ' cd-panel-left--expanded' : ''}${mobileLeftVisible ? ' cd-panel-left--visible' : ''}${!leftOpen ? ' cd-panel-left--hidden-desktop' : ''}`}>
            <div className="cd-panel-header">
              <span>Modules</span>
              <div className="cd-panel-header-actions">
                <button 
                  className="cd-panel-close" 
                  onClick={() => {
                    setLeftOpen(false);
                    setMobileLeftVisible(false);
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
            <div className="cd-mod-nav">
              {modules.map(mod => (
                <div
                  key={mod.id}
                  className={`cd-nav-mod${mod.id === activeModId ? ' cd-nav-mod--active' : ''} cd-nav-mod--${mod.status}`}
                  onClick={() => {
                    const first =
                      mod.stages.find(s => s.status === 'in_progress') ??
                      mod.stages.find(s => s.status !== 'not_started') ??
                      mod.stages[0];
                    enterViewer(mod.id, first.key);
                    setMobileLeftVisible(false);
                  }}
                >
                  <div className="cd-nav-mod-row">
                    <div className={`cd-nav-mod-dot cd-nav-mod-dot--${mod.status}`}>
                      {mod.status === 'completed' ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <span>{mod.module_no}</span>
                      )}
                    </div>
                    <div className="cd-nav-mod-info">
                      <span className="cd-nav-mod-title">{mod.title}</span>
                      <div className="cd-nav-mod-prog">
                        <div
                          className="cd-nav-mod-prog-fill"
                          style={{ width: `${mod.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="cd-nav-mod-pct">{mod.completion_percentage}%</span>
                  </div>

                  {mod.id === activeModId && (
                    <div className="cd-nav-stage-dots">
                      {mod.stages.map(st => (
                        <button
                          key={st.key}
                          className={`cd-nav-stage-dot cd-nav-stage-dot--${st.status}${st.key === activeStage ? ' cd-nav-stage-dot--cur' : ''}`}
                          style={
                            st.key === activeStage
                              ? ({ background: STAGE_META[st.key].color } as React.CSSProperties)
                              : {}
                          }
                          onClick={e => {
                            e.stopPropagation();
                            markStageVisited(activeModId, st.key);
                            setActiveStage(st.key);
                          }}
                          title={STAGE_META[st.key].label}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

        {/* CENTER: Content Viewer */}
        <main className="cd-panel-center">
          {/* Content tabs */}
          <div className="cd-content-tabs">
            {contentItems.map(item => (
              <button
                key={item.id}
                className={`cd-content-tab${activeContentId === item.id ? ' cd-content-tab--active' : ''}`}
                onClick={() => setActiveContentId(item.id)}
              >
                {contentIcon(item.content_type, 13)}
                <span className="cd-content-tab-title">{item.title}</span>
                {item.isViewed && <div className="cd-viewed-dot" />}
                {item.duration_seconds && (
                  <span className="cd-content-tab-dur">{fmtDuration(item.duration_seconds)}</span>
                )}
              </button>
            ))}
          </div>

          {/* Viewer area */}
          <div className="cd-content-viewer">
            <div className="cd-content-viewer-header">
              <div>
                <h3 className="cd-content-title">{activeContent?.title}</h3>
                <div className="cd-content-meta">
                  <span style={{ color: stageMeta.color }}>{stageMeta.icon}</span>
                  {stageMeta.label} · {activeContent?.content_type?.toUpperCase()}
                  {activeContent?.duration_seconds &&
                    ` · ${fmtDuration(activeContent.duration_seconds)}`}
                </div>
              </div>
              <div className="cd-content-acts">
                <button className="cd-topbar-btn">
                  <Download size={14} />
                </button>
                <button className="cd-topbar-btn">
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            <div className="cd-content-body">
              {(!activeContent || activeContent.content_type === 'video') && (
                <div className="cd-video-ph">
                  <PlayCircle size={56} className="cd-video-play" />
                  <p>{activeContent?.title}</p>
                </div>
              )}
              {activeContent?.content_type === 'pdf' && (
                <div className="cd-doc-ph">
                  <FileText size={44} />
                  <p>{activeContent.title}</p>
                  <button className="cd-btn-sm-outline">
                    <Download size={12} /> Download PDF
                  </button>
                </div>
              )}
              {(activeContent?.content_type === 'slide' ||
                activeContent?.content_type === 'image') && (
                <div className="cd-doc-ph">
                  <Layers size={44} />
                  <p>{activeContent.title}</p>
                </div>
              )}
              {activeContent?.content_type === 'doc' && (
                <div className="cd-doc-ph">
                  <FileText size={44} />
                  <p>{activeContent.title}</p>
                </div>
              )}
              {activeContent?.content_type === 'text' && (
                <div className="cd-text-ph">
                  <p>Reflection content for {stageMeta.label} stage</p>
                </div>
              )}
            </div>

            {/* Stage context */}
            <div
              className="cd-stage-ctx"
              style={{ borderColor: `${stageMeta.color}30` } as React.CSSProperties}
            >
              <span
                className="cd-stage-ctx-badge"
                style={
                  {
                    background: `${stageMeta.color}15`,
                    color: stageMeta.color,
                  } as React.CSSProperties
                }
              >
                {stageMeta.icon} {stageMeta.label}
              </span>
              <p className="cd-stage-ctx-desc">{stageMeta.description}</p>
              <span className="cd-stage-ctx-purpose">{stageMeta.purposeTag}</span>
            </div>
          </div>

          {/* Footer nav */}
          <div className="cd-content-footer">
            <button
              className="cd-btn-nav"
              disabled={stageIdx === 0}
              onClick={() => goStage('prev')}
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <div className="cd-footer-dots">
              {STAGES_ORDER.map((k, i) => (
                <div
                  key={k}
                  className={`cd-footer-dot${i === stageIdx ? ' cd-footer-dot--active' : activeMod.stages[i]?.status === 'completed' ? ' cd-footer-dot--done' : ''}`}
                />
              ))}
            </div>
            {stageIdx < STAGES_ORDER.length - 1 ? (
              <button
                className="cd-btn-primary-sm"
                onClick={() => {
                  completeStage(activeModId, activeStage);
                  goStage('next');
                }}
              >
                Mark Done & Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                className="cd-btn-primary-sm"
                onClick={() => completeStage(activeModId, activeStage)}
              >
                <CheckCircle2 size={15} /> Complete Module
              </button>
            )}
          </div>
        </main>

        {/* RIGHT: Artifact + Info Panel */}
        <aside className={`cd-panel-right${rightExpanded ? ' cd-panel-right--expanded' : ''}${mobileRightVisible ? ' cd-panel-right--visible' : ''}${!rightOpen ? ' cd-panel-right--hidden-desktop' : ''}`}>
            <div className="cd-panel-header">
              <span>
                {isArtifactStage
                  ? activeStage === 'express'
                    ? 'Practice Artifact'
                    : 'Final Artifact'
                  : 'Stage Info'}
              </span>
              <div className="cd-panel-header-actions">
                <button
                  className="cd-panel-expand"
                  onClick={() => setRightExpanded(!rightExpanded)}
                  title={rightExpanded ? 'Collapse panel' : 'Expand panel'}
                >
                  {rightExpanded ? <Maximize2 size={13} /> : <Maximize2 size={13} />}
                </button>
                <button 
                  className="cd-panel-close" 
                  onClick={() => {
                    setRightOpen(false);
                    setMobileRightVisible(false);
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="cd-panel-body">
              {isArtifactStage && currentArtifact ? (
                <ArtifactPanel
                  artifact={currentArtifact}
                  moduleId={activeModId}
                  onSubmit={handleArtifactSubmit}
                />
              ) : (
                <>
                  {/* Stage Overview */}
                  <div className="cd-stage-info">
                    <h4 style={{ color: stageMeta.color }}>{stageMeta.label} Stage</h4>
                    <p>{stageMeta.description}</p>
                    <div className="cd-stage-info-row">
                      <Clock size={13} /> Est. 20–30 minutes
                    </div>
                    <div className="cd-stage-info-row">
                      <Target size={13} /> {contentItems.length} content items
                    </div>
                    <div className="cd-stage-info-row">
                      <GraduationCap size={13} />
                      {STAGE_META[activeStage].purposeTag}
                    </div>
                  </div>

                  {/* Curriculum Reference - What you need to know */}
                  <div className="cd-curriculum-ref-card">
                    <div className="cd-curriculum-ref-header">
                      <BookOpen size={16} className="cd-curriculum-ref-icon" />
                      <h5>Curriculum Reference</h5>
                    </div>

                    <div className="cd-curriculum-ref-section">
                      <div className="cd-curriculum-ref-label">
                        <GraduationCap size={12} />
                        <span>Prerequisites</span>
                      </div>
                      <p className="cd-curriculum-ref-text">
                        {activeMod.knowledge.academic_refresher_concepts}
                      </p>
                    </div>

                    <div className="cd-curriculum-ref-section">
                      <div className="cd-curriculum-ref-label">
                        <Code2 size={12} />
                        <span>Technical Concepts</span>
                      </div>
                      <p className="cd-curriculum-ref-text">
                        {activeMod.knowledge.technical_concepts_learnt}
                      </p>
                    </div>

                    <div className="cd-curriculum-ref-section">
                      <div className="cd-curriculum-ref-label">
                        <Layers size={12} />
                        <span>Engineering Context</span>
                      </div>
                      <p className="cd-curriculum-ref-text">
                        {activeMod.engineering_workflow_stage}
                      </p>
                    </div>

                    <div className="cd-curriculum-ref-section">
                      <div className="cd-curriculum-ref-label">
                        <Lightbulb size={12} />
                        <span>When to Use</span>
                      </div>
                      <p className="cd-curriculum-ref-text">
                        {activeMod.learning_content.implementation_context_when_to_use}
                      </p>
                    </div>

                    <div className="cd-curriculum-ref-section">
                      <div className="cd-curriculum-ref-label">
                        <ChevronRight size={12} />
                        <span>Module Continuity</span>
                      </div>
                      <p className="cd-curriculum-ref-text">
                        {activeMod.support.module_continuity_link}
                      </p>
                    </div>
                  </div>

                  {/* Module Context - The problem you're solving */}
                  <div className="cd-mod-context-card">
                    <h5>Module Context</h5>
                    <p className="cd-mod-context-problem">
                      {activeMod.module_specific_problem_statement}
                    </p>
                    <div className="cd-mod-context-concepts">
                      <span>Concepts: </span>
                      {activeMod.learning_content.major_concepts}
                    </div>
                  </div>

                  {/* AI Support */}
                  <div className="cd-ask-ai-card">
                    <MessageSquare size={15} className="cd-ai-icon" />
                    <div>
                      <div className="cd-ai-title">Ask AI Tutor</div>
                      <div className="cd-ai-sub">Get help with this stage</div>
                    </div>
                    <button className="cd-btn-sm-outline">Ask</button>
                  </div>
                </>
              )}
            </div>
          </aside>
      </div>
    </div>
  );
}
