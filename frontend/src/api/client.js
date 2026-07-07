/**
 * Base URL of the backend API.
 * In dev it defaults to the local Express server. In production, set
 * VITE_API_URL in the frontend host's environment (e.g. Vercel) to the
 * deployed backend URL.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Send the CSV file to the backend for AI extraction.
 * @param {File} file
 * @returns {Promise<object>} the `data` object: { imported, skipped, totals... }
 */
export async function importCsvFile(file) {
  const form = new FormData();
  form.append('file', file);

  let res;
  try {
    res = await fetch(`${API_URL}/api/import`, {
      method: 'POST',
      body: form,
    });
  } catch {
    throw new Error(
      'Could not reach the server. Is the backend running and VITE_API_URL correct?'
    );
  }

  let payload;
  try {
    payload = await res.json();
  } catch {
    throw new Error(`Server returned an unexpected response (${res.status}).`);
  }

  if (!res.ok || !payload.success) {
    throw new Error(payload?.error || `Import failed (${res.status}).`);
  }

  return payload.data;
}

/** The 15 CRM fields, in display order (mirrors the backend schema). */
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

export const API_BASE = API_URL;
