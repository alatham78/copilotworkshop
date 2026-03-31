# Project Plan: Task Manager CLI

## 1. Project Overview

A command-line Task Manager application built with Node.js 20+ using only
built-in modules. Users can create, list, update, and delete tasks entirely
from the terminal. Each task carries a title, description, status, and
priority. All data is kept in memory for the duration of a session and
organized through filtering and sorting helpers, making the app a
self-contained, dependency-free workshop exercise.

---

## 2. User Stories

1. **Create a task**
   - As a user, I can run `task add` with a title, description, priority, and
     status so that a new task is recorded.
   - Acceptance criteria:
     - Task is assigned a unique numeric ID.
     - `createdAt` and `updatedAt` are set to the current ISO timestamp.
     - Default status is `todo`; default priority is `medium` if omitted.
     - Confirmation message is printed with the new task ID.

2. **List all tasks**
   - As a user, I can run `task list` to see every task in a formatted table.
   - Acceptance criteria:
     - Columns: ID, Title, Status, Priority, Created.
     - Tasks are displayed in creation-date order by default.
     - An empty list prints a friendly "No tasks found." message.

3. **Filter tasks**
   - As a user, I can pass `--status` or `--priority` flags to `task list` to
     narrow the results.
   - Acceptance criteria:
     - `--status todo|in-progress|done` filters by status.
     - `--priority low|medium|high` filters by priority.
     - Invalid filter values print a usage error and exit with code 1.

4. **Sort tasks**
   - As a user, I can pass `--sort` to `task list` to change the ordering.
   - Acceptance criteria:
     - `--sort priority` orders high → medium → low.
     - `--sort date` orders oldest → newest (default).
     - Unknown sort values print a usage error and exit with code 1.

5. **View a single task**
   - As a user, I can run `task show <id>` to see all fields of one task.
   - Acceptance criteria:
     - All fields (id, title, description, status, priority, createdAt,
       updatedAt) are printed.
     - Unknown ID prints "Task not found." and exits with code 1.

6. **Update a task**
   - As a user, I can run `task update <id>` with one or more flags to change
     task fields.
   - Acceptance criteria:
     - Updatable fields: `--title`, `--description`, `--status`,
       `--priority`.
     - `updatedAt` is refreshed to the current timestamp.
     - Confirmation message is printed with the updated task ID.
     - Unknown ID prints "Task not found." and exits with code 1.

7. **Delete a task**
   - As a user, I can run `task delete <id>` to remove a task permanently.
   - Acceptance criteria:
     - Task is removed from the in-memory list.
     - Confirmation message is printed.
     - Unknown ID prints "Task not found." and exits with code 1.

8. **Help text**
   - As a user, I can run `task --help` or `task <command> --help` to read
     usage instructions.
   - Acceptance criteria:
     - Every command and its flags are described.
     - Output is readable in a standard 80-column terminal.

---

## 3. Data Model

### Task

| Property      | Type     | Values / Notes                          |
|---------------|----------|-----------------------------------------|
| `id`          | `number` | Auto-incrementing integer, starts at 1  |
| `title`       | `string` | Required, non-empty                     |
| `description` | `string` | Optional, defaults to `""`             |
| `status`      | `string` | `"todo"` \| `"in-progress"` \| `"done"` |
| `priority`    | `string` | `"low"` \| `"medium"` \| `"high"`       |
| `createdAt`   | `string` | ISO 8601 timestamp                      |
| `updatedAt`   | `string` | ISO 8601 timestamp                      |

**In-memory store:** a plain `Array` of Task objects held in module scope
inside `src/store.js`. No persistence between process runs.

---

## 4. File Structure

```
src/
├── index.js          # Entry point – parses argv and dispatches commands
├── commands/
│   ├── add.js        # Implements `task add`
│   ├── list.js       # Implements `task list` (filter + sort)
│   ├── show.js       # Implements `task show <id>`
│   ├── update.js     # Implements `task update <id>`
│   └── delete.js     # Implements `task delete <id>`
├── store.js          # In-memory task array + CRUD helpers
├── validate.js       # Input validation (status values, priority values, etc.)
└── format.js         # Table/output formatting utilities
```

---

## 5. Implementation Phases

### Phase 1 — Core Data Layer
- Implement `src/store.js`: in-memory array, `add`, `getAll`, `getById`,
  `update`, `remove` helpers.
- Implement `src/validate.js`: guard functions for status and priority enums.

### Phase 2 — CLI Entry Point
- Implement `src/index.js`: parse `process.argv`, dispatch to the correct
  command module, print usage/help when no command is given.

### Phase 3 — CRUD Commands
- Implement `add.js`, `show.js`, `update.js`, `delete.js` using the store
  helpers.
- Each command prints a confirmation or error message, then exits with the
  appropriate code.

### Phase 4 — List, Filter & Sort
- Implement `list.js` with table formatting via `src/format.js`.
- Add `--status`, `--priority`, and `--sort` flag handling.
- Validate flag values and reject unknown options.

### Phase 5 — Help Text & Polish
- Add `--help` output for every command.
- Align table columns, truncate long titles, add a row count footer.
- Manual end-to-end testing of all commands and edge cases.

---

## 6. Error Handling Conventions

### Exit Codes

| Code | Meaning                                      |
|------|----------------------------------------------|
| `0`  | Success                                      |
| `1`  | Validation error or unknown input            |
| `2`  | Task not found (unknown ID)                  |

### Error Message Format

All errors are written to **stderr** (`process.stderr.write`) so that stdout
remains clean for piping. The format is:

```
Error: <human-readable message>
```

### Rules

- **Never throw** uncaught exceptions from command modules; catch and convert
  to a formatted error + `process.exit(code)`.
- Unknown sub-commands print a usage summary and exit `1`.
- Missing required arguments (e.g., no `<id>` for `show`) print a per-command
  usage hint and exit `1`.
- Numeric IDs that cannot be parsed as positive integers are rejected before
  any store lookup.
- Unrecognised flag names (anything starting with `--` that is not documented)
  print an "Unknown option" error and exit `1`.

---

## 7. Input Validation Rules

Validation lives entirely in `src/validate.js` and is called by command
modules before touching the store.

### Title
- Required for `add`; optional (but non-empty if supplied) for `update`.
- Must be a non-empty string after trimming whitespace.
- Maximum length: **120 characters**.

### Description
- Optional. Defaults to `""` when omitted.
- No maximum length enforced (truncated in table view only).

### Status
- Must be one of: `"todo"`, `"in-progress"`, `"done"` (case-sensitive).
- Invalid value → error message listing accepted values, exit `1`.

### Priority
- Must be one of: `"low"`, `"medium"`, `"high"` (case-sensitive).
- Invalid value → error message listing accepted values, exit `1`.

### ID
- Must be a positive integer (`> 0`).
- Non-numeric or zero/negative values → `"Invalid ID: must be a positive integer"`, exit `1`.
- ID not present in the store → `"Task not found."`, exit `2`.

### `--sort` flag
- Must be one of: `"priority"`, `"date"`.
- Invalid value → error message listing accepted values, exit `1`.

### General
- Flags that expect a value but receive none (e.g., `--title` with nothing
  after it) are treated as validation errors, not silently ignored.
- Validation functions return `{ valid: true }` on success or
  `{ valid: false, message: string }` on failure — no exceptions.
