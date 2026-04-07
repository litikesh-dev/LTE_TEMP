/**
 * Taxonomy Types (Domains, Roles, Capabilities)
 * Maps to: domains, roles, capabilities_master tables
 */

export type GapReviewStatus = 'Approved' | 'Needs Revision';

/**
 * Domain (domains table)
 */
export interface Domain {
  id: string;
  code: string;
  name: string;
  industry: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Role (roles table)
 */
export interface Role {
  id: string;
  domain_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Capability master (capabilities_master table)
 */
export interface CapabilityMaster {
  id: string;
  capability_id: string; // e.g., SE-CAP-01 (not unique alone)
  capability_library: string; // e.g., "Software Development"
  capability: string; // e.g., "Backend Service Development"
  role_id: string;
  domain_id: string; // Denormalized for fast filtering
  industry_outcome: string;
  academic_coverage: string | null;
  correct_academic_subject: string | null;
  major_topics_refresher: string | null;
  capability_gap: string;
  skill_gap_learning_outcomes: string;
  gap_review_status: GapReviewStatus;
  micro_gap_examples: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Role with domain (for UI consumption)
 */
export interface RoleWithDomain extends Role {
  domain?: Domain;
}

/**
 * Capability with role and domain (for UI consumption)
 */
export interface CapabilityWithContext extends CapabilityMaster {
  role?: Role;
  domain?: Domain;
}

/**
 * Domain with roles and capabilities (for UI consumption)
 */
export interface DomainWithRoles extends Domain {
  roles?: RoleWithCapabilities[];
}

/**
 * Role with capabilities (for UI consumption)
 */
export interface RoleWithCapabilities extends Role {
  capabilities?: CapabilityMaster[];
}
