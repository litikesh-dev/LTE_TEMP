import { useState } from 'react';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { CourseCard } from '@/widgets/CourseCard/ui/CourseCard';
import { loadCourses } from '@/shared/api/configLoader';
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

/* ─── mock data loaded from mockDataConfig.json (edit there) ─── */
const MOCK_COURSES = loadCourses() as CourseEnrollment[];

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
