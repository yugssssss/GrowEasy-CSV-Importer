import {
  CRM_FIELDS,
  ALLOWED_CRM_STATUS,
  ALLOWED_DATA_SOURCE,
  emptyRecord,
} from '../config/crmSchema.js';

/**
 * Deterministic guardrails applied AFTER the model responds.
 *
 * The prompt asks the model to follow the rules, but we never fully trust an
 * LLM's output. This layer enforces the hard contract in code: correct field
 * set, enum whitelisting, CSV-safe values, and the skip rule. This is what
 * makes the pipeline production-safe rather than "hope the model behaved".
 */

/** Coerce anything into a trimmed, CSV-safe string. */
function toSafeString(value) {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // Escape real newlines so downstream CSV stays a single row.
  str = str.replace(/\r\n/g, '\\n').replace(/\n/g, '\\n').replace(/\r/g, '\\n');
  return str.trim();
}

/** Keep only whitelisted enum values; otherwise blank. */
function whitelist(value, allowed) {
  const v = toSafeString(value);
  return allowed.includes(v) ? v : '';
}

/**
 * Normalise a single raw record coming back from the model into the exact CRM
 * schema. Unknown keys are dropped; missing keys are filled with "".
 */
export function normalizeRecord(raw) {
  const record = emptyRecord();
  if (raw && typeof raw === 'object') {
    for (const field of CRM_FIELDS) {
      record[field] = toSafeString(raw[field]);
    }
  }

  record.crm_status = whitelist(record.crm_status, ALLOWED_CRM_STATUS);
  record.data_source = whitelist(record.data_source, ALLOWED_DATA_SOURCE);

  // Guard created_at: only keep it if JS can actually parse it.
  if (record.created_at) {
    const parsed = new Date(record.created_at);
    if (Number.isNaN(parsed.getTime())) {
      record.created_at = '';
    }
  }

  return record;
}

/**
 * A record is importable only if it has at least an email OR a mobile number.
 * Anything else is skipped, per the assignment's "Skip Invalid Records" rule.
 * @returns {{ ok: boolean, reason?: string }}
 */
export function evaluateRecord(record) {
  const hasEmail = Boolean(record.email && record.email.trim());
  const hasMobile = Boolean(
    record.mobile_without_country_code && record.mobile_without_country_code.trim()
  );
  if (!hasEmail && !hasMobile) {
    return { ok: false, reason: 'No email or mobile number found' };
  }
  return { ok: true };
}
