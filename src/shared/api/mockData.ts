/**
 * Centralized mock data service
 * This will be replaced with real API calls in production
 */

import type {
  LearnerProfile,
  LearnerCapability,
  SkillGap,
  ProfileSnapshot,
  LearningTrack,
  LearningTrackEvidence,
  LearningPath,
  LearningPathCourse,
  Domain,
  Role,
} from '@/shared/types';

/**
 * Mock Domains
 */
export const MOCK_DOMAINS: Domain[] = [
  {
    id: 'dom-001',
    code: 'D001',
    name: 'Backend Engineering',
    industry: 'Information Technology & AI',
    is_active: true,
    created_at: '2026-03-30T00:00:00Z',
    updated_at: '2026-03-30T00:00:00Z',
  },
  {
    id: 'dom-002',
    code: 'D002',
    name: 'Frontend Engineering',
    industry: 'Information Technology & AI',
    is_active: true,
    created_at: '2026-03-30T00:00:00Z',
    updated_at: '2026-03-30T00:00:00Z',
  },
];

/**
 * Mock Roles
 */
export const MOCK_ROLES: Role[] = [
  {
    id: 'role-001',
    domain_id: 'dom-001',
    name: 'Backend Engineer',
    description: 'Designs and builds server-side services, APIs, and data layers.',
    is_active: true,
    created_at: '2026-03-31T00:00:00Z',
    updated_at: '2026-03-31T00:00:00Z',
  },
  {
    id: 'role-002',
    domain_id: 'dom-001',
    name: 'Full-Stack Engineer',
    description: 'Builds both frontend and backend components of an application.',
    is_active: true,
    created_at: '2026-03-31T00:00:00Z',
    updated_at: '2026-03-31T00:00:00Z',
  },
];

/**
 * Mock Learner Profile
 */
