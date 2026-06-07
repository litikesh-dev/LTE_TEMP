import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  FlaskConical,
  GraduationCap,
  Link,
  Paperclip,
  Trophy,
} from 'lucide-react';
import '../../../pages/course-details/ui/course-details.css';
import { loadCourseContent, loadStageMeta } from '@/shared/api/configLoader';

/* ── re-use all types / mock data from course-details ── */
type StageKey = 'engage' | 'explore' | 'explain' | 'express' | 'empower' | 'evolve';
type StageStatus = 'completed' | 'in_progress' | 'not_started';
type ModStatus = 'completed' | 'in_progress' | 'available';
type ArtifactType = 'practice' | 'final';

interface StageProg { key: StageKey; status: StageStatus; time_spent_seconds: number; }

interface ModuleProg {
  id: string; module_no: number; title: string; description: string;
  engineering_workflow_stage: string; module_specific_problem_statement: string;
  pressure_points: string; student_confusion: string;
  learning_content: { major_concepts: string; implementation_context_when_to_use: string; reason_behind_concept: string; };
  support: { ai_support_tips: string; module_continuity_link: string; };
  knowledge: { technical_concepts_learnt: string; academic_refresher_concepts: string; };
  tools: { tools_used: string; tool_type_free_or_paid: string | null; };
  status: ModStatus; completion_percentage: number; artifact_submitted: boolean;
  estimatedTime: string; score?: number; stages: StageProg[];
}

type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'evaluated' | 'returned_for_rework' | 'approved' | 'rejected';

interface Submission {
  id: string; attempt_no: number; version_label: string; is_latest: boolean;
  previous_submission_id: string | null; submission_mode: 'fast' | 'normal';
  submission_text: string | null; submission_url: string | null; status: SubmissionStatus;
  ai_score?: number; ai_feedback?: string; ai_improvements?: string;
  staff_score?: number; staff_feedback?: string; industry_score?: number; industry_feedback?: string;
  overall_status: 'initiated' | 'in_progress' | 'completed' | 'returned_for_rework' | 'approved' | 'rejected';
  current_eval_stage?: 'ai' | 'staff' | 'industry';
  rubric?: { criterion: string; score: number; max: number }[];
  submitted_at: string; sealed_at: string | null;
}

interface ArtifactQuestion {
  id: string; order: number; title: string; description: string; instructions: string;
  submission_required: boolean; expected_submission_type?: 'text' | 'file' | 'url' | 'code';
  accepted_file_types?: string[];
}

interface ArtifactTemplate {
  id: string; artifact_id: string; question_id: string | null; file_name: string;
  file_url: string; file_type: string; version: number; is_downloadable: boolean;
}

interface ModuleArtifact {
  id: string; artifact_type: ArtifactType; total_score: number; passing_score: number | null;
  allow_resubmission: boolean; require_review_unlock: boolean; max_attempts: number | null;
  questions: ArtifactQuestion[]; submissions: Submission[]; templates: ArtifactTemplate[];
}

interface ContentItem {
  id: string; title: string; content_type: 'video' | 'pdf' | 'slide' | 'doc' | 'image' | 'text' | 'link';
  duration_seconds?: number; url: string; status: 'published'; isViewed: boolean;
}

/* ── Stage meta — icons live in code; label/description/purposeTag/color/estLabel
   are merged from the common JSON (mockDataConfig.json → stageMeta) so they're editable
   from one place. ── */
const STAGE_META: Record<StageKey, { label: string; color: string; icon: React.ReactNode; description: string; purposeTag: string; estLabel: string; }> = {
  engage:  { label: 'Engage',  color: '#6366f1', icon: <Lightbulb size={14} />,    description: 'Hook into the real-world problem. Understand the context and stakes.', purposeTag: 'Hook & Context',    estLabel: '20–30 minutes' },
  explore: { label: 'Explore', color: '#8b5cf6', icon: <FlaskConical size={14} />, description: 'Investigate, gather signals, and form initial hypotheses.',              purposeTag: 'Investigate',       estLabel: '20–30 minutes' },
  explain: { label: 'Explain', color: '#0ea5e9', icon: <Layers size={14} />,       description: 'Understand the core concepts and principles behind the solution.',       purposeTag: 'Learn Concepts',    estLabel: '20–30 minutes' },
  express: { label: 'Express', color: '#f59e0b', icon: <Code2 size={14} />,        description: 'Apply knowledge — draft your practice artifact.',                        purposeTag: 'Practice Artifact', estLabel: '20–30 minutes' },
  empower: { label: 'Empower', color: '#10b981', icon: <Zap size={14} />,          description: 'Build and submit your final evaluated artifact.',                        purposeTag: 'Final Artifact',    estLabel: '20–30 minutes' },
  evolve:  { label: 'Evolve',  color: '#ec4899', icon: <TrendingUp size={14} />,   description: 'Reflect on feedback. Advance your understanding beyond basics.',         purposeTag: 'Reflect & Grow',    estLabel: '20–30 minutes' },
};

const STAGES_ORDER: StageKey[] = ['engage', 'explore', 'explain', 'express', 'empower', 'evolve'];

/* Override the framework defaults with any stage meta defined in the common JSON. */
{
  const cfg = loadStageMeta() as Record<string, Partial<{ label: string; color: string; description: string; purposeTag: string; estLabel: string }>>;
  STAGES_ORDER.forEach(k => {
    const c = cfg[k];
    if (c) {
      if (c.label) STAGE_META[k].label = c.label;
      if (c.color) STAGE_META[k].color = c.color;
      if (c.description) STAGE_META[k].description = c.description;
      if (c.purposeTag) STAGE_META[k].purposeTag = c.purposeTag;
      if (c.estLabel) STAGE_META[k].estLabel = c.estLabel;
    }
  });
}

/* ── Mock data (same as CourseDetails) ── */
const MOCK_CONTENT_MAP: Record<string, ContentItem[]> = {
  engage:  [{ id: 'c1', title: 'Incident Kickoff: API Latency Spike', content_type: 'video', duration_seconds: 540, url: '#', status: 'published', isViewed: true }, { id: 'c2', title: 'Failure Investigation Worksheet', content_type: 'pdf', url: '#', status: 'published', isViewed: true }],
  explore: [{ id: 'c3', title: 'Structured Log Analysis Guide', content_type: 'pdf', url: '#', status: 'published', isViewed: true }, { id: 'c4', title: 'Service Architecture Diagram', content_type: 'image', url: '#', status: 'published', isViewed: false }, { id: 'c5', title: 'Reading Trace IDs in Distributed Systems', content_type: 'video', duration_seconds: 780, url: '#', status: 'published', isViewed: false }],
  explain: [{ id: 'c6', title: 'System Architecture Overview', content_type: 'slide', url: '#', status: 'published', isViewed: true }, { id: 'c7', title: 'Request Lifecycle Deep Dive', content_type: 'video', duration_seconds: 960, url: '#', status: 'published', isViewed: true }],
  express: [{ id: 'c8', title: 'Practice: Draft Logging Schema', content_type: 'doc', url: '#', status: 'published', isViewed: false }],
  empower: [{ id: 'c9', title: 'Final: Incident Investigation Report', content_type: 'doc', url: '#', status: 'published', isViewed: false }],
  evolve:  [{ id: 'c10', title: 'Reflection Prompts & Next Steps', content_type: 'text', url: '#', status: 'published', isViewed: false }],
};


