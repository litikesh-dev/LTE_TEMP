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
import { CourseCard } from '@/widgets/CourseCard/ui/CourseCard';
import { ProfileSnapshot } from '@/widgets/ProfileSnapshot';
import { LevelProgress } from '@/widgets/LevelProgress';
import { getLearnerProfile } from '@/shared/api/mockData';
import './dashboard.css';

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

const inProgress: InProgressCourse[] = [
  {
    id: '1',
    type: 'Course',
    title: 'Mastering UI/UX Design: A Guide...',
    materials: 5,
    completion: null,
    deadline: '1 Day',
    deadlineUrgent: false,
    action: 'Start',
    thumbColor: '#eef2ff',
  },
  {
    id: '2',
    type: 'Course',
    title: 'Creating Engaging Learning Jour...',
    materials: 12,
    completion: 64,
    deadline: '12 hrs',
    deadlineUrgent: true,
    action: 'Continue',
    thumbColor: '#ede9fe',
  },
];

const enrollments: EnrollmentCard[] = [
  {
    id: 'lpc-dashboard-1',
    course_id: 'SE-BE-OBS-01',
    course_code: 'BE-OBS-101',
    title: 'Debugging & Observability for Backend Systems',
    job_pathway_role: 'Backend Engineer',
    duration: '45 hours',
    difficulty_level: 'beginner',
    status: 'not_started',
    completion_percentage: 0,
    relevance_score: 85,
    match_reason: 'Matches your Learning Path priority.',
    domain_name: 'Backend Engineering',
    certification_value: 'System Debugging',
    common_course_problem_statement: 'Production backend service begins failing under load and engineers must identify root causes using logs, debugging tools and structured investigation.',
  },
  {
    id: 'lpc-dashboard-2',
    course_id: 'UIUX-101',
    course_code: 'UIUX-101',
    title: 'UI/UX 101 – For Beginner to be great and good Designer',
    job_pathway_role: 'UI Designer',
    duration: '25 hours',
    difficulty_level: 'beginner',
    status: 'not_started',
    completion_percentage: 0,
    relevance_score: 72,
    match_reason: 'Foundation course for design.',
    domain_name: 'Frontend Engineering',
    certification_value: 'UI Design Fundamentals',
    common_course_problem_statement: 'Learn to create user-friendly interfaces that solve real user problems through systematic design thinking.',
  },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Arif Brata', role: 'Jr UI/UX Designer', points: 1250, initials: 'AB' },
  { rank: 2, name: 'Siti Rahma', role: 'Sr Product Manager', points: 1185, initials: 'SR' },
  { rank: 3, name: 'Dimas Prayoga', role: 'Frontend Developer', points: 1122, initials: 'DP' },
  { rank: 118, name: 'Nadia Putri', role: 'Instructional Designer', points: 498, initials: 'NP' },
  { rank: 119, name: 'Kevin Aditya', role: 'Learning Specialist', points: 493, initials: 'KA' },
  {
    rank: 120,
    name: 'Adit Pratama',
    role: 'Product Design Learner',
    points: 487,
    initials: 'AP',
    isCurrentUser: true,
  },
  { rank: 121, name: 'Maya Salsabila', role: 'UI Designer', points: 482, initials: 'MS' },
];

const pathNodes = [
  { id: '1', label: 'Start', status: 'completed' },
  { id: '2', label: 'Mod1', status: 'completed' },
  { id: '3', label: 'Mod2', status: 'completed' },
  { id: '4', label: 'Mod3', status: 'current' },
  { id: '5', label: 'Mod4', status: 'upcoming' },
  { id: '6', label: 'Mod5', status: 'upcoming' },
  { id: '7', label: 'Goal', status: 'upcoming' },
];

const sixEStages = [
  { name: 'Engage', status: 'completed', value: 100 },
  { name: 'Explore', status: 'completed', value: 100 },
  { name: 'Explain', status: 'completed', value: 100 },
  { name: 'Express', status: 'in_progress', value: 50 },
  { name: 'Empower', status: 'not_started', value: 0 },
  { name: 'Evolve', status: 'not_started', value: 0 },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SVG circular ring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
  grade_level: 'Undergraduate',
  skill_level: 'Beginner',
  target_role: learnerProfileData.target_role || 'Backend Engineer',
  domain: learnerProfileData.domain || 'Backend Engineering',
  industry: learnerProfileData.industry || 'Information Technology & AI',
};

