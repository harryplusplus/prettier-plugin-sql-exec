# prettier-plugin-sql-exec

A Prettier plugin for extensible SQL formatting via any command-line formatter.

[![npm version](https://img.shields.io/npm/v/prettier-plugin-sql-exec)](https://www.npmjs.com/package/prettier-plugin-sql-exec)

## Table of Contents

<!-- toc -->

- [Why I Created This Library](#why-i-created-this-library)
- [Usage](#usage)
  - [Example](#example)
- [Options](#options)
  - [`sqlExecCommand`](#sqlexeccommand)
- [Development](#development)
  - [Integration Tests](#integration-tests)
- [License](#license)

<!-- tocstop -->

## Why I Created This Library

For most projects, using [prettier-plugin-embed](https://www.npmjs.com/package/prettier-plugin-embed) together with [prettier-plugin-sql](https://www.npmjs.com/package/prettier-plugin-sql) can be sufficient for formatting embedded SQL in TypeScript.

However, those plugins did not fully support my PL/pgSQL syntax requirements and often produced results that weren't visually pleasing.

When formatting SQL blocks inside TypeScript code, the embedded SQL should be indented both according to its own structure and by the indentation level already present in the TypeScript source—but [pgFormatter](https://github.com/darold/pgFormatter) alone was unable to consistently apply this extra indentation.

To avoid tying this library to the ongoing maintenance cycles of external formatters, or evolving it into an overly general-purpose solution, I chose a direct command execution model. This does introduce some shell execution overhead.

But in practice, this overhead is minimal because embedded SQL template blocks in my projects are typically limited to repository, utility, or other specialized files. Regular application and service code rarely trigger the formatter, so the performance impact remains strictly local and manageable.

## Usage

### Example

This example demonstrates how to use [VS Code Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and prettier-plugin-embed to format SQL template strings in TypeScript files via pgFormatter.

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

Sample Prettier config (.prettierrc.json):

```json
{
  "plugins": ["prettier-plugin-embed", "prettier-plugin-sql-exec"],
  "sqlExecCommand": "perl pgFormatter/pg_format"
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
  INSERT INTO users (name, age)
      VALUES (${name}, ${age})
  RETURNING
      name, age
`;
```

## Options

### `sqlExecCommand`

_**(required)**_

Formatting command to execute.

It must take input from **STDIN** and output the formatted text to **STDOUT**, then **exit**.
If your formatter doesn’t support this or needs **environment variables** set, wrap it with a simple shell script, Node.js, or Python script.

The command’s working directory is resolved from the `PWD` environment variable if present; otherwise, the default value (`process.cwd()`) is used.
Within the VS Code Prettier extension service, `process.cwd()` is always set to `"/"`, while the actual project path is provided through the `PWD` environment variable.

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

## License

MIT
