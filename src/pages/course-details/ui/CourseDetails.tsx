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
  Share2,
  Download,
  Maximize2,
  X,
  Send,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  PanelLeftClose,
  PanelRightClose,
} from 'lucide-react';
import './course-details.css';

/* ─────────────────────────── types ────────────────────────── */
type StageKey = 'engage' | 'explore' | 'explain' | 'express' | 'empower' | 'evolve';
type ModuleStatus = 'completed' | 'in_progress' | 'available' | 'locked';
type ContentType = 'video' | 'pdf' | 'slide' | 'doc' | 'image';
type ArtifactStatus = 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'rework' | 'completed';

interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  duration_seconds?: number;
  isViewed: boolean;
}

interface ModuleStage {
  key: StageKey;
  label: string;
  icon: React.ReactNode;
  status: 'completed' | 'active' | 'not_started';
  contentCount: number;
}

interface CourseModule {
  id: string;
  module_no: number;
  title: string;
  description: string;
  engineering_workflow_stage: string;
  status: ModuleStatus;
  completion_percentage: number;
  estimatedTime: string;
  stages: ModuleStage[];
  score?: number;
  completedAt?: string;
  module_specific_problem_statement?: string;
  pressure_points?: string;
  student_confusion?: string;
  learning_content?: {
    major_concepts: string;
    implementation_context_when_to_use: string;
    reason_behind_concept: string;
  };
}

interface ArtifactSubmission {
  version: number;
  submittedAt: string;
  score: number;
  level: string;
  strengths: string[];
  improvements: string[];
  rubric: { criterion: string; score: number; max: number }[];
}

/* ─────────────────────────── stage meta ───────────────────── */
const STAGE_META: Record<StageKey, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  engage:  { label: 'Engage',  color: '#6366f1', icon: <Lightbulb size={14} />,  description: 'Hook into the real-world problem scenario' },
  explore: { label: 'Explore', color: '#8b5cf6', icon: <Target size={14} />,     description: 'Investigate and gather information' },
  explain: { label: 'Explain', color: '#0ea5e9', icon: <Layers size={14} />,     description: 'Understand core concepts and principles' },
  express: { label: 'Express', color: '#f59e0b', icon: <Code2 size={14} />,      description: 'Apply knowledge through practice artifacts' },
  empower: { label: 'Empower', color: '#10b981', icon: <Zap size={14} />,        description: 'Build and submit your final artifact' },
  evolve:  { label: 'Evolve',  color: '#ec4899', icon: <TrendingUp size={14} />, description: 'Reflect, improve and advance your mastery' },
};

