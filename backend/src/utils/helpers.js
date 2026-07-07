/** Split an array into fixed-size chunks. */
export function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

/** Simple promise-based delay. */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run async tasks with a bounded concurrency (a tiny pool), preserving the
 * order of results. Keeps us from firing hundreds of OpenAI calls at once on a
 * large CSV while still being much faster than a fully sequential loop.
 *
 * @template T
 * @param {Array<() => Promise<T>>} tasks
 * @param {number} concurrency
 * @returns {Promise<T[]>}
 */
export async function runPool(tasks, concurrency) {
  const results = new Array(tasks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const current = cursor++;
      results[current] = await tasks[current]();
    }
  }

  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, tasks.length)) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

/**
 * Retry an async function with exponential backoff.
 * @template T
 * @param {() => Promise<T>} fn
 * @param {{ retries: number, baseDelayMs?: number, label?: string }} opts
 */
export async function withRetry(fn, { retries, baseDelayMs = 600, label = 'task' }) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = baseDelayMs * 2 ** attempt;
        // eslint-disable-next-line no-console
        console.warn(
          `[retry] ${label} failed (attempt ${attempt + 1}/${retries + 1}): ${err.message}. Retrying in ${delay}ms.`
        );
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

/** Tiny structured logger so output stays consistent and greppable. */
export const log = {
  info: (msg, meta) => console.log(`[info] ${msg}`, meta ?? ''),
  warn: (msg, meta) => console.warn(`[warn] ${msg}`, meta ?? ''),
  error: (msg, meta) => console.error(`[error] ${msg}`, meta ?? ''),
};
