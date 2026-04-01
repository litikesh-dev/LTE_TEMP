import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseCard } from '@/widgets/CourseCard/ui/CourseCard';
import './my-courses.css';

/* ─────────────────────────── mock data ──────────────────────── */
const courses: any[] = [
  {
    id: 'lpc-001',
    course_id: 'SE-BE-OBS-01',
    course_code: 'BE-OBS-101',
    title: 'Debugging & Observability for Backend Systems',
    job_pathway_role: 'Backend Engineer',
    duration: '45 hours',
    difficulty_level: 'beginner',
    status: 'in_progress',
    completion_percentage: 17,
    relevance_score: 85,
    match_reason: 'Covers essential backend development skills aligned with the student\'s learning track.',
    thumbnail_url: 'https://images.unsplash.com/photo-1541462608141-ad43b5bf4e65?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 'lpc-002',
    course_id: 'SE-FE-R-01',
    course_code: 'FE-R-101',
    title: 'Modern React Architecture & Performance',
    job_pathway_role: 'Frontend Engineer',
    duration: '30 hours',
    difficulty_level: 'intermediate',
    status: 'not_started',
    completion_percentage: 0,
    relevance_score: 92,
    match_reason: 'Deep dive into React patterns for high-scale applications.',
    thumbnail_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 'lpc-003',
    course_id: 'UX-DS-01',
    course_code: 'UX-DS-101',
    title: 'A Symphony of Colors in UI Design',
    job_pathway_role: 'UI/UX Designer',
    duration: '20 hours',
    difficulty_level: 'beginner',
    status: 'completed',
    completion_percentage: 100,
    relevance_score: 75,
    match_reason: 'Fundamental color theory for interface designers.',
    thumbnail_url: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 'lpc-004',
    course_id: 'PM-AG-01',
    course_code: 'PM-AG-101',
    title: 'Agile Product Management at Scale',
    job_pathway_role: 'Product Manager',
    duration: '40 hours',
    difficulty_level: 'advanced',
    status: 'in_progress',
    completion_percentage: 45,
    relevance_score: 64,
    match_reason: 'Advanced leadership frameworks for technical product management.',
    thumbnail_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2574&auto=format&fit=crop',
  }
];

export function MyCourses() {
  const [animIn, setAnimIn] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const timer = setTimeout(() => setAnimIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`courses-root${animIn ? ' courses-root--in' : ''}`}>
      <header className="courses-header">
        <div className="courses-toolbar">
          <div className="courses-toolbar-left">
            <span className="courses-count">100 content</span>
          </div>
          
          <div className="courses-toolbar-center">
            <div className="courses-filter-chip">
              Total Question: 5 or more 
              <span className="courses-filter-close">×</span>
            </div>
            <button className="courses-reset-btn">Reset</button>
            <button className="courses-add-filter">
              <Plus size={18} /> Add Filter
            </button>
          </div>
          
          <div className="courses-toolbar-right">
            <div className="courses-view-toggles">
              <button 
                className={`courses-view-btn ${viewMode === 'grid' ? 'courses-view-btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                className={`courses-view-btn ${viewMode === 'list' ? 'courses-view-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={`courses-grid courses-grid--${viewMode}`}>
        {courses.map(course => (
          <CourseCard key={course.id} {...course} mode={viewMode} />
        ))}
      </main>

      <footer className="courses-pagination">
        <button className="pagination-arrow" disabled>
          <ChevronLeft size={18} />
        </button>
        <div className="pagination-pages">
          <button className="pagination-page pagination-page--active">1</button>
          <button className="pagination-page">2</button>
          <button className="pagination-page">3</button>
          <span className="pagination-dots">...</span>
          <button className="pagination-page">10</button>
        </div>
        <button className="pagination-arrow">
          <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
}
