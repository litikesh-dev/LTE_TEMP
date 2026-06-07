/**
 * Learning Track & Path Types
 * Maps to: learning_tracks, learning_paths, learning_path_courses, learning_track_evidence tables
 */

export type FitLevel = 'High' | 'Medium' | 'Low';
export type PathStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';
export type CourseStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Learning track recommendation (learning_tracks table)
 */
export interface LearningTrack {
  id: string;
  learner_id: string;
  assessment_id: string;
  fit: FitLevel;
  track: string;
  matchScore: number; // 0-100
  topics: string;
  duration: string;
  whyItFits: string;
}

/**
 * Evidence supporting a learning track (learning_track_evidence table)
 */
export interface LearningTrackEvidence {
  id: string;
  learning_track_id: string;
  learner_id: string;
  assessment_id: string;
  evidence_values: string;
  evidence_aptitude: string;
  evidence_interest: string;
  evidence_personality: string;
  evidence_employability: string;
  evidence_adaptive_aptitude: string;
  created_at: string;
  updated_at: string;
}

/**
 * Learning track with evidence (for UI consumption)
 */
export interface LearningTrackWithEvidence extends LearningTrack {
  evidence?: LearningTrackEvidence;
}

/**
 * Personalized learning path (learning_paths table)
 */
export interface LearningPath {
  id: string;
  learning_track_id: string;
  learner_id: string;
  role_id: string;
  level: 1 | 2 | 3 | 4 | 5;
  status: PathStatus;
  is_active: boolean;
  version_no: number;
  is_latest: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Course within a learning path (learning_path_courses table)
 */
export interface LearningPathCourse {
  id: string;
  learning_path_id: string;
  course_id: string;
  sequence_no: number;
  relevance_score: number | null; // 0-100
  match_reason: string | null;
  why_recommended: string | null;
  status: CourseStatus;
  completion_percentage: number; // 0-100
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Learning path with courses (for UI consumption)
 */
export interface LearningPathExtended extends LearningPath {
  courses?: LearningPathCourse[];
  track?: LearningTrack;
  role_name?: string;
  domain_name?: string;
}
