/**
 * Learner Profile & Capability Types
 * Maps to: learner_profiles, learner_capabilities, skill_gap, profile_snapshot tables
 */

export type GradeLevel = 'middle_school' | 'high_school' | 'higher_secondary' | 'ug' | 'pg' | 'professional';
export type SkillLevel = 'beginner' | 'foundation' | 'intermediate' | 'advanced' | 'expert';
export type CapabilityLevel = 'beginner' | 'emerging' | 'intermediate' | 'advanced' | 'expert';
export type PriorityBand = 'A' | 'B' | null;

/**
 * Main learner profile (learner_profiles table)
 */
export interface LearnerProfile {
  id: string;
  student_id: string;
  grade_level: GradeLevel;
  skill_level: SkillLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Individual capability assessment (learner_capabilities table)
 */
export interface LearnerCapability {
  id: string;
  learner_id: string;
  assessment_id: string;
  capability_id: string; // FK to capabilities_master
  current_score: number; // 0-100
  current_level: CapabilityLevel;
  target_level: number | null; // 1-5 scale
  gap_score: number; // 0-100
  priority_band: PriorityBand;
  why_needed: string | null;
  how_to_build: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Skill gap priority item (from skill_gap.priorities JSON)
 */
export interface SkillGapPriority {
  priority_type: 'A' | 'B';
  skill: string;
  whyNeeded: string | null;
  howToBuild: string | null;
  targetLevel: number | null;
  currentLevel: number | null;
}

/**
 * Learning track suggestion (from skill_gap.learning_tracks JSON)
 */
export interface LearningTrackSuggestion {
  track: string;
  topics: string;
  suggestedIf: string;
}

/**
 * Skill gap summary (skill_gap table)
 */
export interface SkillGap {
  id: string;
  learner_id: string;
  assessment_id: string;
  attempt_id: string | null;
  priorities: SkillGapPriority[];
  learning_tracks: LearningTrackSuggestion[];
  current_strengths: string[];
  recommended_track: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Key patterns from profile snapshot (from profile_snapshot.key_patterns JSON)
 */
export interface KeyPatterns {
  strength: string;
  enjoyment: string;
  workStyle: string;
  motivation: string;
}

/**
 * Aptitude strength item (from profile_snapshot.aptitude_strengths JSON)
 */
export interface AptitudeStrength {
  name: string;
  percentile: string;
}

/**
 * Profile snapshot (profile_snapshot table)
 */
export interface ProfileSnapshot {
  id: string;
  learner_id: string;
  assessment_id: string;
  attempt_id: string | null;
  key_patterns: KeyPatterns;
  aptitude_strengths: AptitudeStrength[];
  created_at: string;
  updated_at: string;
}

/**
 * Extended learner profile with related data (for UI consumption)
 */
export interface LearnerProfileExtended extends LearnerProfile {
  capabilities?: LearnerCapability[];
  skill_gap?: SkillGap;
  profile_snapshot?: ProfileSnapshot;
  target_role?: string;
  domain?: string;
  industry?: string;
}
