/**
 * Metadata constants for UI display
 */

import type { 
  DifficultyLevel, 
  CapabilityLevel, 
  FitLevel, 
  SubmissionStatus,
  EvaluationStage,
  StageKey,
  FileType,
  ContentType,
} from '@/shared/types';

/**
 * Difficulty level metadata
 */
export const DIFFICULTY_META: Record<DifficultyLevel, { 
  label: string; 
  color: string; 
  bg: string;
  description: string;
}> = {
  beginner: { 
    label: 'Beginner', 
    color: '#10b981', 
    bg: '#ecfdf5',
    description: 'No prior experience required'
  },
  foundation: { 
    label: 'Foundation', 
    color: '#3b82f6', 
    bg: '#eff6ff',
    description: 'Basic concepts and fundamentals'
  },
  intermediate: { 
    label: 'Intermediate', 
    color: '#f59e0b', 
    bg: '#fffbeb',
    description: 'Some experience recommended'
  },
  advanced: { 
    label: 'Advanced', 
    color: '#ef4444', 
    bg: '#fef2f2',
    description: 'Strong foundation required'
  },
  expert: { 
    label: 'Expert', 
    color: '#8b5cf6', 
    bg: '#f5f3ff',
    description: 'Deep expertise and mastery'
  },
};

/**
 * Capability level metadata
 */
export const CAPABILITY_LEVEL_META: Record<CapabilityLevel, {
  label: string;
  color: string;
  bg: string;
  score_range: [number, number]; // min, max score
}> = {
  beginner: { 
    label: 'Beginner', 
    color: '#ef4444', 
    bg: '#fef2f2',
    score_range: [0, 20]
  },
  emerging: { 
    label: 'Emerging', 
    color: '#f59e0b', 
    bg: '#fffbeb',
    score_range: [21, 40]
  },
  intermediate: { 
    label: 'Intermediate', 
    color: '#3b82f6', 
    bg: '#eff6ff',
    score_range: [41, 60]
  },
  advanced: { 
    label: 'Advanced', 
    color: '#8b5cf6', 
    bg: '#f5f3ff',
    score_range: [61, 80]
  },
  expert: { 
    label: 'Expert', 
    color: '#10b981', 
    bg: '#ecfdf5',
    score_range: [81, 100]
  },
};

/**
 * Fit level metadata
 */
export const FIT_LEVEL_META: Record<FitLevel, {
  label: string;
  color: string;
  bg: string;
  icon: string;
}> = {
  High: { 
    label: 'High Fit', 
    color: '#10b981', 
    bg: '#ecfdf5',
    icon: '🎯'
  },
  Medium: { 
    label: 'Medium Fit', 
    color: '#f59e0b', 
    bg: '#fffbeb',
    icon: '⭐'
  },
  Low: { 
    label: 'Low Fit', 
    color: '#94a3b8', 
    bg: '#f8fafc',
    icon: '💡'
  },
};

/**
 * Submission status metadata
 */
export const SUBMISSION_STATUS_META: Record<SubmissionStatus, {
  label: string;
  color: string;
  bg: string;
}> = {
  draft: { 
    label: 'Draft', 
    color: '#64748b', 
    bg: '#f8fafc' 
  },
  submitted: { 
    label: 'Submitted', 
    color: '#7c3aed', 
    bg: '#f5f3ff' 
  },
  under_review: { 
    label: 'Under Review', 
    color: '#2563eb', 
    bg: '#eff6ff' 
  },
  evaluated: { 
    label: 'Evaluated', 
    color: '#059669', 
    bg: '#ecfdf5' 
  },
  returned_for_rework: { 
    label: 'Returned for Rework', 
    color: '#d97706', 
    bg: '#fef3c7' 
  },
  approved: { 
    label: 'Approved', 
    color: '#059669', 
    bg: '#ecfdf5' 
  },
  rejected: { 
    label: 'Rejected', 
    color: '#dc2626', 
    bg: '#fef2f2' 
  },
};

/**
 * Evaluation stage metadata
 */
export const EVALUATION_STAGE_META: Record<EvaluationStage, {
  label: string;
  color: string;
  order: number;
}> = {
  ai: { 
    label: 'AI Review', 
    color: '#6366f1', 
    order: 1 
  },
  staff: { 
    label: 'Staff Review', 
    color: '#8b5cf6', 
    order: 2 
  },
  industry: { 
    label: 'Industry Review', 
    color: '#ec4899', 
    order: 3 
  },
};

/**
 * 6E Stage metadata
 */
