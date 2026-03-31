import { randomUUID } from 'node:crypto';
import {
  validateTaskPayload,
  validateTaskId,
  validateIsoTimestamp,
} from '../utils/validators.js';

/**
 * Represents a single task in the in-memory task manager.
 */
export class Task {
  /**
   * Creates a new task instance with validated values.
   * @param {object} input - Task input values.
   * @param {string} input.title - Short task title.
   * @param {string} [input.description=''] - Task description.
   * @param {'todo'|'in-progress'|'done'} [input.status='todo'] - Task status.
   * @param {'low'|'medium'|'high'} [input.priority='medium'] - Task priority.
   * @param {string} [input.id] - Optional task id.
   * @param {string} [input.createdAt] - Optional creation timestamp.
   * @param {string} [input.updatedAt] - Optional update timestamp.
   */
  constructor(input) {
    validateTaskPayload(input, { partial: false });

    const now = new Date().toISOString();
    const createdAt = input.createdAt ?? now;
    const updatedAt = input.updatedAt ?? now;

    validateIsoTimestamp(createdAt, 'createdAt');
    validateIsoTimestamp(updatedAt, 'updatedAt');

    if (new Date(updatedAt).getTime() < new Date(createdAt).getTime()) {
      throw new TypeError('updatedAt must be greater than or equal to createdAt');
    }

    this.id = input.id ?? randomUUID();
    validateTaskId(this.id);

    this.title = input.title.trim();
    this.description = input.description ?? '';
    this.status = input.status ?? 'todo';
    this.priority = input.priority ?? 'medium';
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Applies validated updates to this task and refreshes updatedAt.
   * @param {object} updates - Partial task updates.
   * @param {string} [updates.title] - Updated task title.
   * @param {string} [updates.description] - Updated description.
   * @param {'todo'|'in-progress'|'done'} [updates.status] - Updated status.
   * @param {'low'|'medium'|'high'} [updates.priority] - Updated priority.
   * @returns {Task} The updated task instance.
   */
  update(updates) {
    validateTaskPayload(updates, { partial: true });

    if (Object.hasOwn(updates, 'title')) {
      this.title = updates.title.trim();
    }

    if (Object.hasOwn(updates, 'description')) {
      this.description = updates.description;
    }

    if (Object.hasOwn(updates, 'status')) {
      this.status = updates.status;
    }

    if (Object.hasOwn(updates, 'priority')) {
      this.priority = updates.priority;
    }

    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Converts this task into a plain JSON-safe object.
   * @returns {{id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string}} Plain task object.
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