/* ─────────────────────────── mock data ────────────────────── */
const MOCK_MODULES: CourseModule[] = [
  {
    id: 'mod-001', module_no: 1,
    title: 'System Failure Investigation',
    description: 'Learn how to investigate and debug system failures in production environments.',
    engineering_workflow_stage: 'System Investigation',
    module_specific_problem_statement: 'Production API latency increases during peak traffic.',
    pressure_points: 'Engineers rely on print statements and cannot locate failure source.',
    student_confusion: 'How backend systems fail under load.',
    learning_content: {
      major_concepts: 'System architecture, request lifecycle, observability overview',
      implementation_context_when_to_use: 'Understanding system interactions before debugging',
      reason_behind_concept: 'Logs investigation'
    },
    status: 'completed', completion_percentage: 100,
    estimatedTime: '2.5 hrs', score: 87, completedAt: 'Mar 10, 2025',
    stages: [
      { key: 'engage',  label: 'Engage',  icon: <Lightbulb size={13}/>, status: 'completed', contentCount: 2 },
      { key: 'explore', label: 'Explore', icon: <Target size={13}/>,    status: 'completed', contentCount: 3 },
      { key: 'explain', label: 'Explain', icon: <Layers size={13}/>,    status: 'completed', contentCount: 2 },
      { key: 'express', label: 'Express', icon: <Code2 size={13}/>,     status: 'completed', contentCount: 1 },
      { key: 'empower', label: 'Empower', icon: <Zap size={13}/>,       status: 'completed', contentCount: 1 },
      { key: 'evolve',  label: 'Evolve',  icon: <TrendingUp size={13}/>,status: 'completed', contentCount: 1 },
    ],
  },
  {
    id: 'mod-002', module_no: 2,
    title: 'Structured Logging',
    description: 'Learn how to produce high-signal logs for faster incident diagnosis.',
    engineering_workflow_stage: 'Signal Analysis (Logging)',
    module_specific_problem_statement: 'System failures lack traceability due to poor logging.',
    pressure_points: 'Developers rely on console prints.',
    student_confusion: 'What meaningful logs look like.',
    learning_content: {
      major_concepts: 'Structured logging, log levels',
      implementation_context_when_to_use: 'Implement logs for observability',
      reason_behind_concept: 'Review poorly logged systems'
    },
    status: 'in_progress', completion_percentage: 55,
    estimatedTime: '~2 hrs remaining',
    stages: [
      { key: 'engage',  label: 'Engage',  icon: <Lightbulb size={13}/>, status: 'completed',  contentCount: 2 },
      { key: 'explore', label: 'Explore', icon: <Target size={13}/>,    status: 'completed',  contentCount: 3 },
      { key: 'explain', label: 'Explain', icon: <Layers size={13}/>,    status: 'completed',  contentCount: 2 },
      { key: 'express', label: 'Express', icon: <Code2 size={13}/>,     status: 'active',     contentCount: 1 },
      { key: 'empower', label: 'Empower', icon: <Zap size={13}/>,       status: 'not_started',contentCount: 1 },
      { key: 'evolve',  label: 'Evolve',  icon: <TrendingUp size={13}/>,status: 'not_started',contentCount: 1 },
    ],
  },
  {
    id: 'mod-003', module_no: 3,
    title: 'Debugging Tools',
    description: 'Use breakpoints and runtime inspection to isolate backend failures.',
    engineering_workflow_stage: 'Runtime Diagnosis (Debugging)',
    module_specific_problem_statement: 'Backend bug crashes services in production.',
    pressure_points: 'Developers cannot reproduce bugs locally.',
    student_confusion: 'Debugger usage unclear.',
    learning_content: {
      major_concepts: 'Breakpoints, stack traces',
      implementation_context_when_to_use: 'Use debugging tools systematically',
      reason_behind_concept: 'Inspect failing backend service'
    },
    status: 'available', completion_percentage: 0,
    estimatedTime: '3 hrs',
    stages: [
      { key: 'engage',  label: 'Engage',  icon: <Lightbulb size={13}/>, status: 'not_started', contentCount: 2 },
      { key: 'explore', label: 'Explore', icon: <Target size={13}/>,    status: 'not_started', contentCount: 2 },
      { key: 'explain', label: 'Explain', icon: <Layers size={13}/>,    status: 'not_started', contentCount: 3 },
      { key: 'express', label: 'Express', icon: <Code2 size={13}/>,     status: 'not_started', contentCount: 1 },
      { key: 'empower', label: 'Empower', icon: <Zap size={13}/>,       status: 'not_started', contentCount: 1 },
      { key: 'evolve',  label: 'Evolve',  icon: <TrendingUp size={13}/>,status: 'not_started', contentCount: 1 },
    ],
  },
  {
    id: 'mod-004', module_no: 4,
    title: 'Reproducing Bugs',
    description: 'Create controlled test setups to reproduce intermittent production defects.',
    engineering_workflow_stage: 'Bug Reproduction',
    module_specific_problem_statement: 'Intermittent production bug cannot be replicated.',
    pressure_points: 'Developers guess fixes.',
    student_confusion: 'How to reproduce bugs systematically.',
    learning_content: {
      major_concepts: 'Test cases, controlled reproduction',
      implementation_context_when_to_use: 'Recreate failure conditions',
      reason_behind_concept: 'Analyze intermittent bug'
    },
    status: 'available', completion_percentage: 0,
    estimatedTime: '2 hrs',
    stages: [
      { key: 'engage',  label: 'Engage',  icon: <Lightbulb size={13}/>, status: 'not_started', contentCount: 2 },
      { key: 'explore', label: 'Explore', icon: <Target size={13}/>,    status: 'not_started', contentCount: 2 },
      { key: 'explain', label: 'Explain', icon: <Layers size={13}/>,    status: 'not_started', contentCount: 2 },
      { key: 'express', label: 'Express', icon: <Code2 size={13}/>,     status: 'not_started', contentCount: 1 },
      { key: 'empower', label: 'Empower', icon: <Zap size={13}/>,       status: 'not_started', contentCount: 1 },
      { key: 'evolve',  label: 'Evolve',  icon: <TrendingUp size={13}/>,status: 'not_started', contentCount: 1 },
    ],
  },
  {
    id: 'mod-005', module_no: 5,
    title: 'Root Cause Analysis',
    description: 'Separate symptom and cause to produce evidence-based corrective actions.',
    engineering_workflow_stage: 'Root Cause Identification',
    module_specific_problem_statement: 'Engineers fix symptoms rather than root cause.',
    pressure_points: 'Temporary fixes hide underlying issue.',
    student_confusion: 'Root cause analysis process.',
    learning_content: {
      major_concepts: 'Root cause analysis frameworks',
      implementation_context_when_to_use: 'Identify underlying system issue',
      reason_behind_concept: 'Review production incident'
    },
    status: 'available', completion_percentage: 0,
    estimatedTime: '2 hrs',
    stages: [
      { key: 'engage',  label: 'Engage',  icon: <Lightbulb size={13}/>, status: 'not_started', contentCount: 2 },
      { key: 'explore', label: 'Explore', icon: <Target size={13}/>,    status: 'not_started', contentCount: 2 },
      { key: 'explain', label: 'Explain', icon: <Layers size={13}/>,    status: 'not_started', contentCount: 2 },
      { key: 'express', label: 'Express', icon: <Code2 size={13}/>,     status: 'not_started', contentCount: 1 },
      { key: 'empower', label: 'Empower', icon: <Zap size={13}/>,       status: 'not_started', contentCount: 1 },
      { key: 'evolve',  label: 'Evolve',  icon: <TrendingUp size={13}/>,status: 'not_started', contentCount: 1 },
    ],
  },
  {
    id: 'mod-006', module_no: 6,
    title: 'Observability Incident Resolution Capstone',
    description: 'Execute end-to-end incident handling from investigation to validated fix and communication.',
    engineering_workflow_stage: 'Incident Resolution Capstone',
    module_specific_problem_statement: 'Learners must investigate, diagnose, and resolve a realistic backend production incident using a full observability workflow.',
    pressure_points: 'Engineers must combine logs, debugging, and RCA.',
    student_confusion: 'Complete debugging workflow.',
    learning_content: {
      major_concepts: 'Observability debugging workflow',
      implementation_context_when_to_use: 'End to end investigation',
      reason_behind_concept: 'Review full production scenario'
    },
    status: 'available', completion_percentage: 0,
    estimatedTime: '4 hrs',
    stages: [
      { key: 'engage',  label: 'Engage',  icon: <Lightbulb size={13}/>, status: 'not_started', contentCount: 2 },
      { key: 'explore', label: 'Explore', icon: <Target size={13}/>,    status: 'not_started', contentCount: 2 },
      { key: 'explain', label: 'Explain', icon: <Layers size={13}/>,    status: 'not_started', contentCount: 2 },
      { key: 'express', label: 'Express', icon: <Code2 size={13}/>,     status: 'not_started', contentCount: 1 },
      { key: 'empower', label: 'Empower', icon: <Zap size={13}/>,       status: 'not_started', contentCount: 1 },
      { key: 'evolve',  label: 'Evolve',  icon: <TrendingUp size={13}/>,status: 'not_started', contentCount: 1 },
    ],
  },
];

const MOCK_CONTENT: ContentItem[] = [
  { id: 'c1', title: 'Incident Kickoff: API Latency Spike', type: 'video', duration_seconds: 540, isViewed: true },
  { id: 'c2', title: 'Failure Investigation Worksheet', type: 'pdf', isViewed: true },
  { id: 'c3', title: 'Structured Logging Design Principles', type: 'slide', isViewed: false },
  { id: 'c4', title: 'Architecture Diagram Overview', type: 'image', isViewed: false },
];

