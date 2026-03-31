import { Task } from '../models/task.js';
import {
  sortTasks,
  validateListOptions,
  validateTaskId,
  validateTaskPayload,
} from '../utils/validators.js';

const tasks = [];

/**
 * Creates a task and stores it in memory.
 * @param {object} input - Task creation input.
 * @returns {object} Created task.
 */
export function createTask(input) {
  try {
    validateTaskPayload(input, { partial: false });
    const task = new Task(input);
    tasks.push(task);
    return task.toJSON();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid input: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Lists tasks with optional filtering and sorting.
 * @param {object} [options={}] - Filter and sort options.
 * @returns {Array<object>} Matching tasks.
 */
export function listTasks(options = {}) {
  try {
    const validatedOptions = validateListOptions(options);

    const filtered = tasks
      .map((task) => task.toJSON())
      .filter((task) => {
        const statusMatch = validatedOptions.status
          ? task.status === validatedOptions.status
          : true;
        const priorityMatch = validatedOptions.priority
          ? task.priority === validatedOptions.priority
          : true;

        return statusMatch && priorityMatch;
      });

    return sortTasks(filtered, validatedOptions.sortBy);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid input: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Gets one task by id.
 * @param {string} id - Task id.
 * @returns {object} Found task.
 */
export function getTaskById(id) {
  try {
    validateTaskId(id);

    const task = tasks.find((item) => item.id === id);

    if (!task) {
      throw new Error(`Task not found for id: ${id}`);
    }

    return task.toJSON();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid input: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Updates one task by id.
 * @param {string} id - Task id.
 * @param {object} updates - Partial task updates.
 * @returns {object} Updated task.
 */
export function updateTask(id, updates) {
  try {
    validateTaskId(id);
    validateTaskPayload(updates, { partial: true });

    const task = tasks.find((item) => item.id === id);

    if (!task) {
      throw new Error(`Task not found for id: ${id}`);
    }

    task.update(updates);
    return task.toJSON();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid input: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Deletes one task by id.
 * @param {string} id - Task id.
 * @returns {object} Deleted task.
 */
export function deleteTask(id) {
  try {
    validateTaskId(id);

    const index = tasks.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`Task not found for id: ${id}`);
    }

    const [removedTask] = tasks.splice(index, 1);
    return removedTask.toJSON();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid input: ${error.message}`);
    }

    throw error;
  }
}