const ARTIFACT_MAP: Record<string, { express?: ModuleArtifact; empower?: ModuleArtifact }> = {
  'mod-001': {
    express: {
      id: 'ma-001-e', artifact_type: 'practice', total_score: 0, passing_score: null,
      allow_resubmission: true, require_review_unlock: false, max_attempts: null,
      questions: [
        { id: 'aq-001', order: 1, title: 'Failure Investigation Map', description: 'Create a first-pass incident map showing service boundaries and symptom points.', instructions: '1) Read incident context. 2) Draw request flow. 3) Mark weak signals.', submission_required: false, expected_submission_type: 'text' },
        { id: 'aq-002', order: 2, title: 'Hypothesis List', description: 'List at least 3 root-cause hypotheses based on your investigation map.', instructions: '1) Review your map. 2) List hypotheses. 3) Rank by likelihood.', submission_required: false, expected_submission_type: 'text' },
      ],
      submissions: [], templates: [],
    },
    empower: {
      id: 'ma-001-f', artifact_type: 'final', total_score: 100, passing_score: 70,
      allow_resubmission: true, require_review_unlock: true, max_attempts: 3,
      questions: [
        { id: 'aq-003', order: 1, title: 'Evidence Mapping Spreadsheet', description: 'Download the Excel template and map log/trace evidence to each root-cause hypothesis.', instructions: '1) Download evidence-mapping-template.xlsx. 2) Fill in log entries. 3) Map to hypotheses. 4) Upload completed file.', submission_required: true, expected_submission_type: 'file', accepted_file_types: ['.xlsx', '.xls'] },
        { id: 'aq-004', order: 2, title: 'Root Cause Analysis Code', description: 'Write Python code to analyze the log patterns and identify the root cause.', instructions: '1) Use the provided log data. 2) Write analysis script. 3) Submit your code.', submission_required: true, expected_submission_type: 'code', accepted_file_types: ['.py'] },
        { id: 'aq-005', order: 3, title: 'GitHub Repository Link', description: 'Create a GitHub repository with your complete investigation.', instructions: '1) Create GitHub repo. 2) Push all files. 3) Submit repository URL.', submission_required: true, expected_submission_type: 'url' },
      ],
      submissions: [
        { id: 'as-001', attempt_no: 1, version_label: 'v1', is_latest: false, previous_submission_id: null, submission_mode: 'normal', submission_text: 'Root cause likely originates from unbounded DB retries under high load.', submission_url: null, status: 'returned_for_rework', overall_status: 'returned_for_rework', ai_score: 62, ai_feedback: 'Clear incident context. Add stronger evidence correlation.', ai_improvements: 'Strengthen evidence chain with trace IDs.', staff_score: 58, staff_feedback: 'Strong framing. Improve hypothesis prioritization and add trace correlation.', current_eval_stage: 'staff', rubric: [{ criterion: 'Evidence Quality', score: 2, max: 4 }, { criterion: 'Hypothesis Prioritization', score: 1, max: 4 }, { criterion: 'Trace Correlation', score: 1, max: 4 }, { criterion: 'Report Clarity', score: 2, max: 4 }], submitted_at: '2024-01-21T10:15:00Z', sealed_at: '2024-01-21T10:15:00Z' },
        { id: 'as-002', attempt_no: 2, version_label: 'v2', is_latest: true, previous_submission_id: 'as-001', submission_mode: 'fast', submission_text: 'Updated report includes trace-to-service mapping and ranked hypotheses with confidence scores.', submission_url: null, status: 'approved', overall_status: 'approved', ai_score: 88, ai_feedback: 'Excellent trace correlation and structured hypotheses.', ai_improvements: 'Minor: could expand on remediation timeline.', staff_score: 90, staff_feedback: 'Strong investigation methodology. Well-ranked hypotheses with solid evidence.', current_eval_stage: 'staff', rubric: [{ criterion: 'Evidence Quality', score: 4, max: 4 }, { criterion: 'Hypothesis Prioritization', score: 4, max: 4 }, { criterion: 'Trace Correlation', score: 3, max: 4 }, { criterion: 'Report Clarity', score: 3, max: 4 }], submitted_at: '2024-01-22T09:20:00Z', sealed_at: '2024-01-22T09:20:00Z' },
      ],
      templates: [{ id: 'at-001', artifact_id: 'ma-001-f', question_id: 'aq-003', file_name: 'evidence-mapping-template.xlsx', file_url: 'https://content.rareminds.dev/templates/mod-001/evidence-mapping-template.xlsx', file_type: 'excel', version: 1, is_downloadable: true }],
    },
  },
  'mod-002': {
    express: {
      id: 'ma-002-e', artifact_type: 'practice', total_score: 0, passing_score: null,
      allow_resubmission: true, require_review_unlock: false, max_attempts: null,
      questions: [
        { id: 'aq-201', order: 1, title: 'Log Schema Draft', description: 'Design a structured log schema for a backend service with appropriate fields and severity levels.', instructions: '1) Identify key log fields. 2) Define severity levels. 3) Add correlation ID strategy.', submission_required: false, expected_submission_type: 'text' },
        { id: 'aq-202', order: 2, title: 'Log Level Mapping', description: 'Map common application events to appropriate log levels (DEBUG, INFO, WARN, ERROR, FATAL).', instructions: '1) List 10 application events. 2) Assign log levels. 3) Justify each choice.', submission_required: false, expected_submission_type: 'text' },
      ],
      submissions: [], templates: [],
    },
    empower: {
      id: 'ma-002-f', artifact_type: 'final', total_score: 100, passing_score: 70,
      allow_resubmission: true, require_review_unlock: true, max_attempts: 3,
      questions: [
        { id: 'aq-203', order: 1, title: 'Structured Logging Implementation', description: 'Implement structured logging in a Python service using the provided starter code.', instructions: '1) Download starter code. 2) Add structured logging. 3) Include correlation IDs. 4) Submit your code.', submission_required: true, expected_submission_type: 'code', accepted_file_types: ['.py'] },
        { id: 'aq-204', order: 2, title: 'Log Analysis Report', description: 'Analyze the provided log samples and write a report identifying patterns and anomalies.', instructions: '1) Review log samples. 2) Identify patterns. 3) Document anomalies. 4) Submit your report.', submission_required: true, expected_submission_type: 'text' },
        { id: 'aq-205', order: 3, title: 'GitHub Repository', description: 'Push your logging implementation to a GitHub repository.', instructions: '1) Create repo. 2) Push implementation. 3) Submit URL.', submission_required: true, expected_submission_type: 'url' },
      ],
      submissions: [],
      templates: [{ id: 'at-002', artifact_id: 'ma-002-f', question_id: 'aq-203', file_name: 'logging-starter.py', file_url: 'https://content.rareminds.dev/templates/mod-002/logging-starter.py', file_type: 'text', version: 1, is_downloadable: true }],
    },
  },
  'mod-003': {
    express: {
      id: 'ma-003-e', artifact_type: 'practice', total_score: 0, passing_score: null,
      allow_resubmission: true, require_review_unlock: false, max_attempts: null,
      questions: [
        { id: 'aq-301', order: 1, title: 'Breakpoint Strategy', description: 'Plan a breakpoint strategy for debugging the provided failing service.', instructions: '1) Review the service code. 2) Identify critical breakpoint locations. 3) Explain what you expect to observe at each.', submission_required: false, expected_submission_type: 'text' },
        { id: 'aq-302', order: 2, title: 'Stack Trace Analysis', description: 'Analyze the provided stack trace and identify the root cause.', instructions: '1) Read the stack trace. 2) Identify the failure point. 3) Describe the call chain leading to the error.', submission_required: false, expected_submission_type: 'text' },
      ],
      submissions: [], templates: [],
    },
    empower: {
      id: 'ma-003-f', artifact_type: 'final', total_score: 100, passing_score: 70,
      allow_resubmission: true, require_review_unlock: true, max_attempts: 3,
      questions: [
        { id: 'aq-303', order: 1, title: 'Debug Session Recording', description: 'Record a debug session walkthrough using VS Code debugger on the provided buggy service.', instructions: '1) Set up the debugger. 2) Step through the failure. 3) Document findings. 4) Submit your report.', submission_required: true, expected_submission_type: 'text' },
        { id: 'aq-304', order: 2, title: 'Fixed Code Submission', description: 'Submit the fixed version of the buggy service with comments explaining each fix.', instructions: '1) Fix the identified bugs. 2) Add inline comments. 3) Submit your code.', submission_required: true, expected_submission_type: 'code', accepted_file_types: ['.py', '.js', '.ts'] },
        { id: 'aq-305', order: 3, title: 'GitHub Repository', description: 'Push your fixed code and debug notes to a GitHub repository.', instructions: '1) Create repo. 2) Push fixed code. 3) Submit URL.', submission_required: true, expected_submission_type: 'url' },
      ],
      submissions: [],
      templates: [{ id: 'at-003', artifact_id: 'ma-003-f', question_id: 'aq-303', file_name: 'buggy-service.py', file_url: 'https://content.rareminds.dev/templates/mod-003/buggy-service.py', file_type: 'text', version: 1, is_downloadable: true }],
    },
  },
  'mod-004': {
    express: {
      id: 'ma-004-e', artifact_type: 'practice', total_score: 0, passing_score: null,
      allow_resubmission: true, require_review_unlock: false, max_attempts: null,
      questions: [
        { id: 'aq-401', order: 1, title: 'Reproduction Conditions', description: 'List the exact conditions required to reproduce the intermittent bug described in the scenario.', instructions: '1) Read the bug report. 2) Identify environmental factors. 3) List reproduction steps.', submission_required: false, expected_submission_type: 'text' },
        { id: 'aq-402', order: 2, title: 'Test Case Design', description: 'Design a minimal test case that reliably triggers the bug.', instructions: '1) Define inputs. 2) Define expected vs actual output. 3) Write pseudocode for the test.', submission_required: false, expected_submission_type: 'text' },
      ],
      submissions: [], templates: [],
    },
    empower: {
      id: 'ma-004-f', artifact_type: 'final', total_score: 100, passing_score: 70,
      allow_resubmission: true, require_review_unlock: true, max_attempts: 3,
      questions: [
        { id: 'aq-403', order: 1, title: 'Reproduction Plan Document', description: 'Write a formal reproduction plan document for the intermittent production bug.', instructions: '1) Document environment setup. 2) List exact reproduction steps. 3) Define success criteria.', submission_required: true, expected_submission_type: 'text' },
        { id: 'aq-404', order: 2, title: 'Automated Test Suite', description: 'Write automated tests that reliably reproduce and verify the fix for the bug.', instructions: '1) Write test cases. 2) Ensure tests fail before fix. 3) Ensure tests pass after fix. 4) Submit code.', submission_required: true, expected_submission_type: 'code', accepted_file_types: ['.py', '.js', '.ts'] },
        { id: 'aq-405', order: 3, title: 'GitHub Repository', description: 'Push your reproduction tests and documentation to GitHub.', instructions: '1) Create repo. 2) Push tests and docs. 3) Submit URL.', submission_required: true, expected_submission_type: 'url' },
      ],
      submissions: [],
      templates: [{ id: 'at-004b', artifact_id: 'ma-004-f', question_id: 'aq-403', file_name: 'reproduction-plan-template.docx', file_url: 'https://content.rareminds.dev/templates/mod-004/reproduction-plan-template.docx', file_type: 'doc', version: 1, is_downloadable: true }],
    },
  },
  'mod-005': {
    express: {
      id: 'ma-005-e', artifact_type: 'practice', total_score: 0, passing_score: null,
      allow_resubmission: true, require_review_unlock: false, max_attempts: null,
      questions: [
        { id: 'aq-501', order: 1, title: '5 Whys Analysis', description: 'Apply the 5 Whys technique to the provided production incident to identify the root cause.', instructions: '1) Start with the symptom. 2) Ask "why" 5 times. 3) Document each answer.', submission_required: false, expected_submission_type: 'text' },
        { id: 'aq-502', order: 2, title: 'Fishbone Diagram', description: 'Create a fishbone (Ishikawa) diagram mapping all contributing factors to the incident.', instructions: '1) Identify the problem. 2) Map categories (People, Process, Technology). 3) List contributing factors.', submission_required: false, expected_submission_type: 'text' },
      ],
      submissions: [], templates: [],
    },
    empower: {
      id: 'ma-005-f', artifact_type: 'final', total_score: 100, passing_score: 70,
      allow_resubmission: true, require_review_unlock: true, max_attempts: 3,
      questions: [
        { id: 'aq-503', order: 1, title: 'RCA Report', description: 'Write a complete Root Cause Analysis report for the production incident using the provided template.', instructions: '1) Download RCA template. 2) Fill in all sections. 3) Include evidence and timeline. 4) Upload completed report.', submission_required: true, expected_submission_type: 'file', accepted_file_types: ['.pdf', '.docx'] },
        { id: 'aq-504', order: 2, title: 'Corrective Action Plan', description: 'Define corrective and preventive actions to prevent recurrence.', instructions: '1) List immediate fixes. 2) Define long-term preventive measures. 3) Assign owners and timelines.', submission_required: true, expected_submission_type: 'text' },
        { id: 'aq-505', order: 3, title: 'GitHub Repository', description: 'Push your RCA documentation and any supporting code to GitHub.', instructions: '1) Create repo. 2) Push all artifacts. 3) Submit URL.', submission_required: true, expected_submission_type: 'url' },
      ],
      submissions: [],
      templates: [{ id: 'at-005', artifact_id: 'ma-005-f', question_id: 'aq-503', file_name: 'rca-report-template.docx', file_url: 'https://content.rareminds.dev/templates/mod-005/rca-report-template.docx', file_type: 'doc', version: 1, is_downloadable: true }],
    },
  },
  'mod-006': {
    express: {
      id: 'ma-006-e', artifact_type: 'practice', total_score: 0, passing_score: null,
      allow_resubmission: true, require_review_unlock: false, max_attempts: null,
      questions: [
        { id: 'aq-601', order: 1, title: 'Incident Response Checklist', description: 'Draft an incident response checklist covering all phases: detection, investigation, resolution, and communication.', instructions: '1) List detection signals. 2) Define investigation steps. 3) Outline resolution process. 4) Plan stakeholder communication.', submission_required: false, expected_submission_type: 'text' },
        { id: 'aq-602', order: 2, title: 'Observability Stack Design', description: 'Design an observability stack (logs, metrics, traces) for the capstone scenario service.', instructions: '1) Choose tools for each pillar. 2) Define what to instrument. 3) Describe alert thresholds.', submission_required: false, expected_submission_type: 'text' },
      ],
      submissions: [], templates: [],
    },
    empower: {
      id: 'ma-006-f', artifact_type: 'final', total_score: 100, passing_score: 75,
      allow_resubmission: true, require_review_unlock: true, max_attempts: 3,
      questions: [
        { id: 'aq-603', order: 1, title: 'Full Incident Report', description: 'Write a complete incident report covering investigation, root cause, resolution, and post-mortem.', instructions: '1) Download incident report template. 2) Complete all sections. 3) Include logs, traces, and evidence. 4) Upload completed report.', submission_required: true, expected_submission_type: 'file', accepted_file_types: ['.pdf', '.docx'] },
        { id: 'aq-604', order: 2, title: 'Observability Implementation', description: 'Implement the observability stack you designed — add logging, metrics, and tracing to the capstone service.', instructions: '1) Instrument the service. 2) Add structured logs. 3) Add metrics. 4) Submit your code.', submission_required: true, expected_submission_type: 'code', accepted_file_types: ['.py', '.js', '.ts'] },
        { id: 'aq-605', order: 3, title: 'GitHub Repository', description: 'Push your complete capstone project — code, reports, and documentation — to GitHub.', instructions: '1) Create repo. 2) Push all deliverables. 3) Submit URL.', submission_required: true, expected_submission_type: 'url' },
      ],
      submissions: [],
      templates: [
        { id: 'at-006a', artifact_id: 'ma-006-f', question_id: 'aq-603', file_name: 'incident-report-template.docx', file_url: 'https://content.rareminds.dev/templates/mod-006/incident-report-template.docx', file_type: 'doc', version: 1, is_downloadable: true },
        { id: 'at-006b', artifact_id: 'ma-006-f', question_id: 'aq-604', file_name: 'capstone-starter.py', file_url: 'https://content.rareminds.dev/templates/mod-006/capstone-starter.py', file_type: 'text', version: 1, is_downloadable: true },
      ],
    },
  },
};

