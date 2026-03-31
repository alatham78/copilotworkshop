# Task Manager CLI Technical Design

## 1. Data models

### Task

| Property | Type | Required | Validation rules |
| --- | --- | --- | --- |
| `id` | `number` | Yes | Must be a positive integer (`Number.isInteger(id) && id > 0`), unique across all tasks, and assigned only by the store auto-increment counter (starts at `1`). |
| `title` | `string` | Yes | Must be a string; `trim()` result is required (not empty/whitespace-only); max length `120` characters after trimming. |
| `description` | `string` | Yes | Must be a string; defaults to `''` when omitted; max length `1000` characters. |
| `status` | `string` | Yes | Must exactly match one allowed value: `todo`, `in-progress`, or `done` (case-sensitive, no aliases). |
| `priority` | `string` | Yes | Must exactly match one allowed value: `low`, `medium`, or `high` (case-sensitive, no aliases). |
| `createdAt` | `string` | Yes | Must be an ISO 8601 UTC timestamp string (`new Date(value).toISOString() === value`); set once on create and never mutated. |
| `updatedAt` | `string` | Yes | Must be an ISO 8601 UTC timestamp string; set on create; must be refreshed on each successful update; must be greater than or equal to `createdAt`. |
| `category` | `string` | No | Must be a string; `trim()` result is required (not empty/whitespace-only after trimming); max length `50` characters after trimming; defaults to `'general'` when omitted; no enum constraint (free-form); comparison is case-sensitive. |

### In-memory state

| Entity | Type | Required | Validation rules |
| --- | --- | --- | --- |
| `tasks` | `Task[]` | Yes | Plain array in module scope; only valid `Task` objects can be inserted. |
| `nextId` | `number` | Yes | Positive integer counter used for ID generation. |

## 2. File structure

```text
src/
├── index.js                 # CLI entry point; parses argv, routes commands, handles top-level errors/help
├── store.js                 # In-memory data store and CRUD primitives for Task records
├── validate.js              # Input validation for ids, enums, required strings, and flag values
├── format.js                # Output formatting helpers for tables and task detail rendering
└── commands/
    ├── add.js               # Implements `task add` argument parsing and task creation flow
    ├── list.js              # Implements `task list` with filtering (`--status`, `--priority`) and sorting (`--sort`)
    ├── show.js              # Implements `task show <id>` and full-field display for one task
    ├── update.js            # Implements `task update <id>` and partial field mutation
    └── delete.js            # Implements `task delete <id>` removal flow
```

## 3. Module responsibilities

### `src/store.js`
- Exports CRUD functions for in-memory tasks: create, list, get by ID, update by ID, delete by ID.
- Owns `tasks` and `nextId` module-scope state.
- Depends on no other local modules.

### `src/validate.js`
- Exports validators for:
  - status enum (`todo`, `in-progress`, `done`)
  - priority enum (`low`, `medium`, `high`)
  - positive integer IDs
  - non-empty title and optional update payload checks
  - sort values (`priority`, `date`)
  - category string (trimmed, non-empty, max 50 chars, free-form)
- Returns validation results in a non-throwing shape (for example, `{ valid: false, message }`).
- Depends on no other local modules.

### `src/format.js`
- Exports presentation helpers for list table rows/headers and single-task output.
- Contains priority/date display logic only (no data mutation).
- Depends on no other local modules.

### `src/commands/add.js`
- Exports command handler for creating tasks.
- Parses add flags (including optional `--category`), validates inputs via `validate.js`, writes through `store.js`, and prints confirmation.
- Depends on `store.js`, `validate.js`, and optionally `format.js`.

### `src/commands/list.js`
- Exports command handler for listing tasks.
- Reads all tasks from `store.js`, applies filter/sort rules (including optional `--category` filter), validates filter/sort options, and prints table output.
- Depends on `store.js`, `validate.js`, and `format.js`.

### `src/commands/show.js`
- Exports command handler for displaying one task.
- Validates ID, reads from `store.js`, and prints full details including the `category` field.
- Depends on `store.js`, `validate.js`, and `format.js`.

### `src/commands/update.js`
- Exports command handler for updating a task.
- Validates ID and changed fields (including optional `--category`), updates record via `store.js`, refreshes `updatedAt`, and prints confirmation.
- Depends on `store.js` and `validate.js`.

### `src/commands/delete.js`
- Exports command handler for deleting a task.
- Validates ID, removes the task via `store.js`, and prints confirmation.
- Depends on `store.js` and `validate.js`.

### `src/index.js`
- Exports and/or executes main CLI bootstrap function.
- Parses `process.argv`, dispatches to command handlers, prints global and per-command help text, and normalizes error exits.
- Depends on all files in `src/commands/` and shared helpers as needed.

## 4. Error handling strategy

### Error categories

1. `ValidationError` (usage/input issues)
- Triggered by invalid enum values, missing required flag values, empty title, invalid sort option, malformed ID.
- Thrown or returned by `validate.js`; surfaced by command handlers.
- Exit code: `1`.

2. `NotFoundError` (unknown task ID)
- Triggered when a valid positive ID is not present in in-memory store.
- Raised by `store.js` lookup/update/delete paths or command-level guard after lookup.
- Exit code: `2`.

3. `CommandError` (routing/CLI shape issues)
- Triggered by unknown command names or missing required positional arguments.
- Raised in `index.js` command dispatch and argument parsing.
- Exit code: `1`.

4. `UnexpectedError` (defensive catch-all)
- Triggered by unanticipated runtime faults.
- Caught at top-level in `index.js` and converted to a generic user-facing message.
- Exit code: `1`.

### Throwing and handling locations

- `validate.js`: validates inputs; returns `{ valid, message }` or throws explicit `Error` objects with descriptive messages based on implementation preference.
- Command modules: wrap parse/validate/store operations in `try/catch`, map known errors to user messages and exit codes.
- `index.js`: top-level `try/catch` around command dispatch to prevent uncaught exceptions.

### Output conventions

- All error output goes to `stderr` using `console.error`.
- Message format: `Error: <human-readable message>`.
- Successful command output goes to `stdout`.
