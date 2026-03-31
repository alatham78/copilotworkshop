import test from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../src/models/task.js';

test('Task constructor applies defaults for optional fields', () => {
  const task = new Task({ title: 'Write tests' });

  assert.equal(task.description, '');
  assert.equal(task.status, 'todo');
  assert.equal(task.priority, 'medium');
  assert.equal(typeof task.id, 'string');
  assert.equal(typeof task.createdAt, 'string');
  assert.equal(typeof task.updatedAt, 'string');
});

test('Task constructor trims title whitespace', () => {
  const task = new Task({ title: '  Trim me  ' });

  assert.equal(task.title, 'Trim me');
});

test('Task constructor accepts a title with exactly 120 characters', () => {
  const title = 'x'.repeat(120);
  const task = new Task({ title });

  assert.equal(task.title.length, 120);
});

test('Task constructor rejects a title longer than 120 characters', () => {
  const title = 'x'.repeat(121);

  assert.throws(
    () => new Task({ title }),
    /title must be at most 120 characters/,
  );
});

test('Task constructor accepts a description with exactly 1000 characters', () => {
  const description = 'd'.repeat(1000);
  const task = new Task({ title: 'Boundary description', description });

  assert.equal(task.description.length, 1000);
});

test('Task constructor rejects a description longer than 1000 characters', () => {
  const description = 'd'.repeat(1001);

  assert.throws(
    () => new Task({ title: 'Too long description', description }),
    /description must be at most 1000 characters/,
  );
});

test('Task constructor rejects a non-string title type', () => {
  assert.throws(
    () => new Task({ title: 12345 }),
    /title must be a string/,
  );
});

test('Task constructor rejects updatedAt earlier than createdAt', () => {
  assert.throws(
    () =>
      new Task({
        title: 'Bad timestamps',
        createdAt: '2026-03-31T12:00:00.000Z',
        updatedAt: '2026-03-31T11:00:00.000Z',
      }),
    /updatedAt must be greater than or equal to createdAt/,
  );
});

test('Task constructor rejects an empty id string', () => {
  assert.throws(
    () => new Task({ id: '   ', title: 'Bad id' }),
    /id must not be empty/,
  );
});

test('Task update changes provided fields only', () => {
  const task = new Task({
    title: 'Original title',
    description: 'Original description',
    status: 'todo',
    priority: 'low',
  });

  task.update({ title: 'Updated title', status: 'done' });

  assert.equal(task.title, 'Updated title');
  assert.equal(task.status, 'done');
  assert.equal(task.description, 'Original description');
  assert.equal(task.priority, 'low');
});

test('Task update refreshes updatedAt timestamp', async () => {
  const task = new Task({ title: 'Timestamp test' });
  const beforeUpdate = task.updatedAt;

  await new Promise((resolve) => setTimeout(resolve, 2));
  task.update({ status: 'in-progress' });

  assert.ok(new Date(task.updatedAt).getTime() >= new Date(beforeUpdate).getTime());
});

test('Task update rejects an empty partial update object', () => {
  const task = new Task({ title: 'No-op update' });

  assert.throws(() => task.update({}), /at least one updatable field is required/);
});

test('Task update rejects type mismatches for status', () => {
  const task = new Task({ title: 'Bad status update' });

  assert.throws(
    () => task.update({ status: 1 }),
    /status must be a string/,
  );
});

test('Task instances can be created with duplicate ids', () => {
  const first = new Task({ id: 'task-duplicate', title: 'First task' });
  const second = new Task({ id: 'task-duplicate', title: 'Second task' });

  assert.equal(first.id, second.id);
});

test('Task handles multiple updates while iterating update payloads', () => {
  const task = new Task({ title: 'Iterative updates' });
  const updates = [
    { status: 'in-progress' },
    { priority: 'high' },
    { description: 'Updated in loop' },
  ];

  for (const payload of updates) {
    task.update(payload);
  }

  assert.deepEqual(
    { status: task.status, priority: task.priority, description: task.description },
    { status: 'in-progress', priority: 'high', description: 'Updated in loop' },
  );
});

test('Task constructor defaults category to general', () => {
  const task = new Task({ title: 'Default category' });

  assert.equal(task.category, 'general');
});

test('Task constructor stores an explicit category value', () => {
  const task = new Task({ title: 'Explicit category', category: 'work' });

  assert.equal(task.category, 'work');
});

test('Task constructor trims category whitespace', () => {
  const task = new Task({ title: 'Trimmed category', category: '  personal  ' });

  assert.equal(task.category, 'personal');
});

test('Task constructor rejects a non-string category', () => {
  assert.throws(
    () => new Task({ title: 'Bad category type', category: 99 }),
    /category must be a string/,
  );
});

test('Task constructor rejects a category longer than 50 characters', () => {
  assert.throws(
    () => new Task({ title: 'Long category', category: 'c'.repeat(51) }),
    /category must be at most 50 characters/,
  );
});

test('Task constructor accepts a category with exactly 50 characters', () => {
  const category = 'c'.repeat(50);
  const task = new Task({ title: 'Max category', category });

  assert.equal(task.category, category);
});

test('Task update changes category field', () => {
  const task = new Task({ title: 'Update category', category: 'work' });

  task.update({ category: 'personal' });

  assert.equal(task.category, 'personal');
});

test('Task update rejects a whitespace-only category', () => {
  const task = new Task({ title: 'Fallback category', category: 'work' });

  assert.throws(
    () => task.update({ category: '   ' }),
    /category must not be empty after trimming/,
  );
});

test('Task toJSON returns expected task fields', () => {
  const task = new Task({
    id: 'task-json-1',
    title: 'Serialize me',
    description: 'For toJSON',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-03-31T12:00:00.000Z',
    updatedAt: '2026-03-31T12:00:00.000Z',
  });

  assert.deepEqual(task.toJSON(), {
    id: 'task-json-1',
    title: 'Serialize me',
    description: 'For toJSON',
    status: 'in-progress',
    priority: 'high',
    category: 'general',
    createdAt: '2026-03-31T12:00:00.000Z',
    updatedAt: '2026-03-31T12:00:00.000Z',
  });
});
