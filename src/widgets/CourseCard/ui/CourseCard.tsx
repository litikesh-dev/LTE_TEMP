import { useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Zap,
  Award,
  Info,
} from 'lucide-react';
import './CourseCard.css';

/* ─────────────────────────── types ──────────────────────────── */
export interface CourseCardProps {
  id: string;
  course_id: string;
  title: string;
  course_code: string;
  description?: string;
  thumbnail_url?: string;
  job_pathway_role: string;
  duration: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  relevance_score?: number;
  match_reason?: string;
  why_recommended?: string;
  sequence_no?: number;
  mode?: 'dashboard' | 'grid' | 'list';
  // New fields from schema
  domain_name?: string;
  certification_value?: string;
  common_course_problem_statement?: string;
  current_level?: number;
  required_level?: number;
}

const TOTAL_LEVELS = 5;

/* ─────────────────────────── helpers ────────────────────────── */
const DIFFICULTY_META: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: '#10b981', bg: '#ecfdf5' },
  'beginner-plus': { label: 'Beginner+', color: '#059669', bg: '#ecfdf5' },
  intermediate: { label: 'Intermediate', color: '#f59e0b', bg: '#fffbeb' },
  'advanced-intermediate': { label: 'Advanced Intermediate', color: '#f97316', bg: '#fff7ed' },
  advanced: { label: 'Advanced', color: '#ef4444', bg: '#fef2f2' },
};

const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

function getGradient(courseCode: string) {
  let hash = 0;
  for (let i = 0; i < courseCode.length; i++)
    hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
  return THUMB_GRADIENTS[Math.abs(hash) % THUMB_GRADIENTS.length];
}

function ProgressRing({ value, size = 36 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value === 100 ? '#10b981' : value > 0 ? '#6366f1' : '#e2e8f0';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="3" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

/* ─────────────────────────── main widget ─────────────────────── */
export function CourseCard(props: CourseCardProps) {
  const navigate = useNavigate();

  const {
    id,
    course_id,
    title,
    course_code,
    thumbnail_url,
    duration,
    difficulty_level,
    status,
    completion_percentage,
    relevance_score,
    match_reason,
    sequence_no,
    mode = 'dashboard',
    certification_value,
    current_level,
    required_level,
  } = props;

  const diffMeta =
    DIFFICULTY_META[String(difficulty_level).toLowerCase() as keyof typeof DIFFICULTY_META] ??
    DIFFICULTY_META.beginner;
  const gradient = getGradient(course_code);

  const handleClick = () => navigate(`/courses/${course_id || id}`);

  return (
    <article
      className={`cc-card cc-card--${mode} cc-card--${status}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
      {/* ── Thumbnail ── */}
      <div className="cc-thumb">
        {thumbnail_url ? (
          <img src={thumbnail_url} alt={title} className="cc-thumb-img" />
        ) : (
          <div className="cc-thumb-gradient" style={{ background: gradient }}>
            <div className="cc-thumb-pattern" />
            <BookOpen size={32} className="cc-thumb-icon" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="cc-thumb-overlay">
          <span className="cc-code-badge">{course_code}</span>
          {sequence_no && <span className="cc-seq-badge">#{sequence_no}</span>}
        </div>

        {/* Status strip */}
        {status === 'in_progress' && (
          <div className="cc-progress-strip">
            <div className="cc-progress-fill" style={{ width: `${completion_percentage}%` }} />
          </div>
        )}
        {status === 'completed' && (
          <div className="cc-completed-overlay">
            <CheckCircle2 size={20} />
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="cc-body">
        {/* Title */}
        <h3 className="cc-title" title={title}>
          {title}
        </h3>

        {/* Certification badge */}
        {certification_value && (
          <div className="cc-cert-badge" title={certification_value}>
            <Award size={11} />
            <span>{certification_value}</span>
          </div>
        )}

        {/* Meta row */}
        <div className="cc-meta-row">
          <span className="cc-meta-item">
            <Clock size={12} />
            {duration}
          </span>
          <span
            className="cc-difficulty-badge"
            style={{ color: diffMeta.color, background: diffMeta.bg }}
          >
            {diffMeta.label}
          </span>
        </div>

        {/* Stats */}
        {relevance_score !== undefined && (
          <div className="cc-stats">
            <div className="cc-stat">
              <ProgressRing value={relevance_score} size={36} />
              <div className="cc-stat-text">
                <span className="cc-stat-val">{relevance_score}%</span>
                <span className="cc-stat-lbl">Relevance</span>
              </div>
            </div>
          </div>
        )}

        {/* Why recommended */}
        {match_reason && (
          <div className="cc-match-reason">
            <Zap size={11} />
            <span>{match_reason}</span>
          </div>
        )}

        {/* Level bar — pinned to the bottom, just above the CTA */}
        {current_level !== undefined && (
          <div className="cc-level">
            <div className="cc-level-head">
              <span className="cc-level-label">
                Level {current_level} of {TOTAL_LEVELS}
                <Info size={11} className="cc-level-info" />
              </span>
              {required_level !== undefined && (
                <span className="cc-level-target">TARGET: L{required_level}</span>
              )}
            </div>
            <div className="cc-level-track">
              {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map(lvl => (
                <span
                  key={lvl}
                  className={`cc-level-seg${lvl <= current_level ? ' cc-level-seg--filled' : ''}${
                    required_level !== undefined && lvl === required_level ? ' cc-level-seg--target' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button className="cc-cta">
          {status === 'not_started'
            ? 'Start Course'
            : status === 'completed'
              ? 'Review'
              : 'Continue'}
          <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}
