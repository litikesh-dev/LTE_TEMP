/**
 * Course & Module Types
 * Maps to: courses, modules, modules_content, 6e_content tables
 */

export type DifficultyLevel = 'beginner' | 'foundation' | 'intermediate' | 'advanced' | 'expert';
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';
export type StageKey = 'engage' | 'explore' | 'explain' | 'express' | 'empower' | 'evolve';
export type StageStatus = 'completed' | 'in_progress' | 'not_started';
export type ContentType = 'video' | 'pdf' | 'slide' | 'doc' | 'image' | 'text' | 'link' | 'audio';
export type ContentStatus = 'draft' | 'published' | 'archived';

/**
 * Learning content structure (from modules.learning_content JSON)
 */
export interface LearningContent {
  major_concepts: string;
  implementation_context_when_to_use: string;
  reason_behind_concept: string;
}

/**
 * Support information (from modules.support JSON)
 */
export interface ModuleSupport {
  ai_support_tips: string;
  module_continuity_link: string;
}

/**
 * Knowledge mapping (from modules.knowledge JSON)
 */
export interface ModuleKnowledge {
  technical_concepts_learnt: string;
  academic_refresher_concepts: string;
}

/**
 * Tools information (from modules.tools JSON)
 */
export interface ModuleTools {
  tools_used: string;
  tool_type_free_or_paid: string | null;
}

/**
 * Course (courses table)
 */
export interface Course {
  course_id: string;
  course_code: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  job_pathway_role: string; // FK to roles.id
  domain_id: string; // FK to domains.id
  duration: string;
  difficulty_level: DifficultyLevel;
  certification_value: string | null;
  common_course_problem_statement: string;
  is_active: boolean;
  version_no: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Module (modules table)
 */
export interface Module {
  id: string;
  course_id: string;
  module_no: number;
  title: string;
  description: string;
  engineering_workflow_stage: string;
  module_specific_problem_statement: string;
  pressure_points: string;
  student_confusion: string;
  learning_content: LearningContent;
  support: ModuleSupport;
  knowledge: ModuleKnowledge;
  tools: ModuleTools;
  version_no: number;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 6E stage progress (learner_6e_stage_progress table)
 */
export interface StageProgress {
  id: string;
  learner_module_progress_id: string;
  learner_id: string;
  module_id: string;
  stage_name: StageKey;
  stage_order: number; // 1-6
  status: 'in_progress' | 'completed'; // No not_started - absence means not reached
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number;
  created_at: string;
  updated_at: string;
}

/**
 * Module progress (learner_module_progress table)
 */
export interface ModuleProgress {
  id: string;
  learner_id: string;
  learning_path_id: string;
  course_id: string;
  module_id: string;
  module_status: ModuleStatus;
  completion_percentage: number; // 0-100
  artifact_submitted: boolean;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Module content metadata (modules_content table)
 */
export interface ModuleContent {
  id: string;
  module_id: string;
  stage_name: StageKey;
  stage_order: number; // 1-6
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Content metadata (from 6e_content.metadata_json)
 */
export interface ContentMetadata {
  transcript_available?: boolean;
  content_creator?: string;
  language?: string;
  [key: string]: unknown;
}

/**
 * Individual content item (6e_content table)
 */
export interface ContentItem {
  id: string;
  modules_content_id: string;
  content_type: ContentType;
  title: string;
  description: string | null;
  url: string;
  sort_order: number;
  duration_seconds: number | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  version: number;
  status: ContentStatus;
  metadata_json: ContentMetadata | null;
  created_at: string;
  updated_at: string;
}

/**
 * Module with progress and stages (for UI consumption)
 */
export interface ModuleWithProgress extends Module {
  progress?: ModuleProgress;
  stages?: StageProgress[];
  estimated_time?: string;
}

/**
 * Course with modules (for UI consumption)
 */
export interface CourseWithModules extends Course {
  modules?: ModuleWithProgress[];
  role_name?: string;
  domain_name?: string;
}