const MOCK_MODULES: ModuleProg[] = [
  { id: 'mod-001', module_no: 1, title: 'System Failure Investigation', description: 'Learn how to investigate and debug system failures in production environments.', engineering_workflow_stage: 'System Investigation', module_specific_problem_statement: 'Production API latency increases during peak traffic.', pressure_points: 'Engineers rely on print statements and cannot locate failure source.', student_confusion: 'How backend systems fail under load.', learning_content: { major_concepts: 'System architecture, request lifecycle, observability overview', implementation_context_when_to_use: 'Understanding system interactions before debugging', reason_behind_concept: 'Logs investigation' }, support: { ai_support_tips: 'Foundation for logging module', module_continuity_link: 'Output becomes input baseline for Module 2 structured logging.' }, knowledge: { technical_concepts_learnt: 'Operating systems basics', academic_refresher_concepts: 'Logs dashboards' }, tools: { tools_used: 'Free', tool_type_free_or_paid: null }, status: 'in_progress', completion_percentage: 33, artifact_submitted: false, estimatedTime: '2.5 hrs', stages: [{ key: 'engage', status: 'completed', time_spent_seconds: 3600 }, { key: 'explore', status: 'completed', time_spent_seconds: 2700 }, { key: 'explain', status: 'in_progress', time_spent_seconds: 1200 }, { key: 'express', status: 'not_started', time_spent_seconds: 0 }, { key: 'empower', status: 'not_started', time_spent_seconds: 0 }, { key: 'evolve', status: 'not_started', time_spent_seconds: 0 }] },
  { id: 'mod-002', module_no: 2, title: 'Structured Logging', description: 'Learn how to produce high-signal logs for faster incident diagnosis.', engineering_workflow_stage: 'Signal Analysis (Logging)', module_specific_problem_statement: 'System failures lack traceability due to poor logging.', pressure_points: 'Developers rely on console prints.', student_confusion: 'What meaningful logs look like.', learning_content: { major_concepts: 'Structured logging, log levels', implementation_context_when_to_use: 'Implement logs for observability', reason_behind_concept: 'Review poorly logged systems' }, support: { ai_support_tips: 'Feeds debugging workflow', module_continuity_link: 'Log report guides debugger inspection in Module 3.' }, knowledge: { technical_concepts_learnt: 'Programming basics', academic_refresher_concepts: 'Python logging' }, tools: { tools_used: 'Free', tool_type_free_or_paid: null }, status: 'available', completion_percentage: 0, artifact_submitted: false, estimatedTime: '2 hrs', stages: STAGES_ORDER.map(k => ({ key: k, status: 'not_started' as StageStatus, time_spent_seconds: 0 })) },
  { id: 'mod-003', module_no: 3, title: 'Debugging Tools', description: 'Use breakpoints and runtime inspection to isolate backend failures.', engineering_workflow_stage: 'Runtime Diagnosis (Debugging)', module_specific_problem_statement: 'Backend bug crashes services in production.', pressure_points: 'Developers cannot reproduce bugs locally.', student_confusion: 'Debugger usage unclear.', learning_content: { major_concepts: 'Breakpoints, stack traces', implementation_context_when_to_use: 'Use debugging tools systematically', reason_behind_concept: 'Inspect failing backend service' }, support: { ai_support_tips: 'Builds on logging analysis', module_continuity_link: 'Debug trace identifies conditions to reproduce in Module 4.' }, knowledge: { technical_concepts_learnt: 'Processes and threads', academic_refresher_concepts: 'VS Code debugger' }, tools: { tools_used: 'Free', tool_type_free_or_paid: null }, status: 'available', completion_percentage: 0, artifact_submitted: false, estimatedTime: '3 hrs', stages: STAGES_ORDER.map(k => ({ key: k, status: 'not_started' as StageStatus, time_spent_seconds: 0 })) },
  { id: 'mod-004', module_no: 4, title: 'Reproducing Bugs', description: 'Create controlled test setups to reproduce intermittent production defects.', engineering_workflow_stage: 'Bug Reproduction', module_specific_problem_statement: 'Intermittent production bug cannot be replicated.', pressure_points: 'Developers guess fixes.', student_confusion: 'How to reproduce bugs systematically.', learning_content: { major_concepts: 'Test cases, controlled reproduction', implementation_context_when_to_use: 'Recreate failure conditions', reason_behind_concept: 'Analyze intermittent bug' }, support: { ai_support_tips: 'Supports root cause discovery', module_continuity_link: 'Reproduction plan supplies validated failure conditions for Module 5 RCA.' }, knowledge: { technical_concepts_learnt: 'Operating systems', academic_refresher_concepts: 'Test frameworks' }, tools: { tools_used: 'Free', tool_type_free_or_paid: null }, status: 'available', completion_percentage: 0, artifact_submitted: false, estimatedTime: '2 hrs', stages: STAGES_ORDER.map(k => ({ key: k, status: 'not_started' as StageStatus, time_spent_seconds: 0 })) },
  { id: 'mod-005', module_no: 5, title: 'Root Cause Analysis', description: 'Separate symptom and cause to produce evidence-based corrective actions.', engineering_workflow_stage: 'Root Cause Identification', module_specific_problem_statement: 'Engineers fix symptoms rather than root cause.', pressure_points: 'Temporary fixes hide underlying issue.', student_confusion: 'Root cause analysis process.', learning_content: { major_concepts: 'Root cause analysis frameworks', implementation_context_when_to_use: 'Identify underlying system issue', reason_behind_concept: 'Review production incident' }, support: { ai_support_tips: 'Leads into final project', module_continuity_link: 'RCA report drives final resolution and validation in Module 6.' }, knowledge: { technical_concepts_learnt: 'System concepts', academic_refresher_concepts: 'Logs debugger' }, tools: { tools_used: 'Free', tool_type_free_or_paid: null }, status: 'available', completion_percentage: 0, artifact_submitted: false, estimatedTime: '2 hrs', stages: STAGES_ORDER.map(k => ({ key: k, status: 'not_started' as StageStatus, time_spent_seconds: 0 })) },
  { id: 'mod-006', module_no: 6, title: 'Observability Capstone', description: 'Execute end-to-end incident handling from investigation to validated fix and communication.', engineering_workflow_stage: 'Incident Resolution Capstone', module_specific_problem_statement: 'Learners must investigate, diagnose, and resolve a realistic backend production incident.', pressure_points: 'Engineers must combine logs, debugging, and RCA.', student_confusion: 'Complete debugging workflow.', learning_content: { major_concepts: 'Full observability workflow, incident comms, post-mortems', implementation_context_when_to_use: 'End to end investigation', reason_behind_concept: 'Review full production scenario' }, support: { ai_support_tips: 'Integrates all modules', module_continuity_link: 'Integrates all prior module artifacts into one capstone output.' }, knowledge: { technical_concepts_learnt: 'Programming OS', academic_refresher_concepts: 'Logs debugger monitoring' }, tools: { tools_used: 'Free', tool_type_free_or_paid: null }, status: 'available', completion_percentage: 0, artifact_submitted: false, estimatedTime: '4 hrs', stages: STAGES_ORDER.map(k => ({ key: k, status: 'not_started' as StageStatus, time_spent_seconds: 0 })) },
];

