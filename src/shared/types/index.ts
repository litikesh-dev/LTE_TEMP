/**
 * Central export for all type definitions
 */

// Learner types
export type {
  LearnerProfile,
  LearnerCapability,
  SkillGap,
  SkillGapPriority,
  LearningTrackSuggestion,
  ProfileSnapshot,
  KeyPatterns,
  AptitudeStrength,
  LearnerProfileExtended,
} from './learner';

export type {
  GradeLevel,
  SkillLevel,
  CapabilityLevel,
  PriorityBand,
} from './learner';

// Learning types
export type {
  LearningTrack,
  LearningTrackEvidence,
  LearningTrackWithEvidence,
  LearningPath,
  LearningPathCourse,
  LearningPathExtended,
} from './learning';

export type {
  FitLevel,
  PathStatus,
  CourseStatus,
} from './learning';

// Course types
export type {
  Course,
  Module,
  ModuleProgress,
  ModuleContent,
  ContentItem,
  ContentMetadata,
  StageProgress,
  LearningContent,
  ModuleSupport,
  ModuleKnowledge,
  ModuleTools,
  ModuleWithProgress,
  CourseWithModules,
} from './course';

export type {
  DifficultyLevel,
  ModuleStatus,
  StageKey,
  StageStatus,
  ContentType,
  ContentStatus,
} from './course';

// Artifact types
export type {
  ModuleArtifact,
  ArtifactQuestion,
  ArtifactTemplate,
  ArtifactSubmission,
  ArtifactEvaluationFlow,
  SubmissionWithEvaluation,
  ArtifactWithDetails,
  QuestionSubmissionData,
  ArtifactSubmissionPayload,
  RubricCriterion,
} from './artifact';

export type {
  ArtifactType,
  SubmissionType,
  FileType,
  SubmissionStatus,
  SubmissionMode,
  EvaluationStage,
  EvaluationStatus,
  EvaluationDecision,
  OverallStatus,
} from './artifact';

// Taxonomy types
export type {
  Domain,
  Role,
  CapabilityMaster,
  RoleWithDomain,
  CapabilityWithContext,
  DomainWithRoles,
  RoleWithCapabilities,
} from './taxonomy';

export type {
  GapReviewStatus,
} from './taxonomy';
