const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_SORT_VALUES = ['priority', 'createdAt'];

/**
 * Validates a task identifier.
 * @param {string} id - Candidate task id.
 * @returns {string} The same id when valid.
 * @example
 * validateTaskId('b7f0fdad-1e2d-4ea6-a9df-f23a01dbf2ba');
 * @example
 * validateTaskId('task-123');
 */
export function validateTaskId(id) {
  if (typeof id !== 'string') {
    throw new TypeError('id must be a string');
  }

  if (id.trim().length === 0) {
    throw new TypeError('id must not be empty');
  }

  return id;
}

/**
 * Validates that a value is an ISO-8601 timestamp string.
 * @param {string} value - Candidate timestamp.
 * @param {string} [fieldName='timestamp'] - Field name for error messages.
 * @returns {string} The same timestamp when valid.
 * @example
 * validateIsoTimestamp('2026-03-31T12:00:00.000Z', 'createdAt');
 * @example
 * validateIsoTimestamp(new Date().toISOString(), 'updatedAt');
 */
export function validateIsoTimestamp(value, fieldName = 'timestamp') {
  if (typeof value !== 'string') {
    throw new TypeError(`${fieldName} must be a string`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    throw new TypeError(`${fieldName} must be a valid ISO-8601 UTC timestamp`);
  }

  return value;
}

/**
 * Validates a task payload.
 * @param {object} payload - Input payload to validate.
 * @param {object} [options] - Validation options.
 * @param {boolean} [options.partial=false] - Allows partial payloads when true.
 * @returns {object} Sanitized payload copy.
 * @example
 * validateTaskPayload({ title: 'Write docs', priority: 'high' });
 * @example
 * validateTaskPayload({ status: 'done' }, { partial: true });
 */
export function validateTaskPayload(payload, options = {}) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('payload must be a plain object');
  }

  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be a plain object');
  }

  const partial = options.partial ?? false;

  if (typeof partial !== 'boolean') {
    throw new TypeError('options.partial must be a boolean');
  }

  const hasTitle = Object.hasOwn(payload, 'title');
  const hasDescription = Object.hasOwn(payload, 'description');
  const hasStatus = Object.hasOwn(payload, 'status');
  const hasPriority = Object.hasOwn(payload, 'priority');
  const hasCategory = Object.hasOwn(payload, 'category');

  if (!partial && !hasTitle) {
    throw new TypeError('title is required');
  }

  if (partial && !hasTitle && !hasDescription && !hasStatus && !hasPriority && !hasCategory) {
    throw new TypeError('at least one updatable field is required');
  }

  if (hasTitle) {
    if (typeof payload.title !== 'string') {
      throw new TypeError('title must be a string');
    }

    const title = payload.title.trim();

    if (title.length === 0) {
      throw new TypeError('title must not be empty');
    }

    if (title.length > 120) {
      throw new TypeError('title must be at most 120 characters');
    }
  }

  if (hasDescription) {
    if (typeof payload.description !== 'string') {
      throw new TypeError('description must be a string');
    }

    if (payload.description.length > 1000) {
      throw new TypeError('description must be at most 1000 characters');
    }
  }

  if (hasStatus) {
    if (typeof payload.status !== 'string') {
      throw new TypeError('status must be a string');
    }

    if (!VALID_STATUSES.includes(payload.status)) {
      throw new TypeError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  if (hasPriority) {
    if (typeof payload.priority !== 'string') {
      throw new TypeError('priority must be a string');
    }

    if (!VALID_PRIORITIES.includes(payload.priority)) {
      throw new TypeError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
  }

  if (hasCategory) {
    if (typeof payload.category !== 'string') {
      throw new TypeError('category must be a string');
    }

    const trimmed = payload.category.trim();

    if (trimmed.length === 0) {
      throw new TypeError('category must not be empty after trimming');
    }

    if (trimmed.length > 50) {
      throw new TypeError('category must be at most 50 characters');
    }
  }

  return { ...payload };
}

/**
 * Validates list options used for filtering and sorting tasks.
 * @param {object} options - Listing options.
 * @param {'todo'|'in-progress'|'done'} [options.status] - Optional status filter.
 * @param {'low'|'medium'|'high'} [options.priority] - Optional priority filter.
 * @param {'priority'|'createdAt'} [options.sortBy] - Sort key.
 * @returns {object} Validated options copy.
 * @example
 * validateListOptions({ status: 'todo', sortBy: 'priority' });
 * @example
 * validateListOptions({ priority: 'high', sortBy: 'createdAt' });
 */
export function validateListOptions(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be a plain object');
  }

  const hasStatus = Object.hasOwn(options, 'status');
  const hasPriority = Object.hasOwn(options, 'priority');
  const hasSortBy = Object.hasOwn(options, 'sortBy');
  const hasCategory = Object.hasOwn(options, 'category');

  if (hasStatus) {
    if (typeof options.status !== 'string') {
      throw new TypeError('status filter must be a string');
    }

    if (!VALID_STATUSES.includes(options.status)) {
      throw new TypeError(`status filter must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  if (hasPriority) {
    if (typeof options.priority !== 'string') {
      throw new TypeError('priority filter must be a string');
    }

    if (!VALID_PRIORITIES.includes(options.priority)) {
      throw new TypeError(`priority filter must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
  }

  if (hasSortBy) {
    if (typeof options.sortBy !== 'string') {
      throw new TypeError('sortBy must be a string');
    }

    if (!VALID_SORT_VALUES.includes(options.sortBy)) {
      throw new TypeError(`sortBy must be one of: ${VALID_SORT_VALUES.join(', ')}`);
    }
  }

  if (hasCategory) {
    if (typeof options.category !== 'string') {
      throw new TypeError('category filter must be a string');
    }

    if (options.category.trim().length === 0) {
      throw new TypeError('category filter must not be empty');
    }
  }

  return {
    status: options.status,
    priority: options.priority,
    category: options.category,
    sortBy: options.sortBy ?? 'createdAt',
  };
}

/**
 * Sorts task objects by priority or creation date and returns a new array.
 * @param {Array<object>} tasks - Tasks to sort.
 * @param {'priority'|'createdAt'} sortBy - Sort key.
 * @returns {Array<object>} A sorted array copy.
 * @example
 * sortTasks([{ priority: 'low' }, { priority: 'high' }], 'priority');
 * @example
 * sortTasks([{ createdAt: '2026-01-01T00:00:00.000Z' }], 'createdAt');
 */
export function sortTasks(tasks, sortBy) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('tasks must be an array');
  }

  if (typeof sortBy !== 'string') {
    throw new TypeError('sortBy must be a string');
  }

  if (!VALID_SORT_VALUES.includes(sortBy)) {
    throw new TypeError(`sortBy must be one of: ${VALID_SORT_VALUES.join(', ')}`);
  }

  const priorityOrder = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const sorted = [...tasks];

  if (sortBy === 'priority') {
    for (const task of sorted) {
      if (task === null || typeof task !== 'object') {
        throw new TypeError('each task must be an object');
      }

      if (typeof task.priority !== 'string') {
        throw new TypeError('each task must have a string priority');
      }

      if (!Object.hasOwn(priorityOrder, task.priority)) {
        throw new TypeError('task priority value is invalid');
      }
    }

    sorted.sort((a, b) => {
      if (a === null || typeof a !== 'object' || b === null || typeof b !== 'object') {
        throw new TypeError('each task must be an object');
      }

      if (typeof a.priority !== 'string' || typeof b.priority !== 'string') {
        throw new TypeError('each task must have a string priority');
      }

      if (!Object.hasOwn(priorityOrder, a.priority) || !Object.hasOwn(priorityOrder, b.priority)) {
        throw new TypeError('task priority value is invalid');
      }

      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return sorted;
  }

  for (const task of sorted) {
    if (task === null || typeof task !== 'object') {
      throw new TypeError('each task must be an object');
    }

    if (typeof task.createdAt !== 'string') {
      throw new TypeError('each task must have a string createdAt');
    }
  }

  sorted.sort((a, b) => {
    if (a === null || typeof a !== 'object' || b === null || typeof b !== 'object') {
      throw new TypeError('each task must be an object');
    }

    if (typeof a.createdAt !== 'string' || typeof b.createdAt !== 'string') {
      throw new TypeError('each task must have a string createdAt');
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return sorted;
}