const MOCK_SUBMISSIONS: ArtifactSubmission[] = [
  {
    version: 1, submittedAt: 'Mar 15, 2025', score: 72, level: 'Developing',
    strengths: ['Clear problem framing', 'Good log structure'],
    improvements: ['Missing severity levels', 'Correlation IDs not added'],
    rubric: [
      { criterion: 'Log Structure Quality', score: 3, max: 4 },
      { criterion: 'Severity Classification', score: 2, max: 4 },
      { criterion: 'Correlation & Tracing', score: 1, max: 4 },
      { criterion: 'Documentation Clarity', score: 3, max: 4 },
    ],
  },
  {
    version: 2, submittedAt: 'Mar 18, 2025', score: 88, level: 'Proficient',
    strengths: ['Strong log structure', 'Clear severity levels', 'Good correlation IDs'],
    improvements: ['Could add more context to trace IDs'],
    rubric: [
      { criterion: 'Log Structure Quality', score: 4, max: 4 },
      { criterion: 'Severity Classification', score: 4, max: 4 },
      { criterion: 'Correlation & Tracing', score: 3, max: 4 },
      { criterion: 'Documentation Clarity', score: 3, max: 4 },
    ],
  },
];

/* ─────────────────────────── helpers ──────────────────────── */
function fmtDuration(secs?: number) {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  return m > 0 ? `${m}m` : `${secs}s`;
}

function contentIcon(type: ContentType, size = 16) {
  if (type === 'video') return <PlayCircle size={size} />;
  if (type === 'pdf')   return <FileText size={size} />;
  if (type === 'slide') return <Layers size={size} />;
  if (type === 'image') return <ImageIcon size={size} />;
  return <FileText size={size} />;
}

