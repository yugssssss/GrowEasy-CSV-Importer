import {
  CRM_FIELDS,
  CRM_FIELD_DESCRIPTIONS,
  ALLOWED_CRM_STATUS,
  ALLOWED_DATA_SOURCE,
} from '../config/crmSchema.js';

/**
 * Builds the system prompt for the extraction model.
 *
 * The whole challenge of this assignment lives in this prompt: the model must
 * map columns it has never seen (Facebook exports, Google Ads, real-estate CRMs,
 * hand-made spreadsheets...) onto a fixed CRM schema, apply strict enum rules,
 * and stay CSV-safe. We keep it deterministic (temperature 0) and force JSON out.
 */
export function buildSystemPrompt() {
  const fieldList = CRM_FIELDS.map(
    (f) => `  - ${f}: ${CRM_FIELD_DESCRIPTIONS[f]}`
  ).join('\n');

  return `You are the extraction engine for GrowEasy CRM.

You receive raw lead rows taken from an ARBITRARY CSV. Column names, order,
casing, language and structure vary wildly between sources (Facebook Lead
exports, Google Ads exports, Excel sheets, real-estate CRM exports, sales
reports, marketing-agency CSVs, manually created spreadsheets, etc.).

Your job: map each input row to the GrowEasy CRM schema below. You are NOT
parsing CSV syntax — you are intelligently deciding which raw column means which
CRM field, even when the header names are unusual, abbreviated, mislabelled or
missing.

## OUTPUT SCHEMA (every field is a string; use "" when unknown)
${fieldList}

## MAPPING GUIDELINES
- Infer meaning from BOTH the header name and the cell values. For example a
  column called "Phone", "Contact", "Mobile No", "WhatsApp", "cell" all map to
  the mobile number. "Full Name", "Lead", "Customer", "Client" map to name.
- Split combined phone numbers into country_code (e.g. "+91") and
  mobile_without_country_code (local digits only, no spaces/dashes). If no
  explicit country code is present, leave country_code "".
- Never fabricate data. If a value is not present in the row, output "".
- Trim surrounding whitespace from every value.

## STRICT ENUM RULES
1. crm_status MUST be exactly one of:
   ${ALLOWED_CRM_STATUS.join(', ')}
   Map free-text statuses to the closest option ONLY when confident
   (e.g. "closed"/"won"/"deal done" -> SALE_DONE; "not interested"/"junk" ->
   BAD_LEAD; "no answer"/"unreachable" -> DID_NOT_CONNECT;
   "follow up"/"interested"/"call back" -> GOOD_LEAD_FOLLOW_UP).
   If nothing fits confidently, use "".
2. data_source MUST be exactly one of:
   ${ALLOWED_DATA_SOURCE.join(', ')}
   If none matches confidently, use "".

## created_at RULES
- Must be parseable by JavaScript's new Date(created_at).
- Prefer the format "YYYY-MM-DD HH:mm:ss". A plain "YYYY-MM-DD" is fine.
- Convert ambiguous formats sensibly; if it cannot be parsed reliably, use "".

## crm_note RULES (aggregation field)
Put into crm_note any: remarks, follow-up notes, comments, extra phone numbers,
extra email addresses, and any useful leftover information that does not fit a
dedicated field.
- Multiple emails in a row: keep the FIRST in \`email\`, append the rest to
  crm_note (e.g. "Other emails: a@x.com, b@y.com").
- Multiple mobile numbers in a row: keep the FIRST in
  \`mobile_without_country_code\`, append the rest to crm_note
  (e.g. "Other phones: 9876500000").
- When combining several notes, separate them with " | ".

## CSV SAFETY
Each record must stay a SINGLE logical row. Never emit real newline characters
inside any value. If a value naturally contains a line break, escape it as the
two characters backslash-n (\\n) so the downstream CSV stays valid.

## INPUT / OUTPUT CONTRACT
Input is a JSON object: { "rows": [ { "index": <int>, "data": { ...raw row... } } ] }
Return ONLY a JSON object of the form:
{ "records": [ { "index": <int>, ...all CRM fields... } ] }
Rules:
- Produce EXACTLY ONE output object per input row.
- Echo back the same "index" you received so rows can be re-aligned.
- Include every CRM field on every record (empty string if unknown).
- Output valid JSON only. No markdown, no commentary, no code fences.`;
}

/**
 * Builds the user message for a single batch of rows.
 * @param {Array<Record<string, unknown>>} rows Raw parsed CSV rows.
 * @param {number} offset Absolute index of the first row in this batch.
 */
export function buildUserPayload(rows, offset) {
  return JSON.stringify({
    rows: rows.map((data, i) => ({ index: offset + i, data })),
  });
}
