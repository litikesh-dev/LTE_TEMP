import { useEffect, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Info,
  LayoutDashboard,
  Medal,
  ScrollText,
  Star,
  Target,
  Trophy,
  Zap,
  Sparkles,
  Calendar,
  Briefcase,
  GraduationCap,
  Building,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CourseCard } from '@/widgets/CourseCard/ui/CourseCard';
import { ProfileSnapshot } from '@/widgets/ProfileSnapshot';
import { LevelProgress } from '@/widgets/LevelProgress';
import { getLearnerProfile } from '@/shared/api/mockData';
import { loadDashboard, loadCourses } from '@/shared/api/configLoader';
import './dashboard.css';

/* icon map so JSON can reference icons by name */
const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  medal: Medal,
  scroll: ScrollText,
  book: BookOpen,
  clock: Clock,
  zap: Zap,
  target: Target,
  star: Star,
  calendar: Calendar,
};

interface InProgressCourse {
  id: string;
  type: 'Course';
  title: string;
  materials: number;
  completion: number | null;
  deadline: string;
  deadlineUrgent: boolean;
  action: 'Start' | 'Continue';
  thumbColor: string;
}

interface EnrollmentCard {
  id: string;
  course_id: string;
  title: string;
  course_code: string;
  thumbnail_url?: string;
  job_pathway_role: string;
  duration: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  relevance_score?: number;
  match_reason?: string;
  domain_name?: string;
  certification_value?: string;
  common_course_problem_statement?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  role: string;
  points: number;
  initials: string;
  isCurrentUser?: boolean;
}

/* all dashboard content loaded from the active account in the DB */
const dashboardData = loadDashboard();

/* In-progress + enrollment cards are derived from the SAME source as the
   My Courses page (course_content.courses), so the dashboard and the courses
   list always stay in sync. */
const COURSE_THUMBS = ['#eef2ff', '#ede9fe', '#eef9f4', '#fef3e8'];
const allCourses = loadCourses() as Array<EnrollmentCard & { modules?: unknown[]; id?: string }>;

const inProgress: InProgressCourse[] = allCourses.map((c, i) => ({
  id: c.id ?? c.course_id,
  type: 'Course',
  title: c.title,
  materials: c.modules?.length ?? 0,
  completion: c.status === 'not_started' ? null : (c.completion_percentage ?? 0),
  deadline: c.status === 'in_progress' ? '12 hrs' : '1 Day',
  deadlineUrgent: c.status === 'in_progress',
  action: c.status === 'in_progress' ? 'Continue' : 'Start',
  thumbColor: COURSE_THUMBS[i % COURSE_THUMBS.length],
}));

const enrollments: EnrollmentCard[] = allCourses;
const leaderboard = dashboardData.leaderboard.entries as LeaderboardEntry[];
const pathNodes = dashboardData.pathNodes;
const sixEStages = dashboardData.sixEStages;
const greeting = dashboardData.greeting;
const statBadges = dashboardData.statBadges;
const levelProgressCfg = dashboardData.levelProgress;
const currentModule = dashboardData.currentModule;
const rightStats = dashboardData.rightStats;
const activityStreak = dashboardData.activityStreak;
const goalsCfg = dashboardData.goals;
const achievements = dashboardData.achievements;

function CircularProgress({
  value,
  max,
  size = 96,
}: {
  value: number;
  max: number;
  size?: number;
}) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`${value} of ${max}`}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8eaf6" strokeWidth={9} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#22c55e"
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="ring-progress"
      />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="700"
        fill="#1e293b"
      >
        {value}/{max}
      </text>
    </svg>
  );
}

/* mini progress ring used in in-progress rows */
function MiniRing({ pct }: { pct: number }) {
  const r = 11;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r={r} fill="none" stroke="#e0e7ff" strokeWidth="3" />
      <circle
        cx="14"
        cy="14"
        r={r}
        fill="none"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 14 14)"
      />
    </svg>
  );
}

