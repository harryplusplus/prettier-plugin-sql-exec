# prettier-plugin-sql-exec

A Prettier plugin for extensible SQL formatting via any command-line formatter.

## Why I Created This Library

Most existing SQL formatters cannot correctly parse or format SQL strings that include template variables.
Other solutions, such as combining prettier-plugin-embed with prettier-plugin-sql, couldn’t be configured to fit my needs.
This library was built to address both limitations—it enables reliable formatting of SQL template strings in code using your favorite CLI formatter, and provides a straightforward, customizable way to integrate with Prettier.

## Usage

### Example

This example demonstrates how to use [VS Code Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [prettier-plugin-embed](https://www.npmjs.com/package/prettier-plugin-embed) to format SQL template strings in TypeScript files via [pgFormatter](https://github.com/darold/pgFormatter).

Install the required packages:

```bash
# Formatting plugins
pnpm add -D prettier prettier-plugin-embed prettier-plugin-sql-exec
# PostgreSQL client
pnpm add postgres
```

> [!NOTE]  
> This example uses pnpm, but other package managers work as well.

Clone pgFormatter:

```bash
git clone --branch v5.8 --depth 1 https://github.com/darold/pgFormatter.git
```

> [!NOTE]  
> pgFormatter requires a Perl runtime.
> Perl is included by default on macOS.

Sample Prettier config:

```json
// .prettierrc.json
{
  "plugins": ["prettier-plugin-embed", "prettier-plugin-sql-exec"],
  "command": "perl pgFormatter/pg_format",
  "cwd": "/absolute/path/to/project"
}
```

TypeScript before formatting:

```typescript
import postgres from "postgres";

const sql = postgres();

const name = "John Doe";
const age = 30;

const users =
  await sql`INSERT INTO users(name, age) VALUES (${name}, ${age}) RETURNING name, age`;
```

After formatting:

```typescript
import postgres from "postgres";

const sql = postgres();

const name = "John Doe";
const age = 30;

const users = await sql`
  insert into users (name, age)
    values (${name}, ${age})
  returning
    name, age
`;
```

## Options

### `command`

_**(required)**_

Formatting command to execute.

It must take input from **STDIN** and output the formatted text to **STDOUT**, then **exit**.
If your formatter doesn’t support this or needs **environment variables** set, wrap it with a simple shell script, Node.js, or Python script.

### `cwd`

_**(optional)**_

Working directory for command execution.

> [!WARNING]  
> If you use the VS Code Prettier extension, the extension runs Prettier from the filesystem root (/) by default—not the project directory.
> An absolute path is recommended for reliability.

## Development

### Integration Tests

Run the following commands to execute integration tests:

```bash
# Build the project before running tests
pnpm build

# Ensure all submodules are up to date
git submodule update --init --recursive

# Run integration tests
pnpm test:integration
```
