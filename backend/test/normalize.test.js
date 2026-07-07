import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecord, evaluateRecord } from '../src/utils/normalize.js';
import { CRM_FIELDS } from '../src/config/crmSchema.js';

test('normalizeRecord returns every CRM field', () => {
  const rec = normalizeRecord({ name: 'John' });
  for (const field of CRM_FIELDS) {
    assert.ok(field in rec, `missing field ${field}`);
  }
  assert.equal(rec.name, 'John');
});

test('normalizeRecord whitelists crm_status', () => {
  assert.equal(normalizeRecord({ crm_status: 'SALE_DONE' }).crm_status, 'SALE_DONE');
  assert.equal(normalizeRecord({ crm_status: 'random_value' }).crm_status, '');
});

test('normalizeRecord whitelists data_source', () => {
  assert.equal(normalizeRecord({ data_source: 'eden_park' }).data_source, 'eden_park');
  assert.equal(normalizeRecord({ data_source: 'facebook' }).data_source, '');
});

test('normalizeRecord blanks unparseable created_at', () => {
  assert.equal(normalizeRecord({ created_at: 'not a date' }).created_at, '');
  assert.equal(
    normalizeRecord({ created_at: '2026-05-13 14:20:48' }).created_at,
    '2026-05-13 14:20:48'
  );
});

test('normalizeRecord escapes newlines to keep CSV single-row', () => {
  const rec = normalizeRecord({ crm_note: 'line one\nline two' });
  assert.equal(rec.crm_note.includes('\n'), false);
  assert.ok(rec.crm_note.includes('\\n'));
});

test('evaluateRecord skips rows with no email and no mobile', () => {
  assert.equal(evaluateRecord(normalizeRecord({ name: 'X' })).ok, false);
});

test('evaluateRecord keeps rows with an email only', () => {
  assert.equal(evaluateRecord(normalizeRecord({ email: 'a@b.com' })).ok, true);
});

test('evaluateRecord keeps rows with a mobile only', () => {
  assert.equal(
    evaluateRecord(normalizeRecord({ mobile_without_country_code: '9876543210' })).ok,
    true
  );
});
