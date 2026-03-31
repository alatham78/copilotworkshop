import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sortTasks,
  validateIsoTimestamp,
  validateListOptions,
  validateTaskId,
  validateTaskPayload,
} from '../src/utils/validators.js';

test('validateTaskId returns the id when valid', () => {
  assert.equal(validateTaskId('task-123'), 'task-123');
});

test('validateTaskId rejects non-string ids', () => {
  assert.throws(() => validateTaskId(123), /id must be a string/);
});

test('validateTaskId rejects empty strings', () => {
  assert.throws(() => validateTaskId('   '), /id must not be empty/);
});

test('validateIsoTimestamp returns value for valid ISO timestamp', () => {
  const value = '2026-03-31T12:00:00.000Z';

  assert.equal(validateIsoTimestamp(value, 'createdAt'), value);
});

test('validateIsoTimestamp rejects invalid timestamp format', () => {
  assert.throws(
    () => validateIsoTimestamp('03/31/2026 12:00:00', 'createdAt'),
    /createdAt must be a valid ISO-8601 UTC timestamp/,
  );
});

test('validateTaskPayload requires title for non-partial payloads', () => {
  assert.throws(
    () => validateTaskPayload({ status: 'todo' }, { partial: false }),
    /title is required/,
  );
});

test('validateTaskPayload rejects empty partial payloads', () => {
  assert.throws(
    () => validateTaskPayload({}, { partial: true }),
    /at least one updatable field is required/,
  );
});

test('validateTaskPayload rejects title longer than 120 chars', () => {
  assert.throws(
    () => validateTaskPayload({ title: 'a'.repeat(121) }, { partial: false }),
    /title must be at most 120 characters/,
  );
});

test('validateTaskPayload rejects invalid status values', () => {
  assert.throws(
    () => validateTaskPayload({ title: 'X', status: 'blocked' }, { partial: false }),
    /status must be one of: todo, in-progress, done/,
  );
});

test('validateTaskPayload returns a shallow copy when valid', () => {
  const payload = { title: 'Write docs', description: 'For release notes' };
  const result = validateTaskPayload(payload, { partial: false });

  assert.deepEqual(result, payload);
  assert.notEqual(result, payload);
});

test('validateListOptions applies default sortBy when omitted', () => {
  const result = validateListOptions({ status: 'todo' });

  assert.equal(result.sortBy, 'createdAt');
});

test('validateListOptions rejects invalid priority filter', () => {
  assert.throws(
    () => validateListOptions({ priority: 'urgent' }),
    /priority filter must be one of: low, medium, high/,
  );
});

test('sortTasks sorts by priority in high-medium-low order', () => {
  const tasks = [
    { priority: 'low' },
    { priority: 'high' },
    { priority: 'medium' },
  ];

  const sorted = sortTasks(tasks, 'priority');

  assert.deepEqual(sorted.map((task) => task.priority), ['high', 'medium', 'low']);
});

test('sortTasks sorts by createdAt ascending', () => {
  const tasks = [
    { createdAt: '2026-03-31T12:00:00.000Z' },
    { createdAt: '2026-03-31T10:00:00.000Z' },
    { createdAt: '2026-03-31T11:00:00.000Z' },
  ];

  const sorted = sortTasks(tasks, 'createdAt');

  assert.deepEqual(sorted.map((task) => task.createdAt), [
    '2026-03-31T10:00:00.000Z',
    '2026-03-31T11:00:00.000Z',
    '2026-03-31T12:00:00.000Z',
  ]);
});

test('sortTasks rejects non-array tasks input', () => {
  assert.throws(() => sortTasks('not-an-array', 'priority'), /tasks must be an array/);
});

test('sortTasks rejects invalid priority inside task objects', () => {
  assert.throws(
    () => sortTasks([{ priority: 'urgent' }], 'priority'),
    /task priority value is invalid/,
  );
});
