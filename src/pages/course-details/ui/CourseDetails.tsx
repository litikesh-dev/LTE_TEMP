import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Target,
  Award,
  BarChart3,
  Layers,
  BookOpen,
  AlertCircle,
  Info,
  Bookmark,
  Share2,
  FlaskConical,
  GraduationCap,
  FolderOpen,
  Microscope,
  Zap,
  Send,
  Download,
  Lightbulb,
  Code2,
  TrendingUp,
} from 'lucide-react';
import './course-details.css';
import { loadCourseContent } from '@/shared/api/configLoader';

/* ═══════════════════════════════════════════════════════════════
   TYPES  (aligned with JSON schemas)
   ═══════════════════════════════════════════════════════════════ */

type StageKey = 'engage' | 'explore' | 'explain' | 'express' | 'empower' | 'evolve';
type StageStatus = 'completed' | 'in_progress' | 'not_started';
type ModStatus = 'completed' | 'in_progress' | 'available';

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

// module_artifacts row — used in ModuleContent
// interface ModuleArtifact is defined in ModuleContent.tsx

// 6e_content row — used in ModuleContent
// interface ContentItem is defined in ModuleContent.tsx

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


function fmtTime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA  (structured exactly like DB rows)
   ═══════════════════════════════════════════════════════════════ */

/* ── Course content comes entirely from the DB (accounts.course_content via
   loadCourseContent()). No built-in demo data. ── */
interface ConfigCourse {
  id: string;
  course_id?: string;
  title?: string;
  description?: string;
  job_pathway_role?: string;
  domain_name?: string;
  difficulty_level?: string;
  duration?: string;
  certification_value?: string;
  problem_statement?: { title: string; description: string };
  problem_artifacts?: ProblemArtifact[];
  modules?: ModuleProg[];
}

function cap(s?: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
const CONFIG_COURSES = loadCourseContent() as ConfigCourse[];

function getConfigCourse(courseId?: string): ConfigCourse | undefined {
  if (!CONFIG_COURSES.length) return undefined;
  return CONFIG_COURSES.find(c => c.id === courseId || c.course_id === courseId) ?? CONFIG_COURSES[0];
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function CourseDetails() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  /* ── Learning mode ── */
  const [learningMode, setLearningMode] = useState<'module' | 'problem' | null>('module');

  /* ── Problem track state (config-driven, falls back to built-in) ── */
  const configCourse = getConfigCourse(courseId);

  /* ── Module data — entirely from the DB (course_content for this course). ── */
  const modules: ModuleProg[] = configCourse?.modules ?? [];
  const initProblemArtifacts = configCourse?.problem_artifacts ?? [];
  const problemBanner =
    configCourse?.problem_statement?.title
      ? configCourse.problem_statement
      : { title: configCourse?.title || '', description: configCourse?.description || '' };

  /* ── Hero (driven entirely by the resolved course from the DB) ── */
  const heroTitle = configCourse?.title || '';
  const heroDesc = configCourse?.description || '';
  const heroTag = configCourse?.job_pathway_role || configCourse?.domain_name || '';
  const heroLevel = cap(configCourse?.difficulty_level) || '';
  const heroDuration = configCourse?.duration || '';
  const heroCert = configCourse?.certification_value || '';

  const [problemArtifacts, setProblemArtifacts] =
    useState<ProblemArtifact[]>(initProblemArtifacts);
  const [activeProblemId, setActiveProblemId] = useState(initProblemArtifacts[0]?.id ?? 'pa1');

  /* ── Derived course stats ── */
  const completedMods = modules.filter(m => m.status === 'completed').length;
  const overallPct = modules.length
    ? Math.round(modules.reduce((a, m) => a + m.completion_percentage, 0) / modules.length)
    : 0;

  /* ── Navigate to module content page ── */
  const enterViewer = (modId: string, stage: StageKey) => {
    navigate(`/courses/${courseId}/modules/${modId}?stage=${stage}`);
  };

  /* ═════════════════════════════════════════════════
     COURSE OVERVIEW
     ═════════════════════════════════════════════════ */
  const activeProblem = problemArtifacts.find(a => a.id === activeProblemId) ?? null;

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
                  <span className="cd-hero-tag">{heroTag}</span>
                  <span className="cd-hero-tag cd-hero-tag--level">{heroLevel}</span>
                </div>
                <h1 className="cd-hero-title">{heroTitle}</h1>
                <p className="cd-hero-desc">{heroDesc}</p>
                <div className="cd-hero-meta">
                  <span>
                    <Clock size={13} /> {heroDuration}
                  </span>
                  <span>
                    <Layers size={13} /> {modules.length} modules
                  </span>
                  <span>
                    <Target size={13} /> {problemArtifacts.length} artifacts
                  </span>
                  <span>
                    <Award size={13} /> {heroCert}
                  </span>
                </div>
                <div className="cd-hero-actions">
                  <button
                    className="cd-btn-primary"
                    disabled={modules.length === 0}
                    onClick={() => modules[0] && enterViewer(modules[0].id, 'explain')}
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
                <h3>{problemBanner.title}</h3>
                <p>{problemBanner.description}</p>
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
                {activeProblem ? (
                <>
                <div className="cd-prob-editor-header">
                  <div>
                    <span className="cd-prob-artifact-no">Artifact {activeProblem.no} of {problemArtifacts.length}</span>
                    <h4 className="cd-prob-artifact-title">{activeProblem.title}</h4>
                    <p className="cd-prob-artifact-mod">{activeProblem.module}</p>
                  </div>
                  <div className="cd-prob-header-actions">
                    {(() => {
                      const mod =
                        modules.find(m => m.module_no === activeProblem.no) ??
                        modules[activeProblem.no - 1];
                      return mod ? (
                        <button
                          className="cd-prob-goto-btn"
                          onClick={() => enterViewer(mod.id, 'engage')}
                          title={`Go to module: ${mod.title}`}
                        >
                          <BookOpen size={13} /> Go to Module
                        </button>
                      ) : null;
                    })()}
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
                </>
                ) : (
                  <div className="cd-prob-empty">
                    No problem artifacts have been defined for this course yet.
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
              <span>{modules.length} modules · 6E Problem-Based Learning Framework</span>
            </div>

            {modules.length === 0 && (
              <div className="cd-prob-empty">
                Modules for this course are coming soon.
              </div>
            )}

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
                      {mod.status === 'completed' && (
                        <div className="cd-mod-completed-pill">
                          <CheckCircle2 size={12} /> Completed
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
