import Papa from 'papaparse';

/**
 * Parse a raw CSV buffer/string into an array of row objects keyed by header.
 * We do not assume any particular columns exist — that is the whole point of
 * the assignment. We only turn the file into structured rows here; meaning is
 * assigned later by the AI layer.
 *
 * @param {string} csvText
 * @returns {{ rows: Array<Record<string, string>>, headers: string[] }}
 */
export function parseCsv(csvText) {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => (h || '').trim(),
    dynamicTyping: false,
  });

  if (result.errors && result.errors.length) {
    // Papa is tolerant; we only hard-fail if nothing usable came out.
    const fatal = result.errors.filter((e) => e.type === 'Delimiter');
    if (fatal.length && (!result.data || result.data.length === 0)) {
      throw new Error(`Could not parse CSV: ${fatal[0].message}`);
    }
  }

  const rows = (result.data || []).filter(
    (row) => row && Object.values(row).some((v) => String(v ?? '').trim() !== '')
  );

  const headers = result.meta?.fields || (rows[0] ? Object.keys(rows[0]) : []);

  return { rows, headers };
}
