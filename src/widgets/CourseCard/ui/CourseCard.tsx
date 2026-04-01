import { useNavigate } from 'react-router-dom';
import { FileText, BookOpen, CheckCircle2, MoreVertical, Info } from 'lucide-react';
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
  mode?: 'dashboard' | 'grid' | 'list';
}

/* ─────────────────────────── sub-components ─────────────────── */

function CircularProgress({ value, label }: { value: number; label: string }) {
  const radius = 11;
  const circ = 2 * Math.PI * radius;
  const dash = (value / 100) * circ;
  const color = value === 100 ? '#10b981' : value > 0 ? '#6366f1' : '#e0e7ff';

  return (
    <div className="dash-stat-info-mini">
      <div className="dash-mini-ring-wrap">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r={radius} fill="none" stroke="#e0e7ff" strokeWidth="3" />
          <circle
            cx="14"
            cy="14"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform="rotate(-90 14 14)"
          />
        </svg>
      </div>
      <div className="dash-mini-ring-text">
        <span className="dash-mini-lbl">
          {label} <Info size={10} className="dash-info-icon" />
        </span>
        <span className="dash-mini-val">{value > 0 ? `${value}%` : value === 0 ? '0%' : '-'}</span>
      </div>
    </div>
  );
}

function CourseIllustration({ color }: { color: string }) {
  return (
    <div className="enroll-thumb" style={{ background: color }}>
      <div className="enroll-thumb-deco">
        <div className="eth-rect eth-rect-1" />
        <div className="eth-rect eth-rect-2" />
        <div className="eth-circle" />
        <div className="eth-line" />
        <div className="eth-line eth-line-2" />
      </div>
    </div>
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
    job_pathway_role,
    duration,
    difficulty_level,
    status,
    completion_percentage,
    relevance_score,
    match_reason,
    mode = 'dashboard',
  } = props;

  const handleCardClick = () => {
    navigate(`/courses/${course_id || id}`);
  };

  return (
    <div
      className={`dash-enroll-card dash-enroll-card--${mode} dash-enroll-card--clickable`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick();
      }}
    >
      <div className="dash-enroll-thumb-wrap">
        {thumbnail_url ? (
          <img src={thumbnail_url} alt={title} className="dash-enroll-img" />
        ) : (
          <CourseIllustration color="#7c6af7" />
        )}
        
        <div className="dash-mat-badge dash-mat-badge--top">{course_code}</div>
        
        <div className="dash-mat-badge">
          <FileText size={10} /> {duration}
        </div>

        <button
          className="dash-card-more"
          onClick={e => e.stopPropagation()}
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="dash-enroll-body">
        <div className="dash-enroll-type-row">
          <span className="dash-ip-type">
            <BookOpen size={11} /> {job_pathway_role}
          </span>
        </div>
        <h3 className="dash-enroll-title" title={title}>
          {title}
        </h3>

        <div className="dash-card-stats">
          {relevance_score !== undefined && (
            <CircularProgress value={relevance_score} label="Relevance" />
          )}
          <CircularProgress value={completion_percentage} label="Completion" />
        </div>

        <div className="dash-enroll-tags">
          <span className="dash-tag">{difficulty_level}</span>
          <span className="dash-tag">Urgent</span>
        </div>

        <div className="dash-enroll-footer">
          <div className="dash-footer-meta">
            {match_reason && (
              <span className="dash-meta-item" title={match_reason}>
                <Info size={12} className="dash-meta-icon" /> Why Recommended
              </span>
            )}
            <span className="dash-enroll-status">
              <CheckCircle2 size={13} className="dash-status-icon" /> {status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