export const MOCK_LEARNER_PROFILE: LearnerProfile = {
  id: 'learner-001',
  student_id: '3531e63e-589e-46e7-9248-4a769e84b00d',
  grade_level: 'ug',
  skill_level: 'beginner',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock Learner Capabilities
 */
export const MOCK_LEARNER_CAPABILITIES: LearnerCapability[] = [
  {
    id: 'lc-001',
    learner_id: 'learner-001',
    assessment_id: 'd9c8e5f2-1a2b-4c3d-9e8f-7a6b5c4d3e2f',
    capability_id: 'SE-CAP-08',
    current_score: 20,
    current_level: 'beginner',
    target_level: 4,
    gap_score: 60,
    priority_band: 'A',
    why_needed: 'Monitor production systems and diagnose runtime issues',
    how_to_build: 'Complete observability course with logging, debugging, and monitoring tools',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lc-002',
    learner_id: 'learner-001',
    assessment_id: 'd9c8e5f2-1a2b-4c3d-9e8f-7a6b5c4d3e2f',
    capability_id: 'SE-CAP-02',
    current_score: 40,
    current_level: 'emerging',
    target_level: 4,
    gap_score: 40,
    priority_band: 'A',
    why_needed: 'Build scalable, efficient backend services',
    how_to_build: 'Learn REST/GraphQL principles and database indexing strategies',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lc-003',
    learner_id: 'learner-001',
    assessment_id: 'd9c8e5f2-1a2b-4c3d-9e8f-7a6b5c4d3e2f',
    capability_id: 'SE-CAP-01',
    current_score: 20,
    current_level: 'beginner',
    target_level: 3,
    gap_score: 40,
    priority_band: 'B',
    why_needed: 'Architect robust backend solutions for production',
    how_to_build: 'Study architecture patterns and scalability principles',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

/**
 * Mock Skill Gap
 */
export const MOCK_SKILL_GAP: SkillGap = {
  id: 'sg-001',
  learner_id: 'learner-001',
  assessment_id: '454cae3d-bf98-40cf-9b13-db27d343f5e9',
  attempt_id: 'ad872bf9-cb65-4d6a-9b07-1d27f8d013ba',
  priorities: [
    {
      priority_type: 'A',
      skill: 'Debugging & Observability',
      whyNeeded: 'Monitor production systems and diagnose runtime issues',
      howToBuild: 'Complete observability course with logging, debugging, and monitoring tools',
      targetLevel: 4,
      currentLevel: 1,
    },
    {
      priority_type: 'A',
      skill: 'API Design & Implementation',
      whyNeeded: 'Build scalable, efficient backend services',
      howToBuild: 'Learn REST/GraphQL principles and database indexing strategies',
      targetLevel: 4,
      currentLevel: 2,
    },
    {
      priority_type: 'B',
      skill: 'Backend Architecture',
      whyNeeded: 'Architect robust backend solutions for production',
      howToBuild: 'Study architecture patterns and scalability principles',
      targetLevel: 3,
      currentLevel: 1,
    },
  ],
  learning_tracks: [
    {
      track: 'Backend Fundamentals',
      topics: 'Node.js/Python, REST APIs, Database design, Authentication',
      suggestedIf: 'Interested in backend development',
    },
    {
      track: 'Production Readiness',
      topics: 'Logging, Monitoring, Error handling, Performance optimization',
      suggestedIf: 'Ready for production-level systems',
    },
  ],
  current_strengths: ['Logical reasoning', 'Problem-solving', 'Systematic thinking'],
  recommended_track: 'Backend Fundamentals',
  created_at: '2026-03-23T06:47:13.8812+00:00',
  updated_at: '2026-03-23T06:47:13.8812+00:00',
};

/**
 * Mock Profile Snapshot
 */
export const MOCK_PROFILE_SNAPSHOT: ProfileSnapshot = {
  id: 'ps-001',
  learner_id: 'learner-001',
  assessment_id: '454cae3d-bf98-40cf-9b13-db27d343f5e9',
  attempt_id: 'ad872bf9-cb65-4d6a-9b07-1d27f8d013ba',
  key_patterns: {
    strength: 'Strong logical reasoning and systematic problem-solving',
    enjoyment: 'Building systems and solving technical challenges',
    workStyle: 'Methodical and detail-oriented',
    motivation: 'Desire to create reliable, scalable solutions',
  },
  aptitude_strengths: [
    { name: 'Logical reasoning', percentile: '95' },
    { name: 'Analytical thinking', percentile: '88' },
    { name: 'Problem-solving', percentile: '82' },
  ],
  created_at: '2026-03-23T06:47:13.8812+00:00',
  updated_at: '2026-03-23T06:47:13.8812+00:00',
};

/**
 * Mock Learning Path with level progression
 */
export const MOCK_LEARNING_PATH: LearningPath = {
  id: 'path-001',
  learning_track_id: 'track-001',
  learner_id: 'learner-001',
  role_id: 'role-001',
  level: 1,
  status: 'in_progress',
  is_active: true,
  version_no: 1,
  is_latest: true,
  started_at: '2024-01-15T00:00:00Z',
  completed_at: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

/**
 * Mock Learning Path Courses (Level 1 - 6 courses required)
 */
export const MOCK_LEARNING_PATH_COURSES: LearningPathCourse[] = [
  {
    id: 'lpc-001',
    learning_path_id: 'path-001',
    course_id: 'SE-BE-OBS-01',
    sequence_no: 1,
    relevance_score: 85,
    match_reason: 'Covers essential backend development skills aligned with your learning track.',
    why_recommended: 'Covers essential backend development skills aligned with your learning track.',
    status: 'in_progress',
    completion_percentage: 17,
    started_at: '2024-01-15T00:00:00Z',
    completed_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'lpc-002',
    learning_path_id: 'path-001',
    course_id: 'SE-API-01',
    sequence_no: 2,
    relevance_score: 91,
    match_reason: 'Core capability for your Backend Engineer target role.',
    why_recommended: 'Core capability for your Backend Engineer target role.',
    status: 'not_started',
    completion_percentage: 0,
    started_at: null,
    completed_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'lpc-003',
    learning_path_id: 'path-001',
    course_id: 'SE-DB-01',
    sequence_no: 3,
    relevance_score: 78,
    match_reason: 'Addresses a priority B capability gap in your profile.',
    why_recommended: 'Addresses a priority B capability gap in your profile.',
    status: 'not_started',
    completion_percentage: 0,
    started_at: null,
    completed_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'lpc-004',
    learning_path_id: 'path-001',
    course_id: 'SE-AUTH-01',
    sequence_no: 4,
    relevance_score: 68,
    match_reason: 'Security is a foundational capability for production systems.',
    why_recommended: 'Security is a foundational capability for production systems.',
    status: 'not_started',
    completion_percentage: 0,
    started_at: null,
    completed_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'lpc-005',
    learning_path_id: 'path-001',
    course_id: 'SE-TEST-01',
    sequence_no: 5,
    relevance_score: 75,
    match_reason: 'Testing is essential for reliable backend services.',
    why_recommended: 'Testing is essential for reliable backend services.',
    status: 'not_started',
    completion_percentage: 0,
    started_at: null,
    completed_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'lpc-006',
    learning_path_id: 'path-001',
    course_id: 'SE-CICD-01',
    sequence_no: 6,
    relevance_score: 60,
    match_reason: 'Essential DevOps knowledge for backend engineers.',
    why_recommended: 'Essential DevOps knowledge for backend engineers.',
    status: 'not_started',
    completion_percentage: 0,
    started_at: null,
    completed_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

/**
 * Mock Learning Tracks
 */
export const MOCK_LEARNING_TRACKS: LearningTrack[] = [
  {
    id: 'track-001',
    learner_id: 'learner-001',
    assessment_id: 'assessment-001',
    fit: 'High',
    track: 'Backend Fundamentals',
    matchScore: 92,
    topics: 'Node.js/Python, REST APIs, Database design, Authentication',
    duration: '3 months',
    whyItFits:
      "The student's logical abilities and systematic thinking make backend engineering an ideal career path for building scalable systems.",
  },
  {
    id: 'track-002',
    learner_id: 'learner-001',
    assessment_id: 'assessment-001',
    fit: 'High',
    track: 'Production Readiness',
    matchScore: 85,
    topics: 'Logging, Monitoring, Error handling, Performance optimization',
    duration: '2 months',
    whyItFits:
      "The student's problem-solving capability and emerging system design skills prepare them to handle production incidents and maintain reliable backend services.",
  },
];

/**
 * Mock Learning Track Evidence
 */
export const MOCK_TRACK_EVIDENCE: LearningTrackEvidence[] = [
  {
    id: 'lte-001',
    learning_track_id: 'track-001',
    learner_id: 'learner-001',
    assessment_id: 'assessment-001',
    evidence_values: 'Values logical thinking and systematic problem-solving',
    evidence_aptitude: 'Logical reasoning strength supports backend architecture',
    evidence_interest:
      'Strong inclination towards system design and infrastructure (RIASEC R score of 24)',
    evidence_personality:
      'High conscientiousness and logical thinking indicate strong fit for backend roles',
    evidence_employability: 'Demonstrates strong problem-solving and teamwork skills',
    evidence_adaptive_aptitude:
      'Emerging aptitude level indicates potential for growth in backend development',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

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
export function getDomainById(domainId: string): Domain | undefined {
  return MOCK_DOMAINS.find(d => d.id === domainId);
}

/**
 * Get role by ID
 */
export function getRoleById(roleId: string): Role | undefined {
  return MOCK_ROLES.find(r => r.id === roleId);
}