/* ─────────────────────────── component ────────────────────── */
export function CourseDetails() {
  const navigate = useNavigate();

  /* panel / view state */
  const [leftOpen, setLeftOpen]   = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [viewerActive, setViewerActive] = useState(false);
  const [learningMode, setLearningMode] = useState<'module' | 'problem' | null>(null);

  /* problem-mode artifact state */
  const [problemArtifacts, setProblemArtifacts] = useState([
    { id: 'pa1', no: 1, title: 'System Failure Investigation Report', module: 'System Failure Investigation', prompt: 'Production API latency increases during peak traffic.', status: 'submitted' as ArtifactStatus, score: 87, text: '' },
    { id: 'pa2', no: 2, title: 'Structured Logging Plan',            module: 'Structured Logging',            prompt: 'System failures lack traceability due to poor logging.', status: 'in_progress' as ArtifactStatus, score: 0,  text: '' },
    { id: 'pa3', no: 3, title: 'Debugging Trace & Root Cause',       module: 'Debugging Tools',               prompt: 'Backend bug crashes services in production.', status: 'not_started' as ArtifactStatus, score: 0,  text: '' },
    { id: 'pa4', no: 4, title: 'Bug Reproduction Plan',              module: 'Reproducing Bugs',              prompt: 'Intermittent production bug cannot be replicated.', status: 'not_started' as ArtifactStatus, score: 0,  text: '' },
    { id: 'pa5', no: 5, title: 'Root Cause Analysis Document',       module: 'Root Cause Analysis',           prompt: 'Engineers fix symptoms rather than root cause.', status: 'not_started' as ArtifactStatus, score: 0,  text: '' },
    { id: 'pa6', no: 6, title: 'Incident Resolution Capstone',        module: 'Observability Incident Resolution Capstone', prompt: 'Learners must investigate, diagnose, and resolve a realistic backend production incident using a full observability workflow.', status: 'not_started' as ArtifactStatus, score: 0,  text: '' },
  ]);
  const [activeProblemArtifactId, setActiveProblemArtifactId] = useState('pa2');

  /* navigation state */
  const [activeModuleId, setActiveModuleId]   = useState<string>('mod-002');
  const [activeStageKey, setActiveStageKey]   = useState<StageKey>('express');
  const [activeContentId, setActiveContentId] = useState<string>('c1');

  /* artifact / feedback state */
  const [artifactStatus, setArtifactStatus] = useState<ArtifactStatus>('in_progress');
  const [artifactText, setArtifactText]     = useState('');
  const [feedbackTab, setFeedbackTab]       = useState<'feedback' | 'attempts'>('feedback');
  const [activeAttempt, setActiveAttempt]   = useState(1);

  /* enter the 3-panel learning view */
  const enterViewer = (moduleId: string, stageKey: StageKey) => {
    const mod = MOCK_MODULES.find(m => m.id === moduleId);
    if (!mod || mod.status === 'locked') return;
    setActiveModuleId(moduleId);
    setActiveStageKey(stageKey);
    setActiveContentId('c1');
    setViewerActive(true);
    setRightOpen(true);
  };

  const activeModule = MOCK_MODULES.find(m => m.id === activeModuleId)!;
  const activeContent = MOCK_CONTENT.find(c => c.id === activeContentId);
  const stageMeta = STAGE_META[activeStageKey];
  const stagesArr: StageKey[] = ['engage', 'explore', 'explain', 'express', 'empower', 'evolve'];
  const stageIdx = stagesArr.indexOf(activeStageKey);
  const isArtifactStage = activeStageKey === 'express' || activeStageKey === 'empower';
  const hasSubmission = artifactStatus === 'submitted' || artifactStatus === 'under_review' || artifactStatus === 'completed';
  const latestSubmission = MOCK_SUBMISSIONS[activeAttempt - 1];

  const handleSubmit = () => {
    if (!artifactText.trim()) return;
    setArtifactStatus('submitted');
  };

  /* ── COURSE OVERVIEW (Mode A) ── */
  if (!viewerActive) {
    return (
      <div className="cd2-overview">
        {/* ── hero banner ── */}
        <div className="cd2-hero">
          <div className="cd2-hero-inner">
            <button className="cd2-back" onClick={() => navigate('/courses')}>
              <ArrowLeft size={16} /> My Courses
            </button>

            <div className="cd2-hero-content">
              <div className="cd2-hero-left">
                <div className="cd2-course-badge">Backend Engineering · Beginner</div>
                <h1 className="cd2-course-title">Debugging &amp; Observability<br />for Backend Systems</h1>
                <p className="cd2-course-desc">
                  Master production-grade debugging and observability strategies using real-world incident scenarios. Build from structured logging to full incident resolution.
                </p>
                <div className="cd2-hero-meta">
                  <span><Clock size={14}/> 45 hours total</span>
                  <span><Layers size={14}/> 6 modules</span>
                  <span><Target size={14}/> 6 artifacts</span>
                  <span><Award size={14}/> Certificate on completion</span>
                </div>
                <div className="cd2-hero-actions">
                  <button className="cd2-btn-primary" onClick={() => enterViewer('mod-002', 'express')}>
                    Continue Learning <ChevronRight size={16}/>
                  </button>
                  <button className="cd2-btn-ghost"><Share2 size={16}/> Share</button>
                  <button className="cd2-btn-icon"><MoreVertical size={16}/></button>
                </div>
              </div>

              <div className="cd2-hero-right">
                <div className="cd2-progress-card">
                  <div className="cd2-prog-header">
                    <span className="cd2-prog-label">Overall Progress</span>
                    <span className="cd2-prog-pct">33%</span>
                  </div>
                  <div className="cd2-prog-track">
                    <div className="cd2-prog-fill" style={{ width: '33%' }} />
                  </div>
                  <div className="cd2-prog-stats">
                    <div className="cd2-prog-stat">
                      <span className="cd2-prog-stat-val">1</span>
                      <span className="cd2-prog-stat-lbl">Completed</span>
                    </div>
                    <div className="cd2-prog-stat">
                      <span className="cd2-prog-stat-val">1</span>
                      <span className="cd2-prog-stat-lbl">In Progress</span>
                    </div>
                    <div className="cd2-prog-stat">
                      <span className="cd2-prog-stat-val">15 hrs</span>
                      <span className="cd2-prog-stat-lbl">Time Spent</span>
                    </div>
                  </div>
                  <div className="cd2-next-task">
                    <span className="cd2-next-label">Next Task</span>
                    <span className="cd2-next-val">Express Stage — Draft Logging Plan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── learning path selector ── */}
        <div className="cd2-path-selector">
          <div className="cd2-path-header">
            <h2 className="cd2-path-headline">Choose Your Learning Path</h2>
            <p className="cd2-path-sub">Both paths award the same certificate. Pick what works best for you.</p>
          </div>
          <div className="cd2-path-cards">
            {/* Problem Statement track */}
            <button
              className={`cd2-path-card ${learningMode === 'problem' ? 'cd2-path-card--active' : ''}`}
              onClick={() => setLearningMode(learningMode === 'problem' ? null : 'problem')}
            >
              <div className="cd2-path-card-icon cd2-path-card-icon--problem">🎯</div>
              <div className="cd2-path-card-body">
                <div className="cd2-path-card-badge">Recommended</div>
                <h3 className="cd2-path-card-title">Problem Statement Track</h3>
                <p className="cd2-path-card-desc">Start with the real-world problem. Submit 6 progressive artifacts to complete the course — no need to go through every module step by step.</p>
                <div className="cd2-path-card-meta">
                  <span>🗂 6 Artifacts</span>
                  <span>⚡ Fast track</span>
                  <span>🏆 Certificate</span>
                </div>
              </div>
              {learningMode === 'problem' && <div className="cd2-path-check"><CheckCircle2 size={18}/></div>}
            </button>

            {/* Module-by-Module track */}
            <button
              className={`cd2-path-card ${learningMode === 'module' ? 'cd2-path-card--active' : ''}`}
              onClick={() => setLearningMode(learningMode === 'module' ? null : 'module')}
            >
              <div className="cd2-path-card-icon cd2-path-card-icon--module">📚</div>
              <div className="cd2-path-card-body">
                <h3 className="cd2-path-card-title">Module-by-Module Track</h3>
                <p className="cd2-path-card-desc">Go through each module using the 6E framework — Engage, Explore, Explain, Express, Empower, Evolve — with guided content at every step.</p>
                <div className="cd2-path-card-meta">
                  <span>📖 6 Modules</span>
                  <span>🔬 Guided 6E stages</span>
                  <span>🏆 Certificate</span>
                </div>
              </div>
              {learningMode === 'module' && <div className="cd2-path-check"><CheckCircle2 size={18}/></div>}
            </button>
          </div>
        </div>

        {/* ── PROBLEM STATEMENT TRACK ── */}
        {learningMode === 'problem' && (() => {
          const active = problemArtifacts.find(a => a.id === activeProblemArtifactId)!;
          const submitArtifact = () => {
            if (!active.text.trim()) return;
            setProblemArtifacts(prev => prev.map(a =>
              a.id === activeProblemArtifactId ? { ...a, status: 'submitted' } : a
            ));
          };
          return (
            <div className="cd2-problem-track">
              {/* Problem statement banner */}
              <div className="cd2-problem-banner">
                <div className="cd2-problem-banner-left">
                  <div className="cd2-problem-label">Course Problem Statement</div>
                  <h3 className="cd2-problem-title">Production backend service begins failing under load</h3>
                  <p className="cd2-problem-body">
                    A production backend service begins failing under load and engineers must identify root causes using logs, debugging tools and structured investigation. Your task across 6 progressive artifacts is to investigate, diagnose, and fully resolve this incident using a professional observability workflow.
                  </p>
                </div>
                <div className="cd2-problem-progress">
                  <div className="cd2-problem-progress-num">
                    {problemArtifacts.filter(a => a.status === 'submitted' || a.status === 'completed').length}
                    <span>/{problemArtifacts.length}</span>
                  </div>
                  <div className="cd2-problem-progress-lbl">Artifacts Submitted</div>
                  <div className="cd2-prog-track" style={{ marginTop: 8 }}>
                    <div className="cd2-prog-fill" style={{ width: `${(problemArtifacts.filter(a => a.status === 'submitted' || a.status === 'completed').length / problemArtifacts.length) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* 6 artifact cards + active editor */}
              <div className="cd2-problem-layout">
                {/* left: artifact list */}
                <div className="cd2-problem-artifact-list">
                  {problemArtifacts.map((a, i) => {
                    const isLocked = i > 0 && problemArtifacts[i-1].status === 'not_started';
                    return (
                      <button
                        key={a.id}
                        className={`cd2-pa-item ${
                          a.id === activeProblemArtifactId ? 'active' : ''
                        } cd2-pa-item--${a.status}${isLocked ? ' cd2-pa-item--locked' : ''}`}
                        onClick={() => !isLocked && setActiveProblemArtifactId(a.id)}
                        disabled={isLocked}
                      >
                        <div className={`cd2-pa-num cd2-pa-num--${a.status}`}>
                          {a.status === 'submitted' || a.status === 'completed'
                            ? <CheckCircle2 size={14}/>
                            : a.no}
                        </div>
                        <div className="cd2-pa-info">
                          <span className="cd2-pa-module">{a.module}</span>
                          <span className="cd2-pa-title">{a.title}</span>
                        </div>
                        {a.status === 'submitted' && (
                          <span className="cd2-pa-score">{a.score}%</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* right: active artifact editor */}
                <div className="cd2-problem-editor">
                  <div className="cd2-problem-editor-header">
                    <div>
                      <div className="cd2-artifact-type">Artifact {active.no} of 6</div>
                      <h4 className="cd2-artifact-title">{active.title}</h4>
                      <p className="cd2-problem-editor-sub">{active.module}</p>
                    </div>
                    <div className={`cd2-artifact-status cd2-artifact-status--${active.status}`}>
                      {active.status === 'not_started' && 'Not Started'}
                      {active.status === 'in_progress' && 'In Progress'}
                      {active.status === 'submitted' && '✓ Submitted'}
                      {active.status === 'completed' && '✓ Completed'}
                    </div>
                  </div>

                  <div className="cd2-problem-editor-prompt">
                    <span className="cd2-problem-prompt-label">Your Task</span>
                    <p className="cd2-problem-prompt-text">{active.prompt}</p>
                    <p>Provide a structured, professional response that demonstrates your understanding and practical application of the concepts for this phase.</p>
                  </div>

                  {active.status !== 'submitted' && active.status !== 'completed' ? (
                    <>
                      <textarea
                        className="cd2-artifact-textarea"
                        style={{ minHeight: 200 }}
                        placeholder={`Write your ${active.title} here...`}
                        value={active.text}
                        onChange={e => setProblemArtifacts(prev => prev.map(a =>
                          a.id === activeProblemArtifactId ? { ...a, text: e.target.value, status: 'in_progress' } : a
                        ))}
                        rows={10}
                      />
                      <div className="cd2-artifact-footer">
                        <button className="cd2-btn-sm-ghost"><Download size={13}/> Download Template</button>
                        <button
                          className="cd2-btn-sm-primary"
                          onClick={submitArtifact}
                          disabled={!active.text.trim()}
                        >
                          <Send size={13}/> Submit Artifact
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="cd2-submitted-state">
                      <div className="cd2-submitted-icon"><CheckCircle2 size={20}/></div>
                      <div>
                        <div className="cd2-submitted-title">Artifact Submitted</div>
                        <div className="cd2-submitted-sub">Feedback will appear here once reviewed</div>
                      </div>
                      {active.score > 0 && (
                        <div className="cd2-pa-score" style={{ fontSize: '1.1rem' }}>{active.score}%</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── MODULE TRACK ── */}
        {learningMode === 'module' && (
          <div className="cd2-modules-section">
          <div className="cd2-modules-header">
            <h2 className="cd2-modules-title">Course Modules</h2>
            <span className="cd2-modules-sub">6 modules · 6E Problem-Based Learning</span>
          </div>

          <div className="cd2-modules-list">
            {MOCK_MODULES.map(mod => (
              <div
                key={mod.id}
                className={`cd2-module-row cd2-module-row--${mod.status}`}
              >
                {/* left: number + status */}
                <div className="cd2-mod-num-col">
                  <div className={`cd2-mod-num cd2-mod-num--${mod.status}`}>
                    {mod.status === 'completed' ? <CheckCircle2 size={18}/> :
                     mod.status === 'locked' ? <Lock size={16}/> :
                     <span>{mod.module_no}</span>}
                  </div>
                  {mod.module_no < MOCK_MODULES.length && (
                    <div className={`cd2-mod-line ${mod.status === 'completed' ? 'filled' : ''}`}/>
                  )}
                </div>

                {/* center: info */}
                <div className="cd2-mod-info">
                  <div className="cd2-mod-top-row">
                    <div>
                      <div className="cd2-mod-workflow">{mod.engineering_workflow_stage}</div>
                      <h3 className="cd2-mod-title">{mod.title}</h3>
                      <p className="cd2-mod-desc">{mod.description}</p>
                    </div>
                    <div className="cd2-mod-right">
                      {mod.status === 'completed' && (
                        <div className="cd2-mod-score">
                          <BarChart3 size={14}/> {mod.score}%
                        </div>
                      )}
                      <div className="cd2-mod-time"><Clock size={12}/> {mod.estimatedTime}</div>
                    </div>
                  </div>

                  {/* detailed JSON data points — redesigned info cards */}
                  <div className="cd2-mod-info-cards">
                    {mod.learning_content && (
                      <div className="cd2-info-card cd2-info-card--concepts">
                        <div className="cd2-info-card-tag">
                          <span className="cd2-info-card-dot cd2-info-card-dot--concepts" />
                          Major Concepts
                        </div>
                        <p className="cd2-info-card-text">{mod.learning_content.major_concepts}</p>
                      </div>
                    )}
                    {mod.module_specific_problem_statement && (
                      <div className="cd2-info-card cd2-info-card--problem">
                        <div className="cd2-info-card-tag">
                          <span className="cd2-info-card-dot cd2-info-card-dot--problem" />
                          Problem Statement
                        </div>
                        <p className="cd2-info-card-text">{mod.module_specific_problem_statement}</p>
                      </div>
                    )}
                    {mod.pressure_points && (
                      <div className="cd2-info-card cd2-info-card--pressure">
                        <div className="cd2-info-card-tag">
                          <span className="cd2-info-card-dot cd2-info-card-dot--pressure" />
                          Pressure Points
                        </div>
                        <p className="cd2-info-card-text">{mod.pressure_points}</p>
                      </div>
                    )}
                  </div>

                  {/* 6E stage pills */}
                  {mod.status !== 'locked' && (
                    <div className="cd2-stage-pills">
                      {mod.stages.map(stage => (
                        <button
                          key={stage.key}
                          className={`cd2-stage-pill cd2-stage-pill--${stage.status}`}
                          onClick={() => enterViewer(mod.id, stage.key)}
                          title={STAGE_META[stage.key].description}
                        >
                          {stage.status === 'completed' && <CheckCircle2 size={11}/>}
                          {STAGE_META[stage.key].icon}
                          {stage.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* action buttons */}
                  <div className="cd2-mod-actions">
                    {mod.status === 'completed' && (
                      <>
                        <button className="cd2-btn-sm-outline" onClick={() => enterViewer(mod.id, 'engage')}>
                          Review Module
                        </button>
                        <button className="cd2-btn-sm-ghost">View Artifacts &amp; Feedback</button>
                      </>
                    )}
                    {mod.status === 'in_progress' && (
                      <>
                        <button className="cd2-btn-sm-primary" onClick={() => enterViewer(mod.id, 'express')}>
                          Continue <ChevronRight size={14}/>
                        </button>
                        <button className="cd2-btn-sm-ghost" onClick={() => enterViewer(mod.id, 'engage')}>
                          View All Stages
                        </button>
                      </>
                    )}
                    {mod.status === 'available' && (
                      <button className="cd2-btn-sm-outline" onClick={() => enterViewer(mod.id, 'engage')}>
                        Start Module <ChevronRight size={14}/>
                      </button>
                    )}
                    {mod.status === 'locked' && (
                      <span className="cd2-mod-locked-hint">
                        <Lock size={12}/> Complete previous module to unlock
                      </span>
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

  /* ── STAGE VIEWER (Mode B) — 3-panel layout ── */
  return (
    <div className="cd2-viewer">
      {/* ── top bar ── */}
      <div className="cd2-viewer-topbar">
        <div className="cd2-topbar-left">
          <button className="cd2-back-viewer" onClick={() => setViewerActive(false)}>
            <ArrowLeft size={15}/> Overview
          </button>
          <span className="cd2-topbar-sep">/</span>
          <span className="cd2-topbar-module">{activeModule?.title}</span>
          <span className="cd2-topbar-sep">/</span>
          <span className="cd2-topbar-stage" style={{ color: stageMeta.color }}>
            {stageMeta.icon} {stageMeta.label}
          </span>
        </div>
        <div className="cd2-topbar-right">
          <button className="cd2-topbar-icon" onClick={() => setLeftOpen(p => !p)} title="Toggle modules">
            <PanelLeftClose size={16}/>
          </button>
          <button className="cd2-topbar-icon" onClick={() => setRightOpen(p => !p)} title="Toggle panel">
            <PanelRightClose size={16}/>
          </button>
          <button className="cd2-topbar-icon"><Share2 size={16}/></button>
          <button className="cd2-topbar-icon"><MoreVertical size={16}/></button>
        </div>
      </div>

      {/* ── 6E stage stepper ── */}
      <div className="cd2-stage-stepper">
        {stagesArr.map((key, i) => {
          const s = activeModule.stages.find(st => st.key === key)!;
          const isActive = key === activeStageKey;
          const meta = STAGE_META[key];
          return (
            <button
              key={key}
              className={`cd2-stepper-step ${isActive ? 'active' : s?.status === 'completed' ? 'completed' : 'pending'}`}
              style={isActive ? { borderColor: meta.color, color: meta.color } as React.CSSProperties : {}}
              onClick={() => setActiveStageKey(key)}
            >
              <span className="cd2-stepper-icon">{meta.icon}</span>
              <span className="cd2-stepper-label">{meta.label}</span>
              {s?.status === 'completed' && !isActive && (
                <CheckCircle2 size={11} className="cd2-stepper-check"/>
              )}
              {i < stagesArr.length - 1 && (
                <div className={`cd2-stepper-connector ${s?.status === 'completed' ? 'filled' : ''}`}/>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3-panel body ── */}
      <div className="cd2-panels">

        {/* ── LEFT: Module Navigator ── */}
        {leftOpen && (
          <aside className="cd2-panel-left">
            <div className="cd2-panel-left-header">
              <span>Modules</span>
              <button className="cd2-panel-close" onClick={() => setLeftOpen(false)}><X size={14}/></button>
            </div>
            <div className="cd2-module-nav">
              {MOCK_MODULES.map(mod => (
                <div
                  key={mod.id}
                  className={`cd2-nav-module ${mod.id === activeModuleId ? 'active' : ''} ${mod.status}`}
                  onClick={() => mod.status !== 'locked' && enterViewer(mod.id, mod.stages.find(s => s.status === 'active')?.key || 'engage')}
                >
                  <div className="cd2-nav-mod-header">
                    <div className={`cd2-nav-dot cd2-nav-dot--${mod.status}`}>
                      {mod.status === 'completed' && <CheckCircle2 size={12}/>}
                      {mod.status === 'locked' && <Lock size={10}/>}
                      {(mod.status === 'in_progress' || mod.status === 'available') && <span>{mod.module_no}</span>}
                    </div>
                    <div className="cd2-nav-mod-info">
                      <span className="cd2-nav-mod-title">{mod.title}</span>
                      <span className="cd2-nav-mod-pct">{mod.completion_percentage}%</span>
                    </div>
                  </div>
                  {/* mini stage dots */}
                  {mod.id === activeModuleId && (
                    <div className="cd2-nav-stages">
                      {mod.stages.map(st => (
                        <button
                          key={st.key}
                          className={`cd2-nav-stage-dot ${st.key === activeStageKey ? 'active' : st.status}`}
                          onClick={e => { e.stopPropagation(); setActiveStageKey(st.key); }}
                          style={st.key === activeStageKey ? { background: STAGE_META[st.key].color } as React.CSSProperties : {}}
                          title={STAGE_META[st.key].label}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* ── CENTER: Content Viewer ── */}
        <main className="cd2-panel-center">
          {/* content selector tabs */}
          <div className="cd2-content-tabs">
            {MOCK_CONTENT.map(item => (
              <button
                key={item.id}
                className={`cd2-content-tab ${activeContentId === item.id ? 'active' : ''}`}
                onClick={() => setActiveContentId(item.id)}
              >
                {contentIcon(item.type, 13)}
                <span className="cd2-content-tab-title">{item.title}</span>
                {item.isViewed && <div className="cd2-viewed-dot"/>}
                {item.duration_seconds && (
                  <span className="cd2-content-tab-dur">{fmtDuration(item.duration_seconds)}</span>
                )}
              </button>
            ))}
          </div>

          {/* content viewer area */}
          <div className="cd2-content-viewer">
            <div className="cd2-content-viewer-header">
              <div>
                <h3 className="cd2-content-title">{activeContent?.title}</h3>
                <span className="cd2-content-meta">
                  {stageMeta.icon} {stageMeta.label} · {activeContent?.type?.toUpperCase()}
                  {activeContent?.duration_seconds ? ` · ${fmtDuration(activeContent.duration_seconds)}` : ''}
                </span>
              </div>
              <div className="cd2-content-acts">
                <button className="cd2-topbar-icon"><Download size={15}/></button>
                <button className="cd2-topbar-icon"><Maximize2 size={15}/></button>
              </div>
            </div>

            <div className="cd2-content-body">
              {activeContent?.type === 'video' && (
                <div className="cd2-video-placeholder">
                  <div className="cd2-video-inner">
                    <div className="cd2-play-btn"><PlayCircle size={52}/></div>
                    <p className="cd2-video-label">{activeContent.title}</p>
                  </div>
                </div>
              )}
              {activeContent?.type === 'pdf' && (
                <div className="cd2-doc-placeholder">
                  <FileText size={48} className="cd2-doc-icon"/>
                  <p>{activeContent.title}</p>
                  <button className="cd2-btn-sm-outline"><Download size={13}/> Download PDF</button>
                </div>
              )}
              {(activeContent?.type === 'slide' || activeContent?.type === 'image') && (
                <div className="cd2-doc-placeholder">
                  <Layers size={48} className="cd2-doc-icon"/>
                  <p>{activeContent?.title}</p>
                </div>
              )}
            </div>

            {/* stage context card */}
            <div className="cd2-stage-context" style={{ borderColor: `${stageMeta.color}30` } as React.CSSProperties}>
              <div className="cd2-stage-context-badge" style={{ background: `${stageMeta.color}18`, color: stageMeta.color } as React.CSSProperties}>
                {stageMeta.icon} {stageMeta.label}
              </div>
              <p className="cd2-stage-context-desc">{stageMeta.description}</p>
            </div>
          </div>

          {/* footer nav */}
          <div className="cd2-content-footer">
            <button
              className="cd2-btn-nav"
              disabled={stageIdx === 0}
              onClick={() => setActiveStageKey(stagesArr[stageIdx - 1])}
            >
              <ChevronLeft size={16}/> Previous Stage
            </button>
            <div className="cd2-footer-progress">
              {stagesArr.map((k, i) => (
                <div
                  key={k}
                  className={`cd2-footer-dot ${i === stageIdx ? 'active' : activeModule.stages[i]?.status === 'completed' ? 'done' : ''}`}
                />
              ))}
            </div>
            <button
              className="cd2-btn-primary"
              disabled={stageIdx === stagesArr.length - 1}
              onClick={() => setActiveStageKey(stagesArr[stageIdx + 1])}
            >
              Next Stage <ChevronRight size={16}/>
            </button>
          </div>
        </main>

        {/* ── RIGHT: Artifact + Feedback Panel ── */}
        {rightOpen && (
          <aside className="cd2-panel-right">
            <div className="cd2-panel-right-header">
              <div className="cd2-panel-right-tabs">
                <button
                  className={`cd2-panel-tab ${feedbackTab === 'feedback' ? 'active' : ''}`}
                  onClick={() => setFeedbackTab('feedback')}
                >
                  {isArtifactStage ? 'Artifact' : 'Stage Info'}
                </button>
                {hasSubmission && (
                  <button
                    className={`cd2-panel-tab ${feedbackTab === 'attempts' ? 'active' : ''}`}
                    onClick={() => setFeedbackTab('attempts')}
                  >
                    Feedback <span className="cd2-badge">{MOCK_SUBMISSIONS.length}</span>
                  </button>
                )}
              </div>
              <button className="cd2-panel-close" onClick={() => setRightOpen(false)}><X size={14}/></button>
            </div>

            {feedbackTab === 'feedback' && isArtifactStage && (
              <div className="cd2-panel-body">
                {/* artifact card */}
                <div className="cd2-artifact-card">
                  <div className="cd2-artifact-header">
                    <div>
                      <div className="cd2-artifact-type">
                        {activeStageKey === 'express' ? 'Practice Artifact' : 'Final Artifact'}
                      </div>
                      <h4 className="cd2-artifact-title">
                        {activeStageKey === 'express'
                          ? 'Draft a Structured Logging Plan'
                          : 'Final Logging Implementation Report'}
                      </h4>
                    </div>
                    <div className={`cd2-artifact-status cd2-artifact-status--${artifactStatus}`}>
                      {artifactStatus === 'in_progress' && 'In Progress'}
                      {artifactStatus === 'submitted' && '✓ Submitted'}
                      {artifactStatus === 'under_review' && 'Under Review'}
                      {artifactStatus === 'completed' && '✓ Completed'}
                    </div>
                  </div>

                  <p className="cd2-artifact-prompt">
                    Analyze the provided log samples and design a structured logging schema for the failing API service. Include severity levels, correlation IDs, and trace context fields.
                  </p>

                  {!hasSubmission ? (
                    <>
                      <textarea
                        className="cd2-artifact-textarea"
                        placeholder="Write your logging plan here..."
                        value={artifactText}
                        onChange={e => setArtifactText(e.target.value)}
                        rows={8}
                      />
                      <div className="cd2-artifact-footer">
                        <button className="cd2-btn-sm-ghost"><Download size={13}/> Template</button>
                        <button
                          className="cd2-btn-sm-primary"
                          onClick={handleSubmit}
                          disabled={!artifactText.trim()}
                        >
                          <Send size={13}/> Submit
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="cd2-submitted-state">
                      <div className="cd2-submitted-icon"><CheckCircle2 size={20}/></div>
                      <div>
                        <div className="cd2-submitted-title">Submitted for review</div>
                        <div className="cd2-submitted-sub">Feedback will appear in the Feedback tab</div>
                      </div>
                      <button className="cd2-btn-sm-ghost" onClick={() => { setArtifactStatus('in_progress'); setArtifactText(''); }}>
                        <RefreshCw size={12}/> Resubmit
                      </button>
                    </div>
                  )}
                </div>

                {/* rubric preview */}
                <div className="cd2-rubric-preview">
                  <h5 className="cd2-rubric-title">Evaluation Rubric</h5>
                  {['Log Structure Quality', 'Severity Classification', 'Correlation & Tracing', 'Documentation Clarity'].map(c => (
                    <div key={c} className="cd2-rubric-row">
                      <span className="cd2-rubric-criterion">{c}</span>
                      <div className="cd2-rubric-dots">
                        {[1,2,3,4].map(n => <div key={n} className="cd2-rubric-dot"/>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feedbackTab === 'feedback' && !isArtifactStage && (
              <div className="cd2-panel-body">
                <div className="cd2-stage-info-card">
                  <h4 style={{ color: stageMeta.color }}>{stageMeta.label}</h4>
                  <p className="cd2-stage-info-desc">{stageMeta.description}</p>
                  <div className="cd2-stage-info-row">
                    <Clock size={13}/> Est. 20–30 minutes
                  </div>
                  <div className="cd2-stage-info-row">
                    <Target size={13}/> {MOCK_CONTENT.length} content items
                  </div>
                </div>
                <div className="cd2-ask-ai-card">
                  <MessageSquare size={16} className="cd2-ai-icon"/>
                  <div>
                    <div className="cd2-ai-title">Ask AI Tutor</div>
                    <div className="cd2-ai-sub">Get help understanding this stage</div>
                  </div>
                  <button className="cd2-btn-sm-outline">Ask</button>
                </div>
              </div>
            )}

            {feedbackTab === 'attempts' && (
              <div className="cd2-panel-body">
                {/* attempt selector */}
                <div className="cd2-attempt-tabs">
                  {MOCK_SUBMISSIONS.map((s, i) => (
                    <button
                      key={s.version}
                      className={`cd2-attempt-tab ${activeAttempt === i + 1 ? 'active' : ''}`}
                      onClick={() => setActiveAttempt(i + 1)}
                    >
                      v{s.version} <span className="cd2-attempt-score">{s.score}%</span>
                    </button>
                  ))}
                </div>

                {latestSubmission && (
                  <>
                    {/* score header */}
                    <div className="cd2-score-header">
                      <div className="cd2-score-ring">
                        <svg width="72" height="72" viewBox="0 0 72 72">
                          <circle cx="36" cy="36" r="28" fill="none" stroke="#eef2f6" strokeWidth="6"/>
                          <circle
                            cx="36" cy="36" r="28" fill="none"
                            stroke={latestSubmission.score >= 80 ? '#10b981' : latestSubmission.score >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${(latestSubmission.score / 100) * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                            transform="rotate(-90 36 36)"
                          />
                        </svg>
                        <div className="cd2-score-num">{latestSubmission.score}</div>
                      </div>
                      <div>
                        <div className="cd2-score-level">{latestSubmission.level}</div>
                        <div className="cd2-score-date">Submitted {latestSubmission.submittedAt}</div>
                      </div>
                    </div>

                    {/* strengths & improvements */}
                    <div className="cd2-feedback-cols">
                      <div className="cd2-feedback-col cd2-feedback-col--green">
                        <div className="cd2-feedback-col-header">✓ Strengths</div>
                        <ul>
                          {latestSubmission.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="cd2-feedback-col cd2-feedback-col--amber">
                        <div className="cd2-feedback-col-header">↑ Improvements</div>
                        <ul>
                          {latestSubmission.improvements.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* rubric scores */}
                    <div className="cd2-rubric-feedback">
                      <h5 className="cd2-rubric-title">Rubric Breakdown</h5>
                      {latestSubmission.rubric.map(r => (
                        <div key={r.criterion} className="cd2-rubric-score-row">
                          <div className="cd2-rubric-score-top">
                            <span>{r.criterion}</span>
                            <span className="cd2-rubric-score-val">{r.score}/{r.max}</span>
                          </div>
                          <div className="cd2-rubric-track">
                            <div
                              className="cd2-rubric-fill"
                              style={{
                                width: `${(r.score / r.max) * 100}%`,
                                background: r.score / r.max >= 0.75 ? '#10b981' : r.score / r.max >= 0.5 ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cd2-feedback-actions">
                      <button className="cd2-btn-sm-outline" onClick={() => { setFeedbackTab('feedback'); setArtifactStatus('in_progress'); setArtifactText(''); }}>
                        <RefreshCw size={13}/> Resubmit
                      </button>
                      <button className="cd2-btn-sm-primary" onClick={() => setActiveStageKey(stagesArr[stageIdx + 1])}>
                        Next Stage <ChevronRight size={13}/>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* AI chat bubble */}
            <button className="cd2-ai-fab" title="Ask AI Tutor">
              <MessageSquare size={18}/>
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}
