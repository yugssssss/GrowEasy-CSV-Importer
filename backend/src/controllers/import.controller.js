import { env } from '../config/env.js';
import { parseCsv } from '../services/csv.service.js';
import { extractRecords } from '../services/ai.service.js';
import { evaluateRecord } from '../utils/normalize.js';
import { log } from '../utils/helpers.js';

/**
 * POST /api/import
 * Accepts a multipart file field named "file" (a CSV), or a JSON body of the
 * shape { csv: "<raw csv text>" }. Runs the full pipeline and returns the
 * structured result the frontend renders.
 */
export async function importCsv(req, res, next) {
  try {
    // 1. Get raw CSV text from either an uploaded file or a JSON body.
    let csvText = '';
    if (req.file?.buffer) {
      csvText = req.file.buffer.toString('utf-8');
    } else if (typeof req.body?.csv === 'string') {
      csvText = req.body.csv;
    }

    if (!csvText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'No CSV content received. Upload a file field named "file".',
      });
    }

    // 2. Parse CSV into structured rows (no assumptions about columns).
    const { rows, headers } = parseCsv(csvText);

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'The CSV appears to be empty or has no data rows.',
      });
    }

    if (rows.length > env.maxRows) {
      return res.status(413).json({
        success: false,
        error: `CSV has ${rows.length} rows, which exceeds the limit of ${env.maxRows}.`,
      });
    }

    // 3. AI extraction (batched + retried inside the service).
    const records = await extractRecords(rows);

    // 4. Apply the deterministic skip rule and split results.
    const imported = [];
    const skipped = [];

    records.forEach((record, i) => {
      const verdict = evaluateRecord(record);
      if (verdict.ok) {
        imported.push(record);
      } else {
        skipped.push({
          row: i + 1,
          reason: verdict.reason,
          original: rows[i],
        });
      }
    });

    log.info(
      `Import complete: ${imported.length} imported, ${skipped.length} skipped, ${rows.length} total.`
    );

    return res.json({
      success: true,
      data: {
        imported,
        skipped,
        totalRows: rows.length,
        totalImported: imported.length,
        totalSkipped: skipped.length,
        detectedHeaders: headers,
        model: env.openaiModel,
      },
    });
  } catch (err) {
    return next(err);
  }
}
