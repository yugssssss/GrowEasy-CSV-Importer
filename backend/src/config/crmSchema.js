/**
 * Single source of truth for the GrowEasy CRM schema.
 * Both the AI prompt and the deterministic validation layer read from here,
 * so the contract can never drift between "what we ask the model for" and
 * "what we accept back".
 */

/** Ordered list of CRM fields the AI must produce for every record. */
export const CRM_FIELDS = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];

/** Human-readable descriptions used to guide the model. */
export const CRM_FIELD_DESCRIPTIONS = {
  created_at: 'Lead creation date/time',
  name: 'Lead full name',
  email: 'Primary email address',
  country_code: 'Phone country code, e.g. +91',
  mobile_without_country_code: 'Mobile number without the country code',
  company: 'Company name',
  city: 'City',
  state: 'State / province',
  country: 'Country',
  lead_owner: 'Lead owner (usually an email or name)',
  crm_status: 'Lead status (restricted set)',
  crm_note: 'Notes, remarks, follow-ups, extra emails/phones',
  data_source: 'Lead source (restricted set)',
  possession_time: 'Property possession time',
  description: 'Any additional description',
};

/** Only these crm_status values are allowed. Anything else => "". */
export const ALLOWED_CRM_STATUS = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
];

/** Only these data_source values are allowed. Anything else => "". */
export const ALLOWED_DATA_SOURCE = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
];

/** An empty CRM record with every field present as an empty string. */
export function emptyRecord() {
  return CRM_FIELDS.reduce((acc, field) => {
    acc[field] = '';
    return acc;
  }, {});
}