/* ── AI Facilitator questions per content item ── */
const AI_FACILITATOR_QUESTIONS: Record<string, { question: string; followUp: string }[]> = {
  c1: [
    { question: "You just watched the Incident Kickoff video. In your own words, what was the primary symptom of the API latency spike, and what made it hard to diagnose at first?", followUp: "Interesting take. How do you think the on-call engineer should have prioritised their first 15 minutes of investigation?" },
    { question: "What signals from the video would you look for first if you were the engineer on call during that incident?", followUp: "Good thinking. Would those signals alone be enough to identify the root cause, or would you need more data?" },
  ],
  c2: [
    { question: "After reviewing the Failure Investigation Worksheet, what do you think is the most important column to fill in first, and why?", followUp: "Nice reasoning. How would you handle a situation where you don't have enough data to fill that column?" },
  ],
  c3: [
    { question: "The Structured Log Analysis Guide covers several log fields. Which field do you think gives the most diagnostic value during an incident, and what's your reasoning?", followUp: "Good point. How does that field help you narrow down from hundreds of log lines to the ones that actually matter?" },
  ],
  c4: [
    { question: "Looking at the Service Architecture Diagram, which service boundary do you think is the most likely source of latency under high load, and why?", followUp: "Solid analysis. What observability would you add at that boundary to catch issues earlier?" },
  ],
  c5: [
    { question: "After watching the Trace IDs video, explain in your own words how a trace ID flows through a distributed system and why it matters for debugging.", followUp: "Great explanation. Can you think of a scenario where trace IDs alone would not be enough to diagnose a problem?" },
  ],
  c6: [
    { question: "You have just reviewed the System Architecture Overview slides. What part of the architecture surprised you most, and how does it affect the way you would approach debugging a failure in it?", followUp: "That is a thoughtful observation. How would you document that insight so that a new team member could benefit from it?" },
    { question: "Based on the slides, where in the system would you instrument logging first if you had to pick just one layer — and what would you capture there?", followUp: "Good choice. What would you sacrifice by instrumenting only that layer, and how would you compensate?" },
  ],
  c7: [
    { question: "The Request Lifecycle Deep Dive covered many hops. Identify the single hop where you believe latency is most likely to accumulate silently, and explain why.", followUp: "Strong reasoning. What metric would you define to detect latency accumulating at that hop before it becomes a user-visible incident?" },
  ],
  c8: [
    { question: "You have started drafting your logging schema. What is one design decision you are least confident about, and what tradeoffs are you weighing?", followUp: "That is exactly the kind of thinking senior engineers do. What would help you make that decision with more confidence?" },
  ],
  c9: [
    { question: "Looking at the Final Incident Investigation Report requirements, what section do you think will be hardest to complete well, and what makes it challenging?", followUp: "Agreed — that section trips up a lot of engineers. What is your strategy to tackle it?" },
  ],
  c10: [
    { question: "Reflecting on everything you have done in this module: what is one mental model or habit you would do differently in your next real incident, and why?", followUp: "That is a meaningful reflection. How would you share that learning with a teammate who was not on this incident?" },
  ],
};

const DEFAULT_FACILITATOR_QUESTIONS = [
  { question: "Now that you have reviewed this content, what is the most important concept you took away, and how does it connect to the module's main problem statement?", followUp: "Good thinking. How might you apply that concept in a real-world scenario you have encountered before?" },
];

/* ── Merge config-driven course content (from mockDataConfig.json → courseContent)
   over the built-in demo data. Config modules/content/facilitator prompts override or
   extend the built-ins by id, so editing the Excel (then running scripts/xlsx_to_json.py)
   — or editing courseContent in mockDataConfig.json directly — updates the player.
   Anything the config doesn't define falls back to the built-in demo data. ── */
type ConfigFacilitator = { question: string; follow_up: string };
type ConfigContent = ContentItem & { stage: StageKey; order?: number; facilitator?: ConfigFacilitator[] };
type ConfigModule = ModuleProg & {
  artifacts?: { express?: ModuleArtifact; empower?: ModuleArtifact };
  content?: ConfigContent[];
};

/* The built-in demo modules are the seed content for the Observability course only.
   Every other course shows its own config modules — never the debugging defaults. */
const SEED_COURSE_ID = 'crs-obs-l2';

interface CourseBucket {
  modules: Map<string, ModuleProg>;
  artMap: Record<string, { express?: ModuleArtifact; empower?: ModuleArtifact }>;
  content: Record<string, Record<string, ContentItem[]>>; // moduleId -> stage -> items
}

function buildCourseData() {
  const byCourse: Record<string, CourseBucket> = {};
  const facilitatorByContent: Record<string, { question: string; followUp: string }[]> = { ...AI_FACILITATOR_QUESTIONS };
  const bucket = (cid: string): CourseBucket =>
    (byCourse[cid] ??= { modules: new Map(), artMap: {}, content: {} });

  // Seed the Observability course with the built-in demo data.
  const seed = bucket(SEED_COURSE_ID);
  MOCK_MODULES.forEach(m => seed.modules.set(m.id, m));
  Object.assign(seed.artMap, ARTIFACT_MAP);

  const courses = loadCourseContent() as { id?: string; course_id?: string; modules?: ConfigModule[] }[];
  courses.forEach(course => {
    const cid = course.course_id || course.id || '';
    if (!cid) return;
    const b = bucket(cid);
    (course.modules ?? []).forEach(rawMod => {
      const { artifacts, content, ...modFields } = rawMod;
      b.modules.set(modFields.id, modFields as ModuleProg);
      if (artifacts && (artifacts.express || artifacts.empower)) {
        b.artMap[modFields.id] = { ...b.artMap[modFields.id], ...artifacts };
      }
      if (content && content.length) {
        const byStage: Record<string, ContentItem[]> = {};
        content.forEach(ci => {
          const { stage, order: _order, facilitator, ...item } = ci;
          (byStage[stage] ??= []).push(item as ContentItem);
          if (facilitator && facilitator.length) {
            facilitatorByContent[item.id] = facilitator.map(f => ({ question: f.question, followUp: f.follow_up }));
          }
        });
        b.content[modFields.id] = byStage;
      }
    });
  });

  return { byCourse, facilitatorByContent };
}

const COURSE_DATA = buildCourseData();
const COURSE_BUCKETS = COURSE_DATA.byCourse;
const CONFIG_FACILITATOR = COURSE_DATA.facilitatorByContent;

function getCourseModules(courseId: string): ModuleProg[] {
  const b = COURSE_BUCKETS[courseId];
  return b ? Array.from(b.modules.values()).sort((a, b2) => a.module_no - b2.module_no) : [];
}

function getCourseArtMap(courseId: string): Record<string, { express?: ModuleArtifact; empower?: ModuleArtifact }> {
  return COURSE_BUCKETS[courseId]?.artMap ?? {};
}

/* Content for a course+module+stage. The seed course falls back to the generic stage
   map; other courses show only their own defined content. */
function getStageContent(courseId: string, moduleId: string, stage: StageKey): ContentItem[] {
  const c = COURSE_BUCKETS[courseId]?.content?.[moduleId]?.[stage];
  if (c) return c;
  if (courseId === SEED_COURSE_ID) return MOCK_CONTENT_MAP[stage] ?? [];
  return [];
}

/* ── AI Facilitator Modal ── */
interface FacilitatorMessage {
  role: 'ai' | 'user';
  text: string;
}

interface AIFacilitatorProps {
  contentId: string;
  contentTitle: string;
  contentType: string;
  stageMeta: { label: string; color: string; icon: React.ReactNode };
  onDismiss: () => void;
}

