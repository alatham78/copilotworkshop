import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from './services/taskService.js';

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function printTasks(tasks) {
  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  for (const task of tasks) {
    console.log(
      `${task.id} | ${task.title} | ${task.status} | ${task.priority} | ${task.createdAt}`,
    );
  }
}

/**
 * Runs a demonstration of all Task Manager features.
 */
function main() {
  try {
    printSection('Create tasks');
    const task1 = createTask({
      title: 'Write CLI plan',
      description: 'Draft project plan for task manager',
      status: 'todo',
      priority: 'high',
    });

    const task2 = createTask({
      title: 'Implement validators',
      description: 'Add reusable validation helpers',
      status: 'in-progress',
      priority: 'medium',
    });

    const task3 = createTask({
      title: 'Refine docs',
      description: 'Update schema with validation notes',
      status: 'done',
      priority: 'low',
    });

    console.log(task1);
    console.log(task2);
    console.log(task3);

    printSection('List all tasks sorted by creation date');
    printTasks(listTasks({ sortBy: 'createdAt' }));

    printSection('Filter by status=todo');
    printTasks(listTasks({ status: 'todo', sortBy: 'createdAt' }));

    printSection('Filter by priority=high and sort by priority');
    printTasks(listTasks({ priority: 'high', sortBy: 'priority' }));

    printSection('Get task by id');
    console.log(getTaskById(task2.id));

    printSection('Update task');
    const updated = updateTask(task2.id, {
      status: 'done',
      priority: 'high',
      title: 'Implement validation utilities',
    });
    console.log(updated);

    printSection('Delete task');
    const removed = deleteTask(task3.id);
    console.log(removed);

    printSection('Final list');
    printTasks(listTasks({ sortBy: 'priority' }));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