/* ────────────────────────── main component ──────────────────────── */
export function Dashboard() {
  const [goalProgress] = useState(6);
  const [goalMax] = useState(30);
  const [animIn, setAnimIn] = useState(false);
  const mounted = useRef(false);

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
                Good morning, Adit
                <span className="dash-wave" aria-hidden="true">
                  👋
                </span>
              </h1>
              <p className="dash-greeting-sub">
                Welcome to Trenning, check your priority learning.
              </p>
            </div>

            <div className="dash-stat-badges">
              <div className="dash-badge">
                <span className="dash-badge-icon-wrap dash-badge-icon--yellow">
                  <Trophy size={16} />
                </span>
                <div>
                  <p className="dash-badge-val">100</p>
                  <p className="dash-badge-lbl">Point</p>
                </div>
              </div>
              <div className="dash-badge">
                <span className="dash-badge-icon-wrap dash-badge-icon--orange">
                  <Medal size={16} />
                </span>
                <div>
                  <p className="dash-badge-val">32</p>
                  <p className="dash-badge-lbl">Badges</p>
                </div>
              </div>
              <div className="dash-badge">
                <span className="dash-badge-icon-wrap dash-badge-icon--amber">
                  <ScrollText size={16} />
                </span>
                <div>
                  <p className="dash-badge-val">12</p>
                  <p className="dash-badge-lbl">Certificates</p>
                </div>
              </div>
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
            currentLevel={1}
            totalLevels={5}
            coursesCompleted={1}
            coursesRequired={6}
            nextLevelCourses={2}
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
              <h2 className="dash-section-title">
                Current Learning Path: Product Design Foundation
              </h2>
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
                    <span className="dash-tm-subtitle">CURRENT MODULE</span>
                    <h3 className="dash-tm-title">Module 3: Visual Hierarchy</h3>
                  </div>
                  <button className="dash-tm-cta">
                    Continue Course <ChevronRight size={16} />
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

          {/* â”€â”€ New enrollment section â”€â”€ */}
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

          {/* Learning content */}
          <div className="dash-right-card">
            <div className="dash-stat-row">
              <div className="dash-stat-icon-wrap dash-stat-icon-wrap--purple">
                <BookOpen size={18} strokeWidth={1.8} />
              </div>
              <div className="dash-stat-info">
                <p className="dash-stat-num">120</p>
                <p className="dash-stat-desc">Learning content</p>
              </div>
              <ChevronRight size={18} className="dash-stat-arrow" />
            </div>
          </div>

          {/* Learning time */}
          <div className="dash-right-card">
            <div className="dash-stat-row">
              <div className="dash-stat-icon-wrap dash-stat-icon-wrap--teal">
                <Clock size={18} strokeWidth={1.8} />
              </div>
              <div className="dash-stat-info">
                <p className="dash-stat-num">44</p>
                <p className="dash-stat-desc">Learning time</p>
              </div>
              <ChevronRight size={18} className="dash-stat-arrow" />
            </div>
          </div>

          {/* Activity Streak */}
          <div className="dash-right-card dash-streak-card">
            <h3 className="dash-right-card-title">
              <Calendar size={15} className="dash-title-icon" />
              Activity Streak
            </h3>
            <p className="dash-streak-sub">
              Your Longest Streak: <span className="dash-fire">143 days</span>
            </p>

            <div className="dash-streak-week">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                <div key={d} className="dash-streak-day">
                  <span className="dash-s-dayname">{d}</span>
                  <div className={`dash-s-check ${i < 5 ? 'active' : ''}`}>
                    {i < 5 ? <CheckCircle2 size={12} strokeWidth={3} /> : '-'}
                  </div>
                </div>
              ))}
            </div>
            <p className="dash-streak-curr">
              Current Streak: <strong>18 days</strong>
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
              Your Longest streak: <strong>1 Day</strong>
            </p>
            <p className="dash-goals-dates">(28 Sep 23 â€“ 4 Okt 23)</p>
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
              <div className="dash-achieve-row">
                <div className="dash-achieve-icon-wrap">
                  <Zap size={14} color="#eab308" />
                </div>
                <div className="dash-achieve-info">
                  <h4>Fast Learner</h4>
                  <p>Completed 5 modules in one week</p>
                  <span>2 days ago</span>
                </div>
              </div>
              <div className="dash-achieve-row">
                <div className="dash-achieve-icon-wrap">
                  <Target size={14} color="#3b82f6" />
                </div>
                <div className="dash-achieve-info">
                  <h4>Problem Solver</h4>
                  <p>Submitted first artifact</p>
                  <span>1 week ago</span>
                </div>
              </div>
              <div className="dash-achieve-row">
                <div className="dash-achieve-icon-wrap">
                  <Star size={14} color="#f97316" />
                </div>
                <div className="dash-achieve-info">
                  <h4>Design Master</h4>
                  <p>Scored 100% on Prototyping quiz</p>
                  <span>2 weeks ago</span>
                </div>
              </div>
              <div className="dash-achieve-row">
                <div className="dash-achieve-icon-wrap">
                  <Calendar size={14} color="#10b981" />
                </div>
                <div className="dash-achieve-info">
                  <h4>Consistent Scholar</h4>
                  <p>Maintained a 14-day study streak</p>
                  <span>3 weeks ago</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* â”€â”€ Leaderboard section (Full Width) â”€â”€ */}
        <section className="dash-section dash-section--full dash-section--leaderboard">
          <div className="dash-section-head">
            <h2 className="dash-section-title">
              Leaderboard
              <Info size={14} className="dash-info-icon" />
            </h2>
            <p className="dash-lbm-track">
              Your rank: <strong>#120</strong> of 1,842 learners
            </p>
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
                        <span>{entry.points.toLocaleString()}</span>
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