export const STAGE_META: Record<StageKey, {
  label: string;
  color: string;
  description: string;
  purposeTag: string;
  order: number;
}> = {
  engage: {
    label: 'Engage',
    color: '#6366f1',
    description: 'Hook into the real-world problem. Understand the context and stakes.',
    purposeTag: 'Hook & Context',
    order: 1,
  },
  explore: {
    label: 'Explore',
    color: '#8b5cf6',
    description: 'Investigate, gather signals, and form initial hypotheses.',
    purposeTag: 'Investigate',
    order: 2,
  },
  explain: {
    label: 'Explain',
    color: '#0ea5e9',
    description: 'Understand the core concepts and principles behind the solution.',
    purposeTag: 'Learn Concepts',
    order: 3,
  },
  express: {
    label: 'Express',
    color: '#f59e0b',
    description: 'Apply knowledge — draft your practice artifact.',
    purposeTag: 'Practice Artifact',
    order: 4,
  },
  empower: {
    label: 'Empower',
    color: '#10b981',
    description: 'Build and submit your final evaluated artifact.',
    purposeTag: 'Final Artifact',
    order: 5,
  },
  evolve: {
    label: 'Evolve',
    color: '#ec4899',
    description: 'Reflect on feedback. Advance your understanding beyond basics.',
    purposeTag: 'Reflect & Grow',
    order: 6,
  },
};

/**
 * File type metadata
 */
export const FILE_TYPE_META: Record<FileType, {
  label: string;
  icon: string;
  color: string;
  extensions: string[];
}> = {
  doc: { 
    label: 'Document', 
    icon: '📄', 
    color: '#2563eb',
    extensions: ['.doc', '.docx']
  },
  ppt: { 
    label: 'Presentation', 
    icon: '📊', 
    color: '#dc2626',
    extensions: ['.ppt', '.pptx']
  },
  excel: { 
    label: 'Spreadsheet', 
    icon: '📈', 
    color: '#059669',
    extensions: ['.xls', '.xlsx']
  },
  pdf: { 
    label: 'PDF', 
    icon: '📕', 
    color: '#dc2626',
    extensions: ['.pdf']
  },
  mp4: { 
    label: 'Video', 
    icon: '🎥', 
    color: '#7c3aed',
    extensions: ['.mp4', '.mov', '.avi']
  },
  mp3: { 
    label: 'Audio', 
    icon: '🎵', 
    color: '#ec4899',
    extensions: ['.mp3', '.wav', '.ogg']
  },
  jpeg: { 
    label: 'Image', 
    icon: '🖼️', 
    color: '#f59e0b',
    extensions: ['.jpg', '.jpeg']
  },
  png: { 
    label: 'Image', 
    icon: '🖼️', 
    color: '#f59e0b',
    extensions: ['.png']
  },
  sheet: { 
    label: 'Spreadsheet', 
    icon: '📊', 
    color: '#059669',
    extensions: ['.csv', '.tsv']
  },
  xls: { 
    label: 'Excel', 
    icon: '📈', 
    color: '#059669',
    extensions: ['.xls']
  },
  docs: { 
    label: 'Document', 
    icon: '📝', 
    color: '#2563eb',
    extensions: ['.txt', '.md']
  },
  text: { 
    label: 'Text', 
    icon: '📝', 
    color: '#64748b',
    extensions: ['.txt']
  },
  zip: { 
    label: 'Archive', 
    icon: '📦', 
    color: '#8b5cf6',
    extensions: ['.zip', '.rar', '.7z']
  },
};

/**
 * Content type metadata
 */
export const CONTENT_TYPE_META: Record<ContentType, {
  label: string;
  icon: string;
  color: string;
}> = {
  video: { label: 'Video', icon: '🎥', color: '#7c3aed' },
  pdf: { label: 'PDF', icon: '📕', color: '#dc2626' },
  slide: { label: 'Slides', icon: '📊', color: '#f59e0b' },
  doc: { label: 'Document', icon: '📄', color: '#2563eb' },
  image: { label: 'Image', icon: '🖼️', color: '#10b981' },
  text: { label: 'Text', icon: '📝', color: '#64748b' },
  link: { label: 'Link', icon: '🔗', color: '#0ea5e9' },
  audio: { label: 'Audio', icon: '🎵', color: '#ec4899' },
};

/**
 * Priority band colors
 */
export const PRIORITY_COLORS = {
  A: { color: '#dc2626', bg: '#fef2f2', label: 'Priority A' },
  B: { color: '#f59e0b', bg: '#fffbeb', label: 'Priority B' },
  null: { color: '#94a3b8', bg: '#f8fafc', label: 'No Priority' },
};
