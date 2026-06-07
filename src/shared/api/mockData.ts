/**
 * Centralized mock data service
 * This will be replaced with real API calls in production
 * 
 * IMPORTANT: Update only mockDataConfig.json to change dummy data
 * This file loads data from mockDataConfig.json using configLoader
 */

import {
  loadDomains,
  loadRoles,
  loadLearnerProfile,
  loadLearnerCapabilities,
  loadSkillGap,
  loadProfileSnapshot,
  loadLearningPath,
  loadLearningPathCourses,
  loadLearningTracks,
  loadTrackEvidence,
  getDomainById as getDomainByIdFromLoader,
  getRoleById as getRoleByIdFromLoader,
} from './configLoader';

/**
 * Export data loaders - these load from mockDataConfig.json
 */
export const MOCK_DOMAINS = loadDomains();
export const MOCK_ROLES = loadRoles();
export const MOCK_LEARNER_PROFILE = loadLearnerProfile();
export const MOCK_LEARNER_CAPABILITIES = loadLearnerCapabilities();
export const MOCK_SKILL_GAP = loadSkillGap();
export const MOCK_PROFILE_SNAPSHOT = loadProfileSnapshot();
export const MOCK_LEARNING_PATH = loadLearningPath();
export const MOCK_LEARNING_PATH_COURSES = loadLearningPathCourses();
export const MOCK_LEARNING_TRACKS = loadLearningTracks();
export const MOCK_TRACK_EVIDENCE = loadTrackEvidence();

/**
 * Get learner profile with extended data
 */
export function getLearnerProfile(_learnerId: string) {
  return {
    ...MOCK_LEARNER_PROFILE,
    capabilities: MOCK_LEARNER_CAPABILITIES,
    skill_gap: MOCK_SKILL_GAP,
    profile_snapshot: MOCK_PROFILE_SNAPSHOT,
    target_role: 'Backend Engineer',
    domain: 'Backend Engineering',
    industry: 'Information Technology & AI',
  };
}

/**
 * Get learning path with courses
 */
export function getLearningPath(_learnerId: string) {
  const completedCourses = MOCK_LEARNING_PATH_COURSES.filter(c => c.status === 'completed').length;
  const inProgressCourses = MOCK_LEARNING_PATH_COURSES.filter(c => c.status === 'in_progress').length;
  
  return {
    ...MOCK_LEARNING_PATH,
    courses: MOCK_LEARNING_PATH_COURSES,
    role_name: 'Backend Engineer',
    domain_name: 'Backend Engineering',
    courses_completed: completedCourses,
    courses_in_progress: inProgressCourses,
    courses_total: MOCK_LEARNING_PATH_COURSES.length,
  };
}

/**
 * Get learning tracks with evidence
 */
export function getLearningTracks(_learnerId: string) {
  return MOCK_LEARNING_TRACKS.map(track => ({
    ...track,
    evidence: MOCK_TRACK_EVIDENCE.find(e => e.learning_track_id === track.id),
  }));
}

/**
 * Get domain by ID
 */
export function getDomainById(domainId: string) {
  return getDomainByIdFromLoader(domainId);
}

/**
 * Get role by ID
 */
export function getRoleById(roleId: string) {
  return getRoleByIdFromLoader(roleId);
}
