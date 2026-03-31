import chalk from 'chalk';

const STATUS_COLORS = {
  done: chalk.green,
  'in-progress': chalk.yellow,
  todo: chalk.red,
};

const PRIORITY_COLORS = {
  high: chalk.bold.red,
  medium: chalk.bold.yellow,
  low: chalk.dim,
};

/**
 * Returns a status string wrapped in the configured chalk style.
 *
 * @param {string} status - The task status to colorize.
 * @returns {string} Colorized status text.
 * @throws {TypeError} If status is not a supported status string.
 *
 * @example
 * colorStatus('done');
 *
 * @example
 * colorStatus('todo');
 */
export function colorStatus(status) {
  if (typeof status !== 'string') {
    throw new TypeError('status must be a string');
  }

  const formatter = STATUS_COLORS[status];
  if (!formatter) {
    throw new TypeError('status must be one of: todo, in-progress, done');
  }

  return formatter(status);
}

/**
 * Returns a priority string wrapped in the configured chalk style.
 *
 * @param {string} priority - The task priority to colorize.
 * @returns {string} Colorized priority text.
 * @throws {TypeError} If priority is not a supported priority string.
 *
 * @example
 * colorPriority('high');
 *
 * @example
 * colorPriority('low');
 */
export function colorPriority(priority) {
  if (typeof priority !== 'string') {
    throw new TypeError('priority must be a string');
  }

  const formatter = PRIORITY_COLORS[priority];
  if (!formatter) {
    throw new TypeError('priority must be one of: low, medium, high');
  }

  return formatter(priority);
}
