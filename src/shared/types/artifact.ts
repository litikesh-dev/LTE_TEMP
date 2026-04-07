/**
 * Artifact & Submission Types
 * Maps to: module_artifacts, artifact_questions, artifact_templates, 
 *          artifact_submissions, artifact_evaluation_flows tables
 */

export type ArtifactType = 'practice' | 'final';
export type SubmissionType = 'text' | 'file' | 'url' | 'code';
export type FileType = 'doc' | 'ppt' | 'excel' | 'pdf' | 'mp4' | 'mp3' | 'jpeg' | 'png' | 'sheet' | 'xls' | 'docs' | 'text' | 'zip';
export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'evaluated' | 'returned_for_rework' | 'approved' | 'rejected';
export type SubmissionMode = 'fast' | 'normal';
export type EvaluationStage = 'ai' | 'staff' | 'industry';
export type EvaluationStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type EvaluationDecision = 'pass' | 'fail' | 'return' | 'escalate' | 'skip';
export type OverallStatus = 'initiated' | 'in_progress' | 'completed' | 'returned_for_rework' | 'approved' | 'rejected';

/**
 * Module artifact definition (module_artifacts table)
 */
export interface ModuleArtifact {
  id: string;
  module_id: string;
  artifact_type: ArtifactType;
  total_score: number;
  passing_score: number | null;
  allow_resubmission: boolean;
  require_review_unlock: boolean;
  max_attempts: number | null; // null = unlimited
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Artifact question (artifact_questions table)
 */
export interface ArtifactQuestion {
  id: string;
  artifact_id: string;
  order: number;
  title: string;
  description: string;
  instructions: string;
  submission_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Artifact template (artifact_templates table)
 */
export interface ArtifactTemplate {
  id: string;
  artifact_id: string;
  question_id: string | null; // null = applies to entire artifact
  file_name: string;
  file_url: string;
  file_type: FileType;
  version: number;
  is_downloadable: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Rubric criterion (from artifact_evaluation_flows or UI)
 */
export interface RubricCriterion {
  criterion: string;
  score: number;
  max: number;
  feedback?: string;
}

/**
 * Artifact submission (artifact_submissions table)
 */
export interface ArtifactSubmission {
  id: string;
  artifact_id: string;
  learner_id: string;
  learner_module_progress_id: string;
  attempt_no: number;
  version_label: string; // v1, v2, v3
  is_latest: boolean;
  previous_submission_id: string | null;
  submission_mode: SubmissionMode;
  submission_text: string | null;
  submission_url?: string | null; // Added for URL submissions
  status: SubmissionStatus;
  evaluation_id: string | null;
  submitted_at: string;
  sealed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Evaluation flow stage (artifact_evaluation_flows table)
 */
export interface ArtifactEvaluationFlow {
  id: string;
  submission_id: string;
  stage: EvaluationStage;
  stage_order: number; // 1=ai, 2=staff, 3=industry
  status: EvaluationStatus;
  evaluated_by: string | null; // null for AI
  score: number | null;
  feedback: string | null;
  improvements: string | null;
  decision: EvaluationDecision | null;
  completed_at: string | null;
  overall_status: OverallStatus;
  is_current_stage: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Submission with evaluation data (for UI consumption)
 */
export interface SubmissionWithEvaluation extends ArtifactSubmission {
  evaluations?: ArtifactEvaluationFlow[];
  ai_score?: number;
  ai_feedback?: string;
  ai_improvements?: string;
  staff_score?: number;
  staff_feedback?: string;
  staff_improvements?: string;
  industry_score?: number;
  industry_feedback?: string;
  industry_improvements?: string;
  rubric?: RubricCriterion[];
  overall_status?: OverallStatus;
  current_eval_stage?: EvaluationStage;
}

/**
 * Artifact with questions, templates, and submissions (for UI consumption)
 */
export interface ArtifactWithDetails extends ModuleArtifact {
  questions?: ArtifactQuestion[];
  templates?: ArtifactTemplate[];
  submissions?: SubmissionWithEvaluation[];
  attempts_used?: number;
  can_submit?: boolean;
  unlock_status?: 'locked' | 'unlocked' | 'pending_review';
}

/**
 * Question submission data (for form handling)
 */
export interface QuestionSubmissionData {
  question_id: string;
  submission_type: SubmissionType;
  text_value?: string;
  file_value?: File;
  url_value?: string;
  code_value?: string;
}

/**
 * Complete artifact submission payload
 */
export interface ArtifactSubmissionPayload {
  artifact_id: string;
  module_id: string;
  submission_mode: SubmissionMode;
  questions: QuestionSubmissionData[];
}
