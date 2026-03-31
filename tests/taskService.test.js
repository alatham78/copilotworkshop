import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from '../src/services/taskService.js';

function createUniqueTask(overrides = {}) {
  const id = overrides.id ?? `task-${randomUUID()}`;

  return createTask({
    id,
    title: `Title ${id}`,
    description: `Description ${id}`,
    status: 'todo',
    priority: 'medium',
    ...overrides,
  });
}

test('createTask returns a created task object', () => {
  const task = createUniqueTask();

  assert.equal(typeof task.id, 'string');
  assert.equal(typeof task.title, 'string');
});

test('createTask wraps validation errors as invalid input errors', () => {
  assert.throws(() => createTask({}), /Invalid input: title is required/);
});

test('getTaskById returns the matching task', () => {
  const created = createUniqueTask();
  const found = getTaskById(created.id);

  assert.equal(found.id, created.id);
});

test('getTaskById throws when task id does not exist', () => {
  assert.throws(
    () => getTaskById(`missing-${randomUUID()}`),
    /Task not found for id:/,
  );
});

test('getTaskById wraps id validation errors', () => {
  assert.throws(() => getTaskById('   '), /Invalid input: id must not be empty/);
});

test('updateTask updates and returns the modified task', () => {
  const created = createUniqueTask({ status: 'todo', priority: 'low' });
  const updated = updateTask(created.id, { status: 'done', priority: 'high' });

  assert.equal(updated.status, 'done');
  assert.equal(updated.priority, 'high');
});

test('updateTask throws when task id does not exist', () => {
  assert.throws(
    () => updateTask(`missing-${randomUUID()}`, { status: 'done' }),
    /Task not found for id:/,
  );
});

test('deleteTask removes and returns the deleted task', () => {
  const created = createUniqueTask();
  const removed = deleteTask(created.id);

  assert.equal(removed.id, created.id);
  assert.throws(() => getTaskById(created.id), /Task not found for id:/);
});

test('deleteTask throws when task id does not exist', () => {
  assert.throws(() => deleteTask(`missing-${randomUUID()}`), /Task not found for id:/);
});

test('listTasks filters by status', () => {
  createUniqueTask({ status: 'todo' });
  createUniqueTask({ status: 'done' });

  const filtered = listTasks({ status: 'done', sortBy: 'createdAt' });

  assert.ok(filtered.length > 0);
  assert.ok(filtered.every((task) => task.status === 'done'));
});

test('listTasks filters by priority', () => {
  createUniqueTask({ priority: 'high' });
  createUniqueTask({ priority: 'low' });

  const filtered = listTasks({ priority: 'high', sortBy: 'createdAt' });

  assert.ok(filtered.length > 0);
  assert.ok(filtered.every((task) => task.priority === 'high'));
});

test('listTasks sorts by priority order high to low', () => {
  const base = randomUUID();
  const high = createUniqueTask({ id: `${base}-high`, priority: 'high' });
  const medium = createUniqueTask({ id: `${base}-medium`, priority: 'medium' });
  const low = createUniqueTask({ id: `${base}-low`, priority: 'low' });

  const ids = listTasks({ sortBy: 'priority' }).map((task) => task.id);

  assert.ok(ids.indexOf(high.id) < ids.indexOf(medium.id));
  assert.ok(ids.indexOf(medium.id) < ids.indexOf(low.id));
});

test('listTasks sorts by createdAt ascending', () => {
  const base = randomUUID();
  const early = createUniqueTask({
    id: `${base}-early`,
    createdAt: '2026-03-31T10:00:00.000Z',
    updatedAt: '2026-03-31T10:00:00.000Z',
  });
  const later = createUniqueTask({
    id: `${base}-later`,
    createdAt: '2026-03-31T12:00:00.000Z',
    updatedAt: '2026-03-31T12:00:00.000Z',
  });

  const ids = listTasks({ sortBy: 'createdAt' }).map((task) => task.id);

  assert.ok(ids.indexOf(early.id) < ids.indexOf(later.id));
});

test('listTasks returns copies instead of internal state references', () => {
  const created = createUniqueTask({ title: 'Immutable snapshot' });
  const listed = listTasks({ sortBy: 'createdAt' });
  const fromList = listed.find((task) => task.id === created.id);

  fromList.title = 'Mutated outside service';

  const foundAgain = getTaskById(created.id);
  assert.equal(foundAgain.title, 'Immutable snapshot');
});