function AIFacilitator({ contentId, contentTitle, contentType, stageMeta, onDismiss }: AIFacilitatorProps) {
  const questions = CONFIG_FACILITATOR[contentId] ?? DEFAULT_FACILITATOR_QUESTIONS;
  const totalQ = questions.reduce((n, q) => n + 1 + (q.followUp ? 1 : 0), 0);

  const [qIndex, setQIndex] = useState(0);
  const [messages, setMessages] = useState<FacilitatorMessage[]>([
    { role: 'ai', text: questions[0].question },
  ]);
  const [input, setInput] = useState('');
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // auto-focus textarea
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);
    setAnsweredCount(c => c + 1);

    setTimeout(() => {
      let nextText = '';
      let done = false;

      if (!awaitingFollowUp && questions[qIndex].followUp) {
        nextText = questions[qIndex].followUp;
        setAwaitingFollowUp(true);
      } else {
        const nextIdx = qIndex + 1;
        if (nextIdx < questions.length) {
          nextText = questions[nextIdx].question;
          setQIndex(nextIdx);
          setAwaitingFollowUp(false);
        } else {
          nextText = "Excellent work! You have engaged with this content deeply and thoughtfully. That kind of reflective thinking is exactly what separates good engineers from great ones. Keep that mindset as you move forward.";
          done = true;
        }
      }

      setMessages(prev => [...prev, { role: 'ai', text: nextText }]);
      setIsTyping(false);
      if (done) setIsDone(true);
    }, 1400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const contentTypeLabel: Record<string, string> = {
    slide: 'Slides', pdf: 'PDF', video: 'Video', doc: 'Document', image: 'Diagram', text: 'Reading', link: 'Resource',
  };

  const progress = isDone ? 100 : Math.round((answeredCount / totalQ) * 100);

  return (
    <div className="cd-fac-overlay" onClick={e => { if (e.target === e.currentTarget) onDismiss(); }}>
      <div className="cd-fac-sheet">

        {/* ── Sheet header ── */}
        <div className="cd-fac-sheet-header">
          <div className="cd-fac-header-left">
            <div className="cd-fac-orb">
              <Lightbulb size={20} color="white" />
            </div>
            <div>
              <div className="cd-fac-sheet-title">AI Facilitator</div>
              <div className="cd-fac-sheet-sub">
                Reflecting on
                <span className="cd-fac-sheet-content-name">{contentTitle}</span>
                <span className="cd-fac-sheet-type-pill" style={{ background: `${stageMeta.color}18`, color: stageMeta.color }}>
                  {contentTypeLabel[contentType] ?? contentType}
                </span>
              </div>
            </div>
          </div>
          <div className="cd-fac-header-right">
            <div className="cd-fac-progress-wrap">
              <div className="cd-fac-progress-label">{isDone ? 'Complete' : `${answeredCount} / ${totalQ} responses`}</div>
              <div className="cd-fac-progress-bar">
                <div className="cd-fac-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button className="cd-fac-close" onClick={onDismiss} title="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Context pill ── */}
        <div className="cd-fac-context-row">
          <span className="cd-fac-context-pill" style={{ borderColor: `${stageMeta.color}40`, color: stageMeta.color }}>
            {stageMeta.icon}
            {stageMeta.label} Stage
          </span>
          <span className="cd-fac-context-note">Answer in your own words — there are no wrong responses.</span>
        </div>

        {/* ── Chat messages ── */}
        <div className="cd-fac-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`cd-fac-msg cd-fac-msg--${msg.role}`}>
              {msg.role === 'ai' && (
                <div className="cd-fac-ai-avatar">
                  <Lightbulb size={14} color="white" strokeWidth={2.5} />
                </div>
              )}
              <div className={`cd-fac-bubble cd-fac-bubble--${msg.role}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="cd-fac-msg cd-fac-msg--ai">
              <div className="cd-fac-ai-avatar">
                <Lightbulb size={14} color="white" strokeWidth={2.5} />
              </div>
              <div className="cd-fac-bubble cd-fac-bubble--ai cd-fac-typing-bubble">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input or Done state ── */}
        {!isDone ? (
          <div className="cd-fac-input-area">
            <div className="cd-fac-input-wrap">
              <textarea
                ref={textareaRef}
                className="cd-fac-textarea"
                placeholder="Write your response here… (Enter to send · Shift+Enter for new line)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                disabled={isTyping}
              />
              <div className="cd-fac-input-actions">
                <span className="cd-fac-char-hint">Shift+Enter for new line</span>
                <button
                  className="cd-fac-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="cd-fac-done-banner">
            <div className="cd-fac-done-icon">
              <CheckCircle2 size={28} />
            </div>
            <div className="cd-fac-done-text">
              <strong>Reflection complete</strong>
              <span>You have thoughtfully engaged with this content. Well done.</span>
            </div>
            <button className="cd-fac-done-cta" onClick={onDismiss}>
              Continue Learning <ChevronRight size={15} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── XP / points (temporary local persistence) ── */
const XP_STORAGE_KEY = 'lte_earned_xp';

function awardXp(amount: number): number {
  try {
    const cur = Number(localStorage.getItem(XP_STORAGE_KEY) || '0');
    const next = cur + amount;
    localStorage.setItem(XP_STORAGE_KEY, String(next));
    window.dispatchEvent(new CustomEvent('lte-xp-updated', { detail: next }));
    return next;
  } catch {
    return amount;
  }
}

/* ── Helpers ── */
function fmtDuration(secs?: number) {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  return m > 0 ? `${m} min` : `${secs}s`;
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
  if (status === 'returned_for_rework') return { bg: '#fef3c7', color: '#d97706', label: 'Returned for Rework' };
  if (status === 'under_review') return { bg: '#eff6ff', color: '#2563eb', label: 'Under Review' };
  if (status === 'submitted') return { bg: '#f5f3ff', color: '#7c3aed', label: 'Submitted' };
  if (status === 'rejected') return { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' };
  if (status === 'evaluated') return { bg: '#ecfdf5', color: '#059669', label: 'Evaluated' };
  return { bg: '#f8fafc', color: '#64748b', label: status };
}

/* ── Circle SVG ── */
function Circle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

/* ── EvalPipeline ── */
function EvalPipeline({ submission }: { submission: Submission }) {
  const stages = ['ai', 'staff', 'industry'] as const;
  const order = { ai: 1, staff: 2, industry: 3 };
  const current = submission.current_eval_stage;
  const getStageStatus = (s: 'ai' | 'staff' | 'industry') => {
    if (!current) return 'pending';
    if (order[s] < order[current]) return 'completed';
    if (s === current) return submission.overall_status === 'returned_for_rework' ? 'returned' : 'active';
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
                {st === 'completed' ? <CheckCircle2 size={14} /> : st === 'active' ? <Loader2 size={14} className="cd-spin" /> : st === 'returned' ? <RotateCcw size={14} /> : <Circle size={14} />}
              </div>
              <span className="cd-eval-stage-label">{s === 'ai' ? 'AI Review' : s === 'staff' ? 'Staff Review' : 'Industry Review'}</span>
            </div>
            {i < 2 && <div className={`cd-eval-connector ${st === 'completed' ? 'filled' : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── ScoreRing ── */
function ScoreRing({ score, size = 72, passingScore }: { score: number; size?: number; passingScore?: number | null }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const passed = passingScore == null || score >= passingScore;
  const stroke = passed ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="cd-score-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="cd-score-ring-num" style={{ color: stroke }}>{score}</div>
    </div>
  );
}

/* ── ArtifactPanel ── */
interface ArtifactPanelProps {
  artifact: ModuleArtifact;
  moduleId: string;
  onSubmit: (moduleId: string, artifactId: string, text: string, mode: 'fast' | 'normal', url?: string) => void;
}

function ArtifactPanel({ artifact, onSubmit }: ArtifactPanelProps) {
  const [tab, setTab] = useState<'submit' | 'feedback'>('submit');
  const [expandedQ, setExpandedQ] = useState<string | null>(artifact.questions[0]?.id ?? null);
  const [questionSubmissions, setQuestionSubmissions] = useState<Record<string, { type: 'text' | 'url' | 'file' | 'code'; text: string; url: string; file: File | null; codeLanguage: string; }>>({});
  const [activeAttempt, setActiveAttempt] = useState(artifact.submissions.length > 0 ? artifact.submissions.length : 0);

  React.useEffect(() => {
    const initial: typeof questionSubmissions = {};
    artifact.questions.forEach(q => {
      if (artifact.artifact_type === 'practice' || q.submission_required) {
        initial[q.id] = { type: q.expected_submission_type || 'text', text: '', url: '', file: null, codeLanguage: 'javascript' };
      }
    });
    setQuestionSubmissions(initial);
  }, [artifact.questions, artifact.artifact_type]);

  const latestSub = artifact.submissions.find(s => s.is_latest);
  const canSubmit = !latestSub || (artifact.allow_resubmission && (!artifact.require_review_unlock || ['returned_for_rework', 'approved', 'rejected'].includes(latestSub.overall_status)));
  const attemptsLeft = artifact.max_attempts == null ? '∞' : artifact.max_attempts - artifact.submissions.length;
  const displaySub = artifact.submissions[activeAttempt - 1];

  const handleSubmit = () => {
    const submissions = Object.entries(questionSubmissions).map(([qId, data]) => {
      const question = artifact.questions.find(q => q.id === qId);
      if (!question?.submission_required) return null;
      let content = '';
      let url = '';
      if (data.type === 'text' || data.type === 'code') content = data.text;
      else if (data.type === 'url') url = data.url;
      else if (data.type === 'file' && data.file) url = `https://storage.example.com/submissions/${data.file.name}`;
      return { questionId: qId, content, url };
    }).filter(Boolean);
    const combinedText = submissions.map(s => s?.content).filter(Boolean).join('\n\n---\n\n');
    const combinedUrl = submissions.find(s => s?.url)?.url || '';
    onSubmit('', artifact.id, combinedText, 'normal', combinedUrl);
    const reset: typeof questionSubmissions = {};
    artifact.questions.forEach(q => {
      if (q.submission_required) reset[q.id] = { type: q.expected_submission_type || 'text', text: '', url: '', file: null, codeLanguage: 'javascript' };
    });
    setQuestionSubmissions(reset);
  };

  const isSubmitDisabled = () => {
    if (artifact.artifact_type === 'practice') return false;
    return artifact.questions.filter(q => q.submission_required).some(q => {
      const data = questionSubmissions[q.id];
      if (!data) return true;
      if (data.type === 'text' || data.type === 'code') return !data.text.trim();
      if (data.type === 'url') return !data.url.trim();
      if (data.type === 'file') return !data.file;
      return true;
    });
  };

  const updateQuestionSubmission = (questionId: string, updates: Partial<typeof questionSubmissions[string]>) => {
    setQuestionSubmissions(prev => ({ ...prev, [questionId]: { ...prev[questionId], ...updates } }));
  };

  const hasFeedback = artifact.submissions.length > 0;

  return (
    <div className="cd-artifact-panel">
      <div className="cd-ap-header">
        <div>
          <span className={`cd-ap-type-badge cd-ap-type--${artifact.artifact_type}`}>
            {artifact.artifact_type === 'practice' ? <><FlaskConical size={12} /> Practice</> : <><Trophy size={12} /> Final Artifact</>}
          </span>
          <div className="cd-ap-rules">
            {artifact.artifact_type === 'final' && (<><span>Pass: {artifact.passing_score}/{artifact.total_score}</span>{artifact.max_attempts && <span>Max: {artifact.max_attempts} attempts</span>}</>)}
          </div>
        </div>
        {hasFeedback && (
          <div className="cd-ap-tabs">
            <button className={`cd-ap-tab${tab === 'submit' ? '--active' : ''}`} onClick={() => setTab('submit')}>{canSubmit ? 'Submit' : 'View'}</button>
            <button className={`cd-ap-tab${tab === 'feedback' ? '--active' : ''}`} onClick={() => setTab('feedback')}>Feedback <span className="cd-ap-count">{artifact.submissions.length}</span></button>
          </div>
        )}
      </div>

      {tab === 'submit' && (
        <div className="cd-ap-body">
          {artifact.artifact_type === 'practice' && (<div className="cd-ap-status-banner cd-ap-status--info"><Info size={14} /> This is a practice artifact. Complete it to understand the concepts — no evaluation or scoring.</div>)}
          {artifact.artifact_type === 'final' && latestSub && (
            <div className={`cd-ap-status-banner cd-ap-status--${latestSub.overall_status}`}>
              {latestSub.overall_status === 'returned_for_rework' && <><RotateCcw size={14} /> Returned for rework. Review feedback and resubmit.</>}
              {latestSub.overall_status === 'in_progress' && latestSub.status === 'under_review' && <><Loader2 size={14} className="cd-spin" /> Under review — cannot resubmit yet.</>}
              {latestSub.overall_status === 'approved' && <><CheckCircle2 size={14} /> Approved! Score: {latestSub.staff_score ?? latestSub.ai_score}</>}
              {latestSub.overall_status === 'in_progress' && <><Loader2 size={14} className="cd-spin" /> In review pipeline…</>}
            </div>
          )}
          {artifact.questions.map(q => {
            const questionTemplates = artifact.templates.filter(t => t.question_id === q.id);
            const qData = questionSubmissions[q.id];
            return (
              <div key={q.id} className="cd-ap-question">
                <button className="cd-ap-q-header" onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                  <div className="cd-ap-q-title-row">
                    <span className="cd-ap-q-num">Q{q.order}</span>
                    <span className="cd-ap-q-title">{q.title}</span>
                    {artifact.artifact_type === 'final' && q.submission_required && <span className="cd-ap-q-required">Required</span>}
                    {q.expected_submission_type && (
                      <span className="cd-ap-q-type-badge">
                        {q.expected_submission_type === 'file' && <><Paperclip size={11} /> File</>}
                        {q.expected_submission_type === 'code' && <><Code2 size={11} /> Code</>}
                        {q.expected_submission_type === 'url' && <><Link size={11} /> Link</>}
                        {q.expected_submission_type === 'text' && <><FileText size={11} /> Text</>}
                      </span>
                    )}
                  </div>
                  {expandedQ === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedQ === q.id && (
                  <div className="cd-ap-q-body">
                    <p className="cd-ap-q-desc">{q.description}</p>
                    <div className="cd-ap-q-instructions"><Info size={12} /> <span>{q.instructions}</span></div>
                    {questionTemplates.length > 0 && (
                      <div className="cd-ap-q-templates">
                        <span className="cd-ap-q-templates-label">Templates:</span>
                        {questionTemplates.map(t => (<a key={t.id} href={t.file_url} className="cd-ap-template-link" download={t.is_downloadable} target="_blank" rel="noopener noreferrer"><Download size={11} />{t.file_name}</a>))}
                      </div>
                    )}
                    {qData && canSubmit && (
                      <div className="cd-ap-q-submission">
                        {qData.type === 'file' && (
                          <div className="cd-ap-file-upload-wrap">
                            <label className="cd-ap-file-upload-area cd-ap-file-upload-area--compact">
                              <input type="file" className="cd-ap-file-input" onChange={e => updateQuestionSubmission(q.id, { file: e.target.files?.[0] || null })} accept={q.accepted_file_types?.join(',') || '*'} />
                              {qData.file ? (
                                <div className="cd-ap-file-selected cd-ap-file-selected--compact"><FileText size={20} /><span className="cd-ap-file-name">{qData.file.name}</span><button className="cd-ap-file-remove cd-ap-file-remove--compact" onClick={e => { e.preventDefault(); updateQuestionSubmission(q.id, { file: null }); }}><X size={12} /></button></div>
                              ) : (
                                <div className="cd-ap-file-placeholder cd-ap-file-placeholder--compact"><Download size={20} /><span className="cd-ap-file-placeholder-text">Upload {q.accepted_file_types?.join(', ') || 'file'}</span></div>
                              )}
                            </label>
                          </div>
                        )}
                        {qData.type === 'url' && (<div className="cd-ap-url-input-wrap"><input type="url" className="cd-ap-url-input cd-ap-url-input--compact" placeholder="https://github.com/username/repo" value={qData.url} onChange={e => updateQuestionSubmission(q.id, { url: e.target.value })} /></div>)}
                        {qData.type === 'code' && (
                          <div className="cd-ap-code-wrap">
                            <div className="cd-ap-code-header">
                              <label className="cd-ap-input-label">Language:</label>
                              <select className="cd-ap-code-lang-select" value={qData.codeLanguage} onChange={e => updateQuestionSubmission(q.id, { codeLanguage: e.target.value })}>
                                <option value="python">Python</option><option value="javascript">JavaScript</option><option value="typescript">TypeScript</option><option value="java">Java</option><option value="cpp">C++</option>
                              </select>
                            </div>
                            <textarea className="cd-ap-textarea cd-ap-code-textarea" placeholder={`# Write your ${qData.codeLanguage} code here...`} value={qData.text} onChange={e => updateQuestionSubmission(q.id, { text: e.target.value })} rows={10} spellCheck={false} />
                          </div>
                        )}
                        {qData.type === 'text' && (<div className="cd-ap-textarea-wrap"><textarea className="cd-ap-textarea" placeholder="Write your response here..." value={qData.text} onChange={e => updateQuestionSubmission(q.id, { text: e.target.value })} rows={6} /></div>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {canSubmit ? (
            <div className="cd-ap-actions">
              <div className="cd-ap-submit-group">
                {artifact.artifact_type === 'final' && attemptsLeft !== '∞' && <span className="cd-ap-attempts-left">{attemptsLeft} attempts left</span>}
                <button className="cd-btn-sm-primary" disabled={artifact.artifact_type === 'final' && isSubmitDisabled()} onClick={handleSubmit}><Send size={13} /> {artifact.artifact_type === 'practice' ? 'Save Practice Work' : 'Submit All Answers'}</button>
              </div>
            </div>
          ) : (
            <div className="cd-ap-locked-submit">
              <Lock size={14} />
              <span>{latestSub?.overall_status === 'in_progress' && latestSub?.status === 'under_review' ? 'Awaiting review before resubmission is unlocked' : latestSub?.overall_status === 'approved' ? `Max score achieved (${latestSub.staff_score ?? latestSub.ai_score})` : 'Resubmission not available'}</span>
            </div>
          )}
        </div>
      )}

      {tab === 'feedback' && hasFeedback && artifact.artifact_type === 'final' && (
        <div className="cd-ap-body cd-ap-feedback-body">
          {artifact.submissions.length > 1 && (
            <div className="cd-ap-attempt-tabs">
              {artifact.submissions.map((s, i) => {
                const sc = statusColor(s.overall_status);
                return (<button key={s.id} className={`cd-ap-attempt-btn${activeAttempt === i + 1 ? ' active' : ''}`} onClick={() => setActiveAttempt(i + 1)} style={activeAttempt === i + 1 ? { borderColor: sc.color, color: sc.color } : {}}>{s.version_label}{s.staff_score != null && <span className="cd-ap-att-score">{s.staff_score}</span>}</button>);
              })}
            </div>
          )}
          {displaySub && (
            <>
              <div className="cd-ap-feedback-hero">
                <ScoreRing score={displaySub.staff_score ?? displaySub.ai_score ?? 0} size={72} passingScore={artifact.passing_score} />
                <div className="cd-ap-feedback-hero-info">
                  <div className="cd-ap-feedback-status" style={(() => { const c = statusColor(displaySub.overall_status); return { background: c.bg, color: c.color }; })()}>{statusColor(displaySub.overall_status).label}</div>
                  <p className="cd-ap-feedback-date">Submitted {new Date(displaySub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p className="cd-ap-feedback-mode">Mode: <strong>{displaySub.submission_mode}</strong></p>
                </div>
              </div>
              <EvalPipeline submission={displaySub} />
              <div className="cd-ap-submission-display">
                <div className="cd-ap-submission-type-badge">
                  {displaySub.submission_url ? (displaySub.submission_url.includes('github.com') ? <><Code2 size={10} /> GitHub Link</> : <><Layers size={10} /> URL Link</>) : <><FileText size={10} /> Text Submission</>}
                </div>
                {displaySub.submission_url ? (<a href={displaySub.submission_url} target="_blank" rel="noopener noreferrer" className="cd-ap-submission-url"><Layers size={14} />{displaySub.submission_url}<ChevronRight size={14} /></a>) : displaySub.submission_text ? (<div className="cd-ap-submission-content">{displaySub.submission_text}</div>) : (<p className="cd-ap-submission-content" style={{ color: '#94a3b8' }}>No content available</p>)}
              </div>
              {displaySub.rubric && (
                <div className="cd-ap-rubric">
                  <h5 className="cd-ap-section-title">Rubric Breakdown</h5>
                  {displaySub.rubric.map(r => (<div key={r.criterion} className="cd-ap-rubric-row"><div className="cd-ap-rubric-top"><span>{r.criterion}</span><span className="cd-ap-rubric-score">{r.score}/{r.max}</span></div><div className="cd-ap-rubric-track"><div className="cd-ap-rubric-fill" style={{ width: `${(r.score / r.max) * 100}%`, background: r.score / r.max >= 0.75 ? '#10b981' : r.score / r.max >= 0.5 ? '#f59e0b' : '#ef4444' }} /></div></div>))}
                </div>
              )}
              {displaySub.staff_feedback && (
                <div className="cd-ap-fb-card cd-ap-fb-card--staff">
                  <div className="cd-ap-fb-card-header"><Star size={13} /> Staff Feedback</div>
                  <p>{displaySub.staff_feedback}</p>
                  {displaySub.ai_improvements && <div className="cd-ap-improvements"><AlertCircle size={12} /> <span>{displaySub.ai_improvements}</span></div>}
                </div>
              )}
              {displaySub.overall_status === 'returned_for_rework' && (<button className="cd-btn-sm-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setTab('submit')}><RotateCcw size={13} /> Resubmit</button>)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODULE CONTENT PAGE
   ═══════════════════════════════════════════════════════════════ */
export function ModuleContent() {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const [searchParams] = useSearchParams();

  const initialStage = (searchParams.get('stage') as StageKey) || 'engage';

  /* ── Panel state ── */
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightExpanded, setRightExpanded] = useState(false);
  const [mobileLeftVisible, setMobileLeftVisible] = useState(false);
  const [mobileRightVisible, setMobileRightVisible] = useState(false);

  /* ── Module / stage state — scoped to the active course (from URL) ── */
  const activeCourseId = courseId ?? SEED_COURSE_ID;
  const [modules, setModules] = useState<ModuleProg[]>(() => getCourseModules(activeCourseId));
  const activeModId = moduleId ?? modules[0]?.id ?? '';
  const activeStage = initialStage;
  /* ── Reset content when stage/module changes via URL ── */
  const [activeContentId, setActiveContentId] = useState(() => {
    const items = getStageContent(activeCourseId, activeModId, activeStage);
    return items[0]?.id ?? '';
  });

  // Keep content in sync when URL stage changes
  React.useEffect(() => {
    const items = getStageContent(activeCourseId, activeModId, activeStage);
    setActiveContentId(items[0]?.id ?? '');
  }, [activeCourseId, activeStage, activeModId]);

  /* ── Artifact state ── */
  const [artifactMap, setArtifactMap] = useState(() => getCourseArtMap(activeCourseId));

  /* ── Submission evaluation overlay ── */
  const [evalOverlay, setEvalOverlay] = useState<
    | { stage: 'evaluating' | 'complete'; type: ArtifactType; xp: number; score: number | null; totalXp: number }
    | null
  >(null);

  /* ── AI Facilitator state ── */
  const [viewedContent, setViewedContent] = useState<Set<string>>(new Set());
  const [facilitatorContentId, setFacilitatorContentId] = useState<string | null>(null);

  const handleMarkContentViewed = (contentId: string) => {
    if (!viewedContent.has(contentId)) {
      setViewedContent(prev => new Set([...prev, contentId]));
      setFacilitatorContentId(contentId);
    }
  };

  const activeMod = modules.find(m => m.id === activeModId) ?? modules[0];

  // Course has no modules defined yet (only the Observability course is seeded).
  if (!activeMod) {
    return (
      <div className="cd-viewer">
        <div className="cd-viewer-topbar">
          <div className="cd-topbar-left">
            <button className="cd-topbar-back" onClick={() => navigate(`/courses/${courseId}`)}>
              <ArrowLeft size={14} /> Overview
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#94a3b8', fontSize: '0.95rem' }}>
          Content for this course is coming soon.
        </div>
      </div>
    );
  }

  const stageIdx = STAGES_ORDER.indexOf(activeStage);
  const stageMeta = STAGE_META[activeStage];
  const contentItems = getStageContent(activeCourseId, activeModId, activeStage);
  const activeContent = contentItems.find(c => c.id === activeContentId) ?? contentItems[0];
  const isArtifactStage = activeStage === 'express' || activeStage === 'empower';
  const currentArtifact = isArtifactStage ? artifactMap[activeModId]?.[activeStage === 'express' ? 'express' : 'empower'] : undefined;

  const markStageVisited = (modId: string, stage: StageKey) => {
    setModules(prev => prev.map(m => {
      if (m.id !== modId) return m;
      const stages = m.stages.map(s => {
        if (s.key !== stage) return s;
        if (s.status === 'not_started') return { ...s, status: 'in_progress' as StageStatus };
        return s;
      });
      const done = stages.filter(s => s.status === 'completed').length;
      const inp = stages.filter(s => s.status === 'in_progress').length;
      const pct = Math.round(((done + inp * 0.5) / 6) * 100);
      const modStatus: ModStatus = done === 6 ? 'completed' : inp > 0 || done > 0 ? 'in_progress' : 'available';
      return { ...m, stages, completion_percentage: pct, status: modStatus };
    }));
  };

  const completeStage = (modId: string, stage: StageKey) => {
    setModules(prev => prev.map(m => {
      if (m.id !== modId) return m;
      const stages = m.stages.map(s => s.key === stage ? { ...s, status: 'completed' as StageStatus } : s);
      const done = stages.filter(s => s.status === 'completed').length;
      const inp = stages.filter(s => s.status === 'in_progress').length;
      const pct = Math.round(((done + inp * 0.5) / 6) * 100);
      const modStatus: ModStatus = done === 6 ? 'completed' : inp > 0 || done > 0 ? 'in_progress' : 'available';
      return { ...m, stages, completion_percentage: pct, status: modStatus };
    }));
  };

  const goStage = (direction: 'prev' | 'next') => {
    const newIdx = direction === 'next' ? stageIdx + 1 : stageIdx - 1;
    if (newIdx < 0 || newIdx >= STAGES_ORDER.length) return;
    const newStage = STAGES_ORDER[newIdx];
    markStageVisited(activeModId, newStage);
    navigate(`/courses/${courseId}/modules/${activeModId}?stage=${newStage}`);
  };

  const switchModule = (modId: string, stage: StageKey) => {
    setMobileLeftVisible(false);
    navigate(`/courses/${courseId}/modules/${modId}?stage=${stage}`);
  };

  const handleArtifactSubmit = (_modId: string, artifactId: string, text: string, mode: 'fast' | 'normal', url?: string) => {
    const modArts = artifactMap[activeModId] ?? {};
    const key = artifactId === modArts.express?.id ? 'express' : 'empower';
    const art = modArts[key];
    if (!art) return;

    const isFinal = art.artifact_type === 'final';
    const newSubId = `as-new-${Date.now()}`;

    // Step 1 — record the submission as "evaluating" (under review)
    if (isFinal) {
      setArtifactMap(prev => {
        const pModArts = prev[activeModId] ?? {};
        const pArt = pModArts[key];
        if (!pArt) return prev;
        const attemptNo = pArt.submissions.length + 1;
        const prevSubId = pArt.submissions.find(s => s.is_latest)?.id ?? null;
        const newSub: Submission = { id: newSubId, attempt_no: attemptNo, version_label: `v${attemptNo}`, is_latest: true, previous_submission_id: prevSubId, submission_mode: mode, submission_text: text || null, submission_url: url || null, status: 'under_review', overall_status: 'in_progress', current_eval_stage: 'ai', submitted_at: new Date().toISOString(), sealed_at: new Date().toISOString() };
        const updatedSubs = pArt.submissions.map(s => ({ ...s, is_latest: false })).concat(newSub);
        return { ...prev, [activeModId]: { ...pModArts, [key]: { ...pArt, submissions: updatedSubs } } };
      });
    }

    // Show the "Evaluating…" overlay
    setEvalOverlay({ stage: 'evaluating', type: art.artifact_type, xp: 0, score: null, totalXp: 0 });

    // Step 2 — finish evaluation, award points, mark complete
    window.setTimeout(() => {
      const score = isFinal ? 78 + Math.floor(Math.random() * 19) : null; // 78–96
      const xp = isFinal ? Math.round((score as number) * 1.5) : 25; // points awarded
      const totalXp = awardXp(xp);

      if (isFinal) {
        setArtifactMap(prev => {
          const pModArts = prev[activeModId] ?? {};
          const pArt = pModArts[key];
          if (!pArt) return prev;
          const updatedSubs = pArt.submissions.map(s =>
            s.id === newSubId
              ? {
                  ...s,
                  status: 'evaluated' as SubmissionStatus,
                  overall_status: 'approved' as Submission['overall_status'],
                  current_eval_stage: 'ai' as const,
                  ai_score: score as number,
                  ai_feedback: 'Strong submission. Clear structure and solid evidence — well done.',
                  ai_improvements: 'Consider expanding on edge cases for an even higher score.',
                }
              : s
          );
          return { ...prev, [activeModId]: { ...pModArts, [key]: { ...pArt, submissions: updatedSubs } } };
        });
        setModules(prev => prev.map(m => (m.id === activeModId ? { ...m, artifact_submitted: true } : m)));
        completeStage(activeModId, 'empower');
      } else {
        completeStage(activeModId, 'express');
      }

      setEvalOverlay({ stage: 'complete', type: art.artifact_type, xp, score, totalXp });
    }, 2600);
  };

  return (
    <div className="cd-viewer">
      {/* ── Top bar ── */}
      <div className="cd-viewer-topbar">
        <div className="cd-topbar-left">
          <button className="cd-topbar-back" onClick={() => navigate(`/courses/${courseId}`)}>
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
          <button className={`cd-mobile-sidebar-toggle${mobileLeftVisible ? ' cd-mobile-sidebar-toggle--active' : ''}`} onClick={() => { setMobileLeftVisible(!mobileLeftVisible); setMobileRightVisible(false); }} title="Toggle modules"><PanelLeftClose size={15} /></button>
          <button className={`cd-mobile-sidebar-toggle${mobileRightVisible ? ' cd-mobile-sidebar-toggle--active' : ''}`} onClick={() => { setMobileRightVisible(!mobileRightVisible); setMobileLeftVisible(false); }} title="Toggle content"><PanelRightClose size={15} /></button>
          <button className="cd-topbar-btn" onClick={() => setLeftOpen(p => !p)} title="Toggle module list"><PanelLeftClose size={15} /></button>
          <button className="cd-topbar-btn" onClick={() => setRightOpen(p => !p)} title="Toggle panel"><PanelRightClose size={15} /></button>
          <button className="cd-topbar-btn"><MoreVertical size={15} /></button>
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
                style={isActive ? ({ borderBottomColor: meta.color, color: meta.color } as React.CSSProperties) : {}}
                onClick={() => {
                  markStageVisited(activeModId, key);
                  navigate(`/courses/${courseId}/modules/${activeModId}?stage=${key}`);
                }}
              >
                <span className={`cd-stepper-icon-wrap${s.status === 'completed' ? '-done' : isActive ? '-active' : ''}`}>
                  {s.status === 'completed' ? <CheckCircle2 size={13} /> : meta.icon}
                </span>
                <span className="cd-stepper-label">{meta.label}</span>
                <span className="cd-stepper-tag">{meta.purposeTag}</span>
              </button>
              {i < STAGES_ORDER.length - 1 && <div className={`cd-stepper-connector${s.status === 'completed' ? ' cd-stepper-connector--done' : ''}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── 3 Panels ── */}
      <div className="cd-panels">
        {(mobileLeftVisible || mobileRightVisible) && (
          <div className="cd-mobile-overlay cd-mobile-overlay--visible" onClick={() => { setMobileLeftVisible(false); setMobileRightVisible(false); }} />
        )}

        {/* LEFT: Module Navigator */}
        <aside className={`cd-panel-left${mobileLeftVisible ? ' cd-panel-left--visible' : ''}${!leftOpen ? ' cd-panel-left--hidden-desktop' : ''}`}>
          <div className="cd-panel-header">
            <span>Modules</span>
            <div className="cd-panel-header-actions">
              <button className="cd-panel-close" onClick={() => { setLeftOpen(false); setMobileLeftVisible(false); }}><X size={13} /></button>
            </div>
          </div>
          <div className="cd-mod-nav">
            {modules.map(mod => (
              <div
                key={mod.id}
                className={`cd-nav-mod${mod.id === activeModId ? ' cd-nav-mod--active' : ''} cd-nav-mod--${mod.status}`}
                onClick={() => {
                  const first = mod.stages.find(s => s.status === 'in_progress') ?? mod.stages.find(s => s.status !== 'not_started') ?? mod.stages[0];
                  switchModule(mod.id, first.key);
                }}
              >
                <div className="cd-nav-mod-row">
                  <div className={`cd-nav-mod-dot cd-nav-mod-dot--${mod.status}`}>
                    {mod.status === 'completed' ? <CheckCircle2 size={11} /> : <span>{mod.module_no}</span>}
                  </div>
                  <div className="cd-nav-mod-info">
                    <span className="cd-nav-mod-title">{mod.title}</span>
                    <div className="cd-nav-mod-prog"><div className="cd-nav-mod-prog-fill" style={{ width: `${mod.completion_percentage}%` }} /></div>
                  </div>
                  <span className="cd-nav-mod-pct">{mod.completion_percentage}%</span>
                </div>
                {mod.id === activeModId && (
                  <div className="cd-nav-stage-dots">
                    {mod.stages.map(st => (
                      <button
                        key={st.key}
                        className={`cd-nav-stage-dot cd-nav-stage-dot--${st.status}${st.key === activeStage ? ' cd-nav-stage-dot--cur' : ''}`}
                        style={st.key === activeStage ? ({ background: STAGE_META[st.key].color } as React.CSSProperties) : {}}
                        onClick={e => { e.stopPropagation(); markStageVisited(activeModId, st.key); navigate(`/courses/${courseId}/modules/${activeModId}?stage=${st.key}`); }}
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
          <div className="cd-content-tabs">
            {contentItems.map(item => (
              <button key={item.id} className={`cd-content-tab${activeContentId === item.id ? ' cd-content-tab--active' : ''}`} onClick={() => setActiveContentId(item.id)}>
                {contentIcon(item.content_type, 13)}
                <span className="cd-content-tab-title">{item.title}</span>
                {item.isViewed && <div className="cd-viewed-dot" />}
                {item.duration_seconds && <span className="cd-content-tab-dur">{fmtDuration(item.duration_seconds)}</span>}
              </button>
            ))}
          </div>

          <div className="cd-content-viewer" style={{ position: 'relative' }}>
            <div className="cd-content-viewer-header">
              <div>
                <h3 className="cd-content-title">{activeContent?.title}</h3>
                <div className="cd-content-meta">
                  <span style={{ color: stageMeta.color }}>{stageMeta.icon}</span>
                  {stageMeta.label} · {activeContent?.content_type?.toUpperCase()}
                  {activeContent?.duration_seconds && ` · ${fmtDuration(activeContent.duration_seconds)}`}
                </div>
              </div>
              <div className="cd-content-acts">
                {viewedContent.has(activeContent?.id ?? '') && facilitatorContentId !== activeContent?.id && (
                  <div className="cd-ai-header-wrapper">
                    <button className="cd-topbar-btn cd-ai-ping-btn" onClick={() => setFacilitatorContentId(activeContent!.id)}>
                      <Lightbulb size={16} className="cd-ai-header-icon" />
                      <span className="cd-ai-ping-dot"></span>
                    </button>
                    <div className="cd-ai-header-tooltip">
                      Your AI Facilitator has questions about this content
                    </div>
                  </div>
                )}
                <button className="cd-topbar-btn"><Download size={14} /></button>
                <button className="cd-topbar-btn"><Maximize2 size={14} /></button>
              </div>
            </div>

            <div className="cd-content-body">
              {/* Video */}
              {(!activeContent || activeContent.content_type === 'video') && (
                <div className="cd-video-ph">
                  <PlayCircle size={56} className="cd-video-play" />
                  <p>{activeContent?.title}</p>
                  {activeContent && (
                    viewedContent.has(activeContent.id)
                      ? <span className="cd-content-viewed-badge"><CheckCircle2 size={13} /> Watched</span>
                      : <button className="cd-content-done-trigger" onClick={() => handleMarkContentViewed(activeContent.id)}>
                          <CheckCircle2 size={14} /> Mark as Watched
                        </button>
                  )}
                </div>
              )}
              {/* PDF */}
              {activeContent?.content_type === 'pdf' && (
                <div className="cd-doc-ph">
                  <FileText size={44} />
                  <p>{activeContent.title}</p>
                  <button className="cd-btn-sm-outline"><Download size={12} /> Download PDF</button>
                  {viewedContent.has(activeContent.id)
                    ? <span className="cd-content-viewed-badge"><CheckCircle2 size={13} /> Read</span>
                    : <button className="cd-content-done-trigger" onClick={() => handleMarkContentViewed(activeContent.id)}>
                        <CheckCircle2 size={14} /> Mark as Read
                      </button>
                  }
                </div>
              )}
              {/* Slide / Image */}
              {(activeContent?.content_type === 'slide' || activeContent?.content_type === 'image') && (
                <div className="cd-doc-ph">
                  <Layers size={44} />
                  <p>{activeContent.title}</p>
                  {viewedContent.has(activeContent.id)
                    ? <span className="cd-content-viewed-badge"><CheckCircle2 size={13} /> Completed</span>
                    : <button className="cd-content-done-trigger" onClick={() => handleMarkContentViewed(activeContent.id)}>
                        <CheckCircle2 size={14} /> Mark as Completed
                      </button>
                  }
                </div>
              )}
              {/* Doc */}
              {activeContent?.content_type === 'doc' && (
                <div className="cd-doc-ph">
                  <FileText size={44} />
                  <p>{activeContent.title}</p>
                  {viewedContent.has(activeContent.id)
                    ? <span className="cd-content-viewed-badge"><CheckCircle2 size={13} /> Read</span>
                    : <button className="cd-content-done-trigger" onClick={() => handleMarkContentViewed(activeContent.id)}>
                        <CheckCircle2 size={14} /> Mark as Read
                      </button>
                  }
                </div>
              )}
              {/* Text */}
              {activeContent?.content_type === 'text' && (
                <div className="cd-text-ph">
                  <p>Reflection content for {stageMeta.label} stage</p>
                  {viewedContent.has(activeContent.id)
                    ? <span className="cd-content-viewed-badge"><CheckCircle2 size={13} /> Read</span>
                    : <button className="cd-content-done-trigger" onClick={() => handleMarkContentViewed(activeContent.id)}>
                        <CheckCircle2 size={14} /> Mark as Read
                      </button>
                  }
                </div>
              )}
            </div>

            {/* Removed inline / floating facilitator nudge -> moved to header */}

            <div className="cd-stage-ctx" style={{ borderColor: `${stageMeta.color}30` } as React.CSSProperties}>
              <span className="cd-stage-ctx-badge" style={{ background: `${stageMeta.color}15`, color: stageMeta.color } as React.CSSProperties}>{stageMeta.icon} {stageMeta.label}</span>
              <p className="cd-stage-ctx-desc">{stageMeta.description}</p>
              <span className="cd-stage-ctx-purpose">{stageMeta.purposeTag}</span>
            </div>
          </div>

          {/* AI Facilitator — full overlay modal, outside the content viewer */}
          {facilitatorContentId === activeContent?.id && activeContent && (
            <AIFacilitator
              key={`${activeContent.id}-fac`}
              contentId={activeContent.id}
              contentTitle={activeContent.title}
              contentType={activeContent.content_type}
              stageMeta={stageMeta}
              onDismiss={() => setFacilitatorContentId(null)}
            />
          )}

          <div className="cd-content-footer">
            <button className="cd-btn-nav" disabled={stageIdx === 0} onClick={() => goStage('prev')}><ChevronLeft size={15} /> Previous</button>
            <div className="cd-footer-dots">
              {STAGES_ORDER.map((k, i) => (<div key={k} className={`cd-footer-dot${i === stageIdx ? ' cd-footer-dot--active' : activeMod.stages[i]?.status === 'completed' ? ' cd-footer-dot--done' : ''}`} />))}
            </div>
            {stageIdx < STAGES_ORDER.length - 1 ? (
              <button className="cd-btn-primary-sm" onClick={() => { completeStage(activeModId, activeStage); goStage('next'); }}>Mark Done & Next <ChevronRight size={15} /></button>
            ) : (
              <button className="cd-btn-primary-sm" onClick={() => completeStage(activeModId, activeStage)}><CheckCircle2 size={15} /> Complete Module</button>
            )}
          </div>
        </main>

        {/* RIGHT: Artifact + Info Panel */}
        <aside className={`cd-panel-right${rightExpanded ? ' cd-panel-right--expanded' : ''}${mobileRightVisible ? ' cd-panel-right--visible' : ''}${!rightOpen ? ' cd-panel-right--hidden-desktop' : ''}`}>
          <div className="cd-panel-header">
            <span>{isArtifactStage ? (activeStage === 'express' ? 'Practice Artifact' : 'Final Artifact') : 'Stage Info'}</span>
            <div className="cd-panel-header-actions">
              <button className="cd-panel-expand" onClick={() => setRightExpanded(!rightExpanded)} title={rightExpanded ? 'Collapse panel' : 'Expand panel'}><Maximize2 size={13} /></button>
              <button className="cd-panel-close" onClick={() => { setRightOpen(false); setMobileRightVisible(false); }}><X size={13} /></button>
            </div>
          </div>
          <div className="cd-panel-body">
            {isArtifactStage && currentArtifact ? (
              <ArtifactPanel artifact={currentArtifact} moduleId={activeModId} onSubmit={handleArtifactSubmit} />
            ) : (
              <>
                <div className="cd-stage-info">
                  <h4 style={{ color: stageMeta.color }}>{stageMeta.label} Stage</h4>
                  <p>{stageMeta.description}</p>
                  <div className="cd-stage-info-row"><Clock size={13} /> Est. {stageMeta.estLabel}</div>
                  <div className="cd-stage-info-row"><Target size={13} /> {contentItems.length} content items</div>
                  <div className="cd-stage-info-row"><GraduationCap size={13} />{STAGE_META[activeStage].purposeTag}</div>
                </div>
                <div className="cd-curriculum-ref-card">
                  <div className="cd-curriculum-ref-header"><BookOpen size={16} className="cd-curriculum-ref-icon" /><h5>Curriculum Reference</h5></div>
                  <div className="cd-curriculum-ref-section"><div className="cd-curriculum-ref-label"><GraduationCap size={12} /><span>Prerequisites</span></div><p className="cd-curriculum-ref-text">{activeMod.knowledge.academic_refresher_concepts}</p></div>
                  <div className="cd-curriculum-ref-section"><div className="cd-curriculum-ref-label"><Code2 size={12} /><span>Technical Concepts</span></div><p className="cd-curriculum-ref-text">{activeMod.knowledge.technical_concepts_learnt}</p></div>
                  <div className="cd-curriculum-ref-section"><div className="cd-curriculum-ref-label"><Layers size={12} /><span>Engineering Context</span></div><p className="cd-curriculum-ref-text">{activeMod.engineering_workflow_stage}</p></div>
                  <div className="cd-curriculum-ref-section"><div className="cd-curriculum-ref-label"><Lightbulb size={12} /><span>When to Use</span></div><p className="cd-curriculum-ref-text">{activeMod.learning_content.implementation_context_when_to_use}</p></div>
                  <div className="cd-curriculum-ref-section"><div className="cd-curriculum-ref-label"><ChevronRight size={12} /><span>Module Continuity</span></div><p className="cd-curriculum-ref-text">{activeMod.support.module_continuity_link}</p></div>
                </div>
                <div className="cd-mod-context-card">
                  <h5>Module Context</h5>
                  <p className="cd-mod-context-problem">{activeMod.module_specific_problem_statement}</p>
                  <div className="cd-mod-context-concepts"><span>Concepts: </span>{activeMod.learning_content.major_concepts}</div>
                </div>
                <div className="cd-ask-ai-card">
                  <MessageSquare size={15} className="cd-ai-icon" />
                  <div><div className="cd-ai-title">Ask AI Tutor</div><div className="cd-ai-sub">Get help with this stage</div></div>
                  <button className="cd-btn-sm-outline">Ask</button>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ── Evaluation overlay: Evaluating → Complete → Points awarded ── */}
      {evalOverlay && (
        <div className="cd-eval-overlay" onClick={e => { if (e.target === e.currentTarget && evalOverlay.stage === 'complete') setEvalOverlay(null); }}>
          <div className={`cd-eval-modal cd-eval-modal--${evalOverlay.stage}`}>
            {evalOverlay.stage === 'evaluating' ? (
              <>
                <div className="cd-eval-spinner"><Loader2 size={40} className="cd-spin" /></div>
                <h3 className="cd-eval-modal-title">Evaluating your artifact…</h3>
                <p className="cd-eval-modal-sub">
                  {evalOverlay.type === 'final'
                    ? 'Our AI reviewer is assessing your submission against the rubric.'
                    : 'Reviewing your practice work.'}
                </p>
                <div className="cd-eval-progress-track"><div className="cd-eval-progress-bar" /></div>
              </>
            ) : (
              <>
                <div className="cd-eval-success-ring">
                  <CheckCircle2 size={48} strokeWidth={2.2} />
                </div>
                <h3 className="cd-eval-modal-title">Evaluation Complete!</h3>
                {evalOverlay.score != null && (
                  <p className="cd-eval-modal-sub">
                    You scored <strong>{evalOverlay.score}/100</strong> on this artifact.
                  </p>
                )}
                <div className="cd-eval-xp-badge">
                  <Star size={18} />
                  <span className="cd-eval-xp-amount">+{evalOverlay.xp} XP</span>
                  <span className="cd-eval-xp-label">earned</span>
                </div>
                <p className="cd-eval-total-xp">
                  Total points: <strong>{evalOverlay.totalXp.toLocaleString()} XP</strong>
                </p>
                <div className="cd-eval-actions">
                  <button className="cd-eval-dashboard-btn" onClick={() => navigate('/')}>
                    <Trophy size={14} /> View on Dashboard
                  </button>
                  <button className="cd-eval-continue-btn" onClick={() => setEvalOverlay(null)}>
                    Continue <ChevronRight size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