// Fetch learner profile with extended data
const learnerProfileData = getLearnerProfile('learner-001');

const learnerProfile = {
  grade_level: dashboardData.learnerProfile.grade_level,
  skill_level: dashboardData.learnerProfile.skill_level,
  target_role: learnerProfileData.target_role || dashboardData.learnerProfile.target_role,
  domain: learnerProfileData.domain || dashboardData.learnerProfile.domain,
  industry: learnerProfileData.industry || dashboardData.learnerProfile.industry,
};

/* color classes applied to the header stat badges, by position */
const BADGE_COLORS = ['dash-badge-icon--yellow', 'dash-badge-icon--orange', 'dash-badge-icon--amber'];

/* ────────────────────────── main component ──────────────────────── */
const XP_STORAGE_KEY = 'lte_earned_xp';

export function Dashboard() {
  const [goalProgress] = useState(goalsCfg.progress);
  const [goalMax] = useState(goalsCfg.max);
  const [animIn, setAnimIn] = useState(false);
  const mounted = useRef(false);

  /* ── Points earned from artifact submissions (stored locally) ── */
  const [earnedXp, setEarnedXp] = useState(() => {
    try { return Number(localStorage.getItem(XP_STORAGE_KEY) || '0'); } catch { return 0; }
  });

  useEffect(() => {
    const refresh = () => {
      try { setEarnedXp(Number(localStorage.getItem(XP_STORAGE_KEY) || '0')); } catch { /* ignore */ }
    };
    window.addEventListener('lte-xp-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('lte-xp-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setTimeout(() => setAnimIn(true), 80);
    }
  }, []);

  return (
    <>
      <div className={`dash-root${animIn ? ' dash-root--in' : ''}`}>
        {/* ════════════════ FULL WIDTH HEADER ════════════════════════════ */}
        <div className="dash-header-full">
          {/* ── Header row ── */}
          <div className="dash-header-row">
            <div className="dash-greeting">
              <h1 className="dash-greeting-title">
                {greeting.title}
                <span className="dash-wave" aria-hidden="true">
                  {greeting.emoji}
                </span>
              </h1>
              <p className="dash-greeting-sub">{greeting.subtitle}</p>
            </div>

            <div className="dash-stat-badges">
              {earnedXp > 0 && (
                <div className="dash-badge" key="earned-xp">
                  <span className="dash-badge-icon-wrap dash-badge-icon--yellow">
                    <Star size={16} />
                  </span>
                  <div>
                    <p className="dash-badge-val">{earnedXp.toLocaleString()}</p>
                    <p className="dash-badge-lbl">Points Earned</p>
                  </div>
                </div>
              )}
              {statBadges.map((badge, i) => {
                const Icon = ICONS[badge.icon] ?? Trophy;
                return (
                  <div className="dash-badge" key={badge.label}>
                    <span className={`dash-badge-icon-wrap ${BADGE_COLORS[i] ?? ''}`}>
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="dash-badge-val">{badge.value}</p>
                      <p className="dash-badge-lbl">{badge.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Learner Profile Overview ── */}
          <section className="dash-profile-overview">
            <div className="dash-po-item">
              <div className="dash-po-icon dash-po-icon--role">
                <Target size={20} />
              </div>
              <div className="dash-po-details">
                <span className="dash-po-label">Target Role</span>
                <span className="dash-po-value">{learnerProfile.target_role}</span>
              </div>
            </div>
            
            <div className="dash-po-divider" />
            
            <div className="dash-po-item">
              <div className="dash-po-icon dash-po-icon--domain">
                <Briefcase size={20} />
              </div>
              <div className="dash-po-details">
                <span className="dash-po-label">Domain</span>
                <span className="dash-po-value">{learnerProfile.domain}</span>
              </div>
            </div>

            <div className="dash-po-divider" />
            
            <div className="dash-po-item">
              <div className="dash-po-icon dash-po-icon--industry">
                <Building size={20} />
              </div>
              <div className="dash-po-details">
                <span className="dash-po-label">Industry</span>
                <span className="dash-po-value">{learnerProfile.industry}</span>
              </div>
            </div>

            <div className="dash-po-divider" />
            
            <div className="dash-po-item">
              <div className="dash-po-icon dash-po-icon--grade">
                <GraduationCap size={20} />
              </div>
              <div className="dash-po-details">
                <span className="dash-po-label">Academic & Skill</span>
                <span className="dash-po-value">
                  {learnerProfile.grade_level} • {learnerProfile.skill_level}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ════════════════ LEFT / MAIN COLUMN ════════════════════════════ */}
        <div className="dash-main">
          
          {/* ── Level Progress Widget ── */}
          <LevelProgress
            currentLevel={levelProgressCfg.currentLevel}
            totalLevels={levelProgressCfg.totalLevels}
            coursesCompleted={levelProgressCfg.coursesCompleted}
            coursesRequired={levelProgressCfg.coursesRequired}
            nextLevelCourses={levelProgressCfg.nextLevelCourses}
            roleName={learnerProfile.target_role}
          />

          {/* ── Announcement banner (Hidden as requested) ── */}
          {/*
        <div className="dash-announcement">
          <span className="dash-ann-badge">New</span>
          <div className="dash-ann-content">
            <p className="dash-ann-title">Feature Discussion</p>
            <p className="dash-ann-body">
              The learning content are a new feature in &ldquo;Feature Discussion&rdquo; can be
              explain the material problem chat.{' '}
              <a href="#" className="dash-ann-link">
                Go to detail <ArrowRight size={12} className="dash-ann-arrow" />
              </a>
            </p>
          </div>
        </div>
        */}

          {/* ── Progress Timeline ── */}
          <section className="dash-section dash-timeline-section">
            <div className="dash-section-head">
              <h2 className="dash-section-title">{dashboardData.currentLearningPathTitle}</h2>
            </div>
            <div className="dash-timeline-card">
              <div className="dash-timeline-track-wrapper">
                <div className="dash-timeline-track">
                  {pathNodes.map((node, i) => (
                    <div key={node.id} className={`dash-timeline-node ${node.status}`}>
                      <div className="dash-node-circle">
                        {node.status === 'completed' ? (
                          <CheckCircle2 size={14} color="#fff" />
                        ) : node.status === 'current' ? (
                          <div className="dash-node-dot" />
                        ) : null}
                      </div>
                      <span className="dash-node-label">{node.label}</span>
                      {i < pathNodes.length - 1 && <div className="dash-node-line" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="dash-timeline-module-info">
                <div className="dash-tm-header">
                  <div className="dash-tm-header-text">
                    <span className="dash-tm-subtitle">{currentModule.subtitle}</span>
                    <h3 className="dash-tm-title">{currentModule.title}</h3>
                  </div>
                  <button className="dash-tm-cta">
                    {currentModule.cta} <ChevronRight size={16} />
                  </button>
                </div>

                <div className="dash-tm-progress-breakdown">
                  <p className="dash-tm-breakdown-title">6E Learning Framework Progress</p>
                  <div className="dash-6e-stages">
                    {sixEStages.map(stage => (
                      <div
                        key={stage.name}
                        className={`dash-6e-stage dash-6e-stage--${stage.status}`}
                      >
                        <div className="dash-6e-icon-wrapper">
                          {stage.status === 'completed' ? (
                            <CheckCircle2 size={16} className="dash-6e-icon done" />
                          ) : stage.status === 'in_progress' ? (
                            <span className="dash-6e-val">{stage.value}%</span>
                          ) : (
                            <span className="dash-6e-icon dash-6e-dash">-</span>
                          )}
                        </div>
                        <span className="dash-6e-name">{stage.name}</span>
                        {stage.status === 'in_progress' && (
                          <div className="dash-6e-progress-bar">
                            <div
                              className="dash-6e-progress-fill"
                              style={{ width: `${stage.value}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── In-progress section ── */}
          <section className="dash-section">
            <div className="dash-section-head">
              <h2 className="dash-section-title">
                In progress learning content
                <Info size={14} className="dash-info-icon" />
              </h2>
              <a href="#" className="dash-view-all">
                View all
              </a>
            </div>

            <div className="dash-progress-table">
              {inProgress.map(course => (
                <div key={course.id} className="dash-ip-row">
                  {/* thumb */}
                  <div className="dash-ip-thumb" style={{ background: course.thumbColor }}>
                    <LayoutDashboard size={22} color="#6366f1" strokeWidth={1.5} />
                  </div>

                  {/* info */}
                  <div className="dash-ip-info">
                    <span className="dash-ip-type">
                      <BookOpen size={11} /> {course.type}
                    </span>
                    <p className="dash-ip-title">{course.title}</p>
                  </div>

                  {/* content */}
                  <div className="dash-ip-meta">
                    <span className="dash-ip-meta-label">Content</span>
                    <span className="dash-ip-meta-val">
                      <FileText size={13} className="dash-meta-icon" />
                      {course.materials} Material
                    </span>
                  </div>

                  {/* completion */}
                  <div className="dash-ip-meta">
                    <span className="dash-ip-meta-label">Completion</span>
                    {course.completion !== null ? (
                      <span className="dash-ip-meta-val dash-completion">
                        <MiniRing pct={course.completion} />
                        {course.completion}%
                      </span>
                    ) : (
                      <span className="dash-ip-meta-val">-</span>
                    )}
                  </div>

                  {/* deadline */}
                  <div className="dash-ip-meta">
                    <span className="dash-ip-meta-label">Deadline</span>
                    <span
                      className={`dash-ip-meta-val${course.deadlineUrgent ? ' dash-urgent' : ''}`}
                    >
                      <Clock size={13} className="dash-meta-icon" />
                      {course.deadline}
                    </span>
                  </div>

                  <button
                    className={`dash-action-btn${course.action === 'Continue' ? ' dash-action-btn--outline' : ''}`}
                  >
                    {course.action}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="dash-section">
            <div className="dash-section-head">
              <h2 className="dash-section-title">
                New enrollment
                <Info size={14} className="dash-info-icon" />
              </h2>
              <a href="#" className="dash-view-all">
                View all
              </a>
            </div>

            <div className="dash-enroll-grid">
              {enrollments.map(card => (
                <CourseCard key={card.id} {...card} />
              ))}
            </div>
          </section>
        </div>

        <aside className="dash-right">
          {/* Profile Snapshot */}
          {learnerProfileData.profile_snapshot && (
            <ProfileSnapshot snapshot={learnerProfileData.profile_snapshot} compact />
          )}

          {/* Learning stats */}
          {rightStats.map(stat => {
            const Icon = ICONS[stat.icon] ?? BookOpen;
            return (
              <div className="dash-right-card" key={stat.desc}>
                <div className="dash-stat-row">
                  <div className={`dash-stat-icon-wrap dash-stat-icon-wrap--${stat.color}`}>
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div className="dash-stat-info">
                    <p className="dash-stat-num">{stat.num}</p>
                    <p className="dash-stat-desc">{stat.desc}</p>
                  </div>
                  <ChevronRight size={18} className="dash-stat-arrow" />
                </div>
              </div>
            );
          })}

          {/* Activity Streak */}
          <div className="dash-right-card dash-streak-card">
            <h3 className="dash-right-card-title">
              <Calendar size={15} className="dash-title-icon" />
              Activity Streak
            </h3>
            <p className="dash-streak-sub">
              Your Longest Streak: <span className="dash-fire">{activityStreak.longestStreak}</span>
            </p>

            <div className="dash-streak-week">
              {activityStreak.days.map(d => (
                <div key={d.name} className="dash-streak-day">
                  <span className="dash-s-dayname">{d.name}</span>
                  <div className={`dash-s-check ${d.active ? 'active' : ''}`}>
                    {d.active ? <CheckCircle2 size={12} strokeWidth={3} /> : '-'}
                  </div>
                </div>
              ))}
            </div>
            <p className="dash-streak-curr">
              Current Streak: <strong>{activityStreak.currentStreak}</strong>
            </p>
          </div>

          {/* Goals */}
          <div className="dash-right-card dash-goals-card">
            <h3 className="dash-right-card-title">
              <Target size={15} className="dash-title-icon" />
              Goals
              <Info size={13} className="dash-info-icon" />
            </h3>
            <div className="dash-goals-ring-wrap">
              <CircularProgress value={goalProgress} max={goalMax} size={96} />
            </div>
            <p className="dash-goals-label">
              Daily Goal:{' '}
              <strong>
                {goalProgress}/{goalMax} learning
              </strong>
            </p>
            <p className="dash-goals-streak">
              <Zap size={13} className="dash-streak-icon" />
              Your Longest streak: <strong>{goalsCfg.longestStreak}</strong>
            </p>
            <p className="dash-goals-dates">{goalsCfg.dateRange}</p>
            <a href="#" className="dash-see-detail">
              See Detail
            </a>
          </div>

          {/* Recent Achievements */}
          <div className="dash-right-card">
            <h3 className="dash-right-card-title">
              <Award size={15} className="dash-title-icon" />
              Recent Achievements
            </h3>
            <div className="dash-achievements-list">
              {achievements.map(ach => {
                const Icon = ICONS[ach.icon] ?? Zap;
                return (
                  <div className="dash-achieve-row" key={ach.title}>
                    <div className="dash-achieve-icon-wrap">
                      <Icon size={14} color={ach.color} />
                    </div>
                    <div className="dash-achieve-info">
                      <h4>{ach.title}</h4>
                      <p>{ach.desc}</p>
                      <span>{ach.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="dash-section dash-section--full dash-section--leaderboard">
          <div className="dash-section-head">
            <h2 className="dash-section-title">
              Leaderboard
              <Info size={14} className="dash-info-icon" />
            </h2>
            <p className="dash-lbm-track">{dashboardData.leaderboard.rankSummary}</p>
          </div>

          <div className="dash-leaderboard-main">
            <table className="dash-lbm-table" aria-label="Leaderboard table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Role</th>
                  <th>Total Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(entry => (
                  <tr
                    key={entry.rank}
                    className={entry.isCurrentUser ? 'dash-lbm-row-current' : undefined}
                  >
                    <td className="dash-lbm-col-rank">
                      {entry.rank === 1 ? (
                        <Trophy size={18} className="dash-lbm-trophy-1" />
                      ) : entry.rank === 2 ? (
                        <Medal size={18} className="dash-lbm-trophy-2" />
                      ) : entry.rank === 3 ? (
                        <Medal size={18} className="dash-lbm-trophy-3" />
                      ) : (
                        <span className="dash-lbm-num">#{entry.rank}</span>
                      )}
                    </td>
                    <td>
                      <div className="dash-lbm-col-student">
                        <div
                          className={`dash-lbm-av dash-lbm-av-${entry.rank <= 3 ? entry.rank : 'default'}`}
                        >
                          {entry.initials}
                        </div>
                        <span className="dash-lbm-student-name">{entry.name}</span>
                        {entry.isCurrentUser && <span className="dash-lbm-you-tag">You</span>}
                      </div>
                    </td>
                    <td>
                      <span className="dash-lbm-role-badge">{entry.role}</span>
                    </td>
                    <td>
                      <div className="dash-lbm-col-points">
                        <Star size={14} className="dash-lbm-star" />
                        <span>{(entry.points + (entry.isCurrentUser ? earnedXp : 0)).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Floating AI Button (placed outside transformed parent to ensure correct fixed positioning relative to viewport) */}
      <button className={`dash-floating-ai-btn${animIn ? ' dash-floating-ai-btn--in' : ''}`}>
        <Sparkles size={20} color="#fff" />
      </button>
    </>
  );
}
