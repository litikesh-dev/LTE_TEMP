import { useState } from 'react';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { CourseCard } from '@/widgets/CourseCard/ui/CourseCard';
import './my-courses.css';

/* ─────────────────────── types (aligned with schema) ────────── */
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
type CourseStatus = 'not_started' | 'in_progress' | 'completed';

interface CourseEnrollment {
  id: string;
  course_id: string;
  course_code: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  job_pathway_role: string;
  capability_name: string;
  level_label: string;
  duration: string;
  difficulty_level: DifficultyLevel;
  status: CourseStatus;
  completion_percentage: number;
  xp_reward: number;
  badge?: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority_band: string;
  why_needed: string;
  how_to_build: string;
  sequence_no: number;
  started_at: string | null;
  completed_at: string | null;
}

/* ─────────────────────── mock data (learning_path_courses) ───── */
const MOCK_COURSES: CourseEnrollment[] = [
  {
    id: 'lpc-001',
    course_id: 'crs-obs-l2',
    course_code: 'OBS-L2',
    title: 'Observability: Logging, Monitoring & Debugging',
    description:
      'Learn how to debug and monitor backend systems for better performance and stability.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop',
    job_pathway_role: 'Backend Engineer',
    capability_name: 'Observability & Debugging',
    level_label: 'Applied Skill',
    duration: '45 hours',
    difficulty_level: 'intermediate',
    status: 'in_progress',
    completion_percentage: 17,
    xp_reward: 500,
    badge: 'none',
    current_level: 1,
    required_level: 3,
    gap: 2,
    priority_band: 'A',
    why_needed: 'Monitor production systems and diagnose runtime issues',
    how_to_build: 'Complete observability course with logging, debugging, and monitoring tools',
    sequence_no: 1,
    started_at: '2024-01-15T00:00:00Z',
    completed_at: null,
  },
  {
    id: 'lpc-002',
    course_id: 'crs-react-l3',
    course_code: 'REACT-L3',
    title: 'React: Advanced Patterns & Performance Optimization',
    description:
      'Deep dive into scalable React patterns, code splitting, and performance optimization.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2631&auto=format&fit=crop',
    job_pathway_role: 'Frontend Engineer',
    capability_name: 'Frontend Frameworks (React)',
    level_label: 'Applied Skill',
    duration: '38 hours',
    difficulty_level: 'advanced',
    status: 'not_started',
    completion_percentage: 0,
    xp_reward: 650,
    badge: 'none',
    current_level: 1,
    required_level: 3,
    gap: 2,
    priority_band: 'A',
    why_needed: 'Build scalable frontend applications with optimal performance',
    how_to_build: 'Master React hooks, state management, and performance optimization techniques',
    sequence_no: 2,
    started_at: null,
    completed_at: null,
  },
  {
    id: 'lpc-003',
    course_id: 'crs-api-l3',
    course_code: 'API-L3',
    title: 'API Design: REST, GraphQL & Scalability',
    description: 'Design production-ready REST and GraphQL APIs following industry best practices.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2568&auto=format&fit=crop',
    job_pathway_role: 'Backend Engineer',
    capability_name: 'API Design & Implementation',
    level_label: 'Applied Skill',
    duration: '35 hours',
    difficulty_level: 'intermediate',
    status: 'completed',
    completion_percentage: 100,
    xp_reward: 600,
    badge: 'Qualified',
    current_level: 3,
    required_level: 3,
    gap: 0,
    priority_band: 'none',
    why_needed: 'Design scalable API systems for production use',
    how_to_build: 'Study REST principles, GraphQL, versioning, and scalability patterns',
    sequence_no: 3,
    started_at: '2024-01-01T00:00:00Z',
    completed_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'lpc-004',
    course_id: 'crs-sql-l2',
    course_code: 'SQL-L2',
    title: 'Database Design: Schema & Query Optimization',
    description: 'Design efficient database schemas and master query optimization techniques.',
    job_pathway_role: 'Backend Engineer',
    capability_name: 'Database Design & Querying',
    level_label: 'Working Knowledge',
    duration: '32 hours',
    difficulty_level: 'beginner',
    status: 'in_progress',
    completion_percentage: 55,
    xp_reward: 450,
    badge: 'none',
    current_level: 1,
    required_level: 3,
    gap: 2,
    priority_band: 'B',
    why_needed: 'Optimize database performance and structure data efficiently',
    how_to_build: 'Learn schema design, normalization, indexing, and query optimization',
    sequence_no: 4,
    started_at: '2024-02-01T00:00:00Z',
    completed_at: null,
  },
  {
    id: 'lpc-005',
    course_id: 'crs-auth-l2',
    course_code: 'AUTH-L2',
    title: 'Security: Authentication & Authorization Patterns',
    description: 'Implement secure auth flows, JWT, OAuth2, and RBAC in backend services.',
    job_pathway_role: 'Backend Engineer',
    capability_name: 'Security & Authentication',
    level_label: 'Working Knowledge',
    duration: '28 hours',
    difficulty_level: 'intermediate',
    status: 'not_started',
    completion_percentage: 0,
    xp_reward: 550,
    badge: 'none',
    current_level: 0,
    required_level: 2,
    gap: 2,
    priority_band: 'A',
    why_needed: 'Build secure systems with proper authentication and authorization',
    how_to_build: 'Study JWT, OAuth2, RBAC, encryption, and security best practices',
    sequence_no: 5,
    started_at: null,
    completed_at: null,
  },
  {
    id: 'lpc-006',
    course_id: 'crs-devops-l1',
    course_code: 'DEVOPS-L1',
    title: 'DevOps Fundamentals: CI/CD & Deployment',
    description:
      'Build deployment pipelines and ship applications reliably to production environments.',
    job_pathway_role: 'Backend Engineer',
    capability_name: 'DevOps & Deployment',
    level_label: 'Basic Awareness',
    duration: '20 hours',
    difficulty_level: 'beginner',
    status: 'not_started',
    completion_percentage: 0,
    xp_reward: 300,
    badge: 'none',
    current_level: 0,
    required_level: 1,
    gap: 1,
    priority_band: 'B',
    why_needed: 'Understand deployment processes and CI/CD principles',
    how_to_build: 'Learn containerization, CI/CD tools, and deployment best practices',
    sequence_no: 6,
    started_at: null,
    completed_at: null,
  },
];

