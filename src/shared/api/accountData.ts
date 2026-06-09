/**
 * Active-account data bootstrap (no-auth demo).
 *
 * Fetches the single `accounts` row with is_active = true from Supabase and
 * exposes its `data` payload — which has the same top-level shape that
 * mockDataConfig.json used to have (domains, roles, learnerProfile, ...,
 * courseContent, stageMeta).
 *
 * This module uses a top-level await so the whole app waits for the data
 * before any page module's top-level loaders run. Switch accounts by flipping
 * is_active in the database (only one row may be active at a time).
 */
import { supabase } from './supabaseClient';
import { getSessionSlug } from './session';
// Type-only import: gives `accountData` the same rich shape the loaders expect
// without bundling the JSON at runtime (erased during build).
import type defaultConfig from './mockDataConfig.json';

export type AccountData = typeof defaultConfig;

// DB column (snake_case) → config key (camelCase) the app/loaders expect.
const COLUMN_MAP: Record<string, keyof AccountData> = {
  domains: 'domains',
  roles: 'roles',
  learner_profile: 'learnerProfile',
  learner_capabilities: 'learnerCapabilities',
  skill_gap: 'skillGap',
  profile_snapshot: 'profileSnapshot',
  learning_path: 'learningPath',
  learning_path_courses: 'learningPathCourses',
  learning_tracks: 'learningTracks',
  track_evidence: 'trackEvidence',
  dashboard: 'dashboard',
  course_content: 'courseContent',
  stage_meta: 'stageMeta',
};

async function fetchActiveAccount(): Promise<AccountData> {
  const columns = Object.keys(COLUMN_MAP).join(', ');
  // Prefer the account chosen at "login" (slug in localStorage); otherwise fall
  // back to the is_active row so the app still works without logging in.
  const slug = getSessionSlug();
  const query = supabase.from('accounts').select(`persona, name, ${columns}`);
  const { data, error } = await (slug
    ? query.eq('slug', slug)
    : query.eq('is_active', true)
  )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase: failed to load account — ${error.message}`);
  }
  if (!data) {
    throw new Error(
      'Supabase: account not found. Log in again or set accounts.is_active = true for one row.'
    );
  }

  // Reassemble the per-section columns into the single config shape the loaders read.
  const row = data as unknown as Record<string, unknown>;
  const config: Record<string, unknown> = {};
  for (const [column, key] of Object.entries(COLUMN_MAP)) {
    config[key] = row[column];
  }
  return config as unknown as AccountData;
}

export const accountData: AccountData = await fetchActiveAccount();
