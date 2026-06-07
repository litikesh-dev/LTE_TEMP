/**
 * Configuration Loader
 * This file loads mock data from mockDataConfig.json
 * Update only mockDataConfig.json to change dummy data across the entire application
 */

import mockDataConfig from './mockDataConfig.json';
import type {
  Domain,
  Role,
  LearnerProfile,
  LearnerCapability,
  SkillGap,
  ProfileSnapshot,
  LearningPath,
  LearningPathCourse,
  LearningTrack,
  LearningTrackEvidence,
} from '@/shared/types';

/**
 * Load domains from config
 */
export function loadDomains(): Domain[] {
  return mockDataConfig.domains as Domain[];
}

/**
 * Load roles from config
 */
export function loadRoles(): Role[] {
  return mockDataConfig.roles as Role[];
}

/**
 * Load learner profile from config
 */
export function loadLearnerProfile(): LearnerProfile {
  return mockDataConfig.learnerProfile as LearnerProfile;
}

/**
 * Load learner capabilities from config
 */
export function loadLearnerCapabilities(): LearnerCapability[] {
  return mockDataConfig.learnerCapabilities as LearnerCapability[];
}

/**
 * Load skill gap from config
 */
export function loadSkillGap(): SkillGap {
  return mockDataConfig.skillGap as SkillGap;
}

/**
 * Load profile snapshot from config
 */
export function loadProfileSnapshot(): ProfileSnapshot {
  return mockDataConfig.profileSnapshot as ProfileSnapshot;
}

/**
 * Load learning path from config
 */
export function loadLearningPath(): LearningPath {
  return mockDataConfig.learningPath as LearningPath;
}

/**
 * Load learning path courses from config
 */
export function loadLearningPathCourses(): LearningPathCourse[] {
  return mockDataConfig.learningPathCourses as LearningPathCourse[];
}

/**
 * Load learning tracks from config
 */
export function loadLearningTracks(): LearningTrack[] {
  return mockDataConfig.learningTracks as LearningTrack[];
}

/**
 * Load learning track evidence from config
 */
export function loadTrackEvidence(): LearningTrackEvidence[] {
  return mockDataConfig.trackEvidence as LearningTrackEvidence[];
}

/**
 * Load courses (My Courses page) from config.
 * Single source of truth: courseContent.courses (each course carries both the
 * enrollment-card fields and its nested modules / artifacts / problem track).
 */
export function loadCourses(): unknown[] {
  return loadCourseContent();
}

/**
 * Load dashboard UI content (greeting, badges, leaderboard, etc.) from config
 */
export function loadDashboard() {
  return mockDataConfig.dashboard;
}

/**
 * Load course content (modules + artifacts + questions) from config.
 * Populated from the Excel template via scripts/xlsx_to_json.py.
 * Returns an array of courses, each with nested modules and artifacts.
 */
export function loadCourseContent(): unknown[] {
  const cfg = mockDataConfig as { courseContent?: { courses?: unknown[] } };
  return cfg.courseContent?.courses ?? [];
}

/**
 * Load the shared 6E stage metadata (label, description, purpose tag, color, est. time).
 * Returns an object keyed by stage; empty object falls back to the in-code defaults.
 */
export function loadStageMeta(): Record<string, unknown> {
  const cfg = mockDataConfig as { stageMeta?: Record<string, unknown> };
  return cfg.stageMeta ?? {};
}

/**
 * Get domain by ID
 */
export function getDomainById(domainId: string): Domain | undefined {
  return loadDomains().find(d => d.id === domainId);
}

/**
 * Get role by ID
 */
export function getRoleById(roleId: string): Role | undefined {
  return loadRoles().find(r => r.id === roleId);
}

/**
 * Get learning track by ID
 */
export function getLearningTrackById(trackId: string): LearningTrack | undefined {
  return loadLearningTracks().find(t => t.id === trackId);
}

/**
 * Get track evidence by learning track ID
 */
export function getTrackEvidenceByTrackId(trackId: string): LearningTrackEvidence | undefined {
  return loadTrackEvidence().find(e => e.learning_track_id === trackId);
}
