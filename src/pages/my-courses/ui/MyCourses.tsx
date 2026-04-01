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
  duration: string;
  difficulty_level: DifficultyLevel;
  status: CourseStatus;
  completion_percentage: number;
  relevance_score: number;
  match_reason: string;
  sequence_no: number;
  started_at: string | null;
  completed_at: string | null;
}

/* ─────────────────────── mock data (learning_path_courses) ───── */
const MOCK_COURSES: CourseEnrollment[] = [
  {
    id: 'lpc-001',
    course_id: 'SE-BE-OBS-01',
    course_code: 'BE-OBS-101',
    title: 'Debugging & Observability for Backend Systems',
    description:
      'Learn how to debug and monitor backend systems for better performance and stability.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop',
    job_pathway_role: 'Backend Engineer',
    duration: '45 hours',
    difficulty_level: 'beginner',
    status: 'in_progress',
    completion_percentage: 17,
    relevance_score: 85,
    sequence_no: 1,
    match_reason: 'Covers essential backend development skills aligned with your learning track.',
    started_at: '2024-01-15T00:00:00Z',
    completed_at: null,
  },
  {
    id: 'lpc-002',
    course_id: 'SE-FE-R-01',
    course_code: 'FE-R-101',
    title: 'Modern React Architecture & Performance Patterns',
    description:
      'Deep dive into scalable React patterns, code splitting, and performance optimization.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2631&auto=format&fit=crop',
    job_pathway_role: 'Frontend Engineer',
    duration: '30 hours',
    difficulty_level: 'intermediate',
    status: 'not_started',
    completion_percentage: 0,
    relevance_score: 72,
    sequence_no: 2,
    match_reason: 'Highly relevant to your Frontend Engineer learning path.',
    started_at: null,
    completed_at: null,
  },
  {
    id: 'lpc-003',
    course_id: 'SE-API-01',
    course_code: 'API-101',
    title: 'API Design & Implementation — REST to GraphQL',
    description: 'Design production-ready REST and GraphQL APIs following industry best practices.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2568&auto=format&fit=crop',
    job_pathway_role: 'Backend Engineer',
    duration: '35 hours',
    difficulty_level: 'intermediate',
    status: 'completed',
    completion_percentage: 100,
    relevance_score: 91,
    sequence_no: 3,
    match_reason: 'Core capability for your Backend Engineer target role.',
    started_at: '2024-01-01T00:00:00Z',
    completed_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'lpc-004',
    course_id: 'SE-DB-01',
    course_code: 'DB-101',
    title: 'Database Design & Query Optimization',
    description: 'Design efficient database schemas and master query optimization techniques.',
    job_pathway_role: 'Backend Engineer',
    duration: '28 hours',
    difficulty_level: 'beginner',
    status: 'in_progress',
    completion_percentage: 55,
    relevance_score: 78,
    sequence_no: 4,
    match_reason: 'Addresses a priority B capability gap in your profile.',
    started_at: '2024-02-01T00:00:00Z',
    completed_at: null,
  },
  {
    id: 'lpc-005',
    course_id: 'SE-AUTH-01',
    course_code: 'AUTH-101',
    title: 'Authentication, Authorization & Security Patterns',
    description: 'Implement secure auth flows, JWT, OAuth2, and RBAC in backend services.',
    job_pathway_role: 'Backend Engineer',
    duration: '22 hours',
    difficulty_level: 'intermediate',
    status: 'not_started',
    completion_percentage: 0,
    relevance_score: 68,
    sequence_no: 5,
    match_reason: 'Security is a foundational capability for production systems.',
    started_at: null,
    completed_at: null,
  },
  {
    id: 'lpc-006',
    course_id: 'SE-CICD-01',
    course_code: 'CICD-101',
    title: 'CI/CD Pipelines & Application Deployment Basics',
    description:
      'Build deployment pipelines and ship applications reliably to production environments.',
    job_pathway_role: 'Backend Engineer',
    duration: '18 hours',
    difficulty_level: 'beginner',
    status: 'not_started',
    completion_percentage: 0,
    relevance_score: 60,
    sequence_no: 6,
    match_reason: 'Essential DevOps knowledge for backend engineers.',
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
