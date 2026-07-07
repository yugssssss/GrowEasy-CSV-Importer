import OpenAI from 'openai';
import { env } from '../config/env.js';
import { buildSystemPrompt, buildUserPayload } from '../prompts/extraction.prompt.js';
import { normalizeRecord } from '../utils/normalize.js';
import { chunk, runPool, withRetry, log } from '../utils/helpers.js';

let client = null;

/** Lazily create the OpenAI client so a missing key doesn't crash boot. */
function getClient() {
  if (!env.openaiApiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Add it to backend/.env and restart the server.'
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
}

const SYSTEM_PROMPT = buildSystemPrompt();

/**
 * Send ONE batch of raw rows to the model and return normalised CRM records,
 * aligned back to their absolute row index.
 *
 * @param {Array<Record<string, unknown>>} rows
 * @param {number} offset absolute index of the first row in this batch
 * @returns {Promise<Array<{ index: number, record: object }>>}
 */
async function extractBatch(rows, offset) {
  const run = async () => {
    const completion = await getClient().chat.completions.create({
      model: env.openaiModel,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPayload(rows, offset) },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('Model returned invalid JSON');
    }

    const records = Array.isArray(parsed.records) ? parsed.records : [];
    return records;
  };

  const records = await withRetry(run, {
    retries: env.maxRetries,
    label: `AI batch @${offset}`,
  });

  // Re-align results by the echoed index. Fall back to positional mapping if
  // the model dropped the index for some rows.
  const byIndex = new Map();
  records.forEach((r, i) => {
    const idx = Number.isInteger(r?.index) ? r.index : offset + i;
    byIndex.set(idx, r);
  });

  return rows.map((_, i) => {
    const absolute = offset + i;
    const raw = byIndex.get(absolute) ?? records[i] ?? {};
    return { index: absolute, record: normalizeRecord(raw) };
  });
}

/**
 * Extract every row in the CSV by fanning out batches with bounded concurrency.
 * Failed batches are retried internally; if a batch still fails after all
 * retries we surface a clear error rather than silently losing rows.
 *
 * @param {Array<Record<string, unknown>>} rows
 * @returns {Promise<object[]>} normalised CRM records in original row order
 */
export async function extractRecords(rows) {
  const batches = chunk(rows, env.batchSize);
  log.info(
    `Extracting ${rows.length} rows in ${batches.length} batch(es) of up to ${env.batchSize} (concurrency ${env.batchConcurrency}).`
  );

  const tasks = batches.map((batch, b) => {
    const offset = b * env.batchSize;
    return () => extractBatch(batch, offset);
  });

  const batchResults = await runPool(tasks, env.batchConcurrency);

  // Flatten and restore original order by absolute index.
  const flat = batchResults.flat();
  flat.sort((a, b) => a.index - b.index);
  return flat.map((item) => item.record);
}