/* ─────────────────────────── component ────────────────────────── */
export function MyCourses() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<CourseStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  /* ── derived filtered list ── */
  const filtered = MOCK_COURSES.filter(c => {
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchStatus;
  });

  const activeFilterCount = filterStatus !== 'all' ? 1 : 0;

  return (
    <div className="mc-container">
      {/* ── Filter Bar ── */}
      <div className="mc-filter-bar">
        <div className="mc-filter-left">
          {activeFilterCount > 0 && (
            <button className="mc-active-filter" onClick={() => setFilterStatus('all')}>
              Total Question: {activeFilterCount} or more
              <X size={14} />
            </button>
          )}
          {activeFilterCount > 0 && (
            <button className="mc-reset-btn" onClick={() => setFilterStatus('all')}>
              Reset
            </button>
          )}
          <button
            className="mc-add-filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            Add Filter
          </button>
        </div>

        <div className="mc-filter-right">
          <div className="mc-view-toggle">
            <button
              className={`mc-view-btn${viewMode === 'grid' ? ' active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`mc-view-btn${viewMode === 'list' ? ' active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Dropdown ── */}
      {showFilters && (
        <div className="mc-filter-dropdown">
          <div className="mc-filter-section">
            <label>Status</label>
            <div className="mc-filter-options">
              <button
                className={filterStatus === 'all' ? 'active' : ''}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button
                className={filterStatus === 'in_progress' ? 'active' : ''}
                onClick={() => setFilterStatus('in_progress')}
              >
                In Progress
              </button>
              <button
                className={filterStatus === 'completed' ? 'active' : ''}
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </button>
              <button
                className={filterStatus === 'not_started' ? 'active' : ''}
                onClick={() => setFilterStatus('not_started')}
              >
                Not Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Course Grid / List ── */}
      <main className={`mc-grid mc-grid--${viewMode}`}>
        {filtered.map(course => (
          <CourseCard key={course.id} {...course} mode={viewMode === 'list' ? 'list' : 'grid'} />
        ))}
      </main>

      {filtered.length === 0 && (
        <div className="mc-empty">
          <p>No courses found</p>
        </div>
      )}
    </div>
  );
}
