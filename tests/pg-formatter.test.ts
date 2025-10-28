import { exec } from "node:child_process";
import fs from "node:fs";
import { promisify } from "node:util";
import { format } from "prettier";
import { beforeAll, expect, test } from "vitest";
import { checkBuild, PLUGIN_PATH } from "./common";

const execAsync = promisify(exec);

beforeAll(async () => {
  checkBuild();

  try {
    await execAsync("perl --version");
  } catch (e) {
    throw new Error("Please check `perl` command.");
  }

  if (!fs.existsSync("./third_party/pgFormatter/pg_format")) {
    throw new Error(
      "Please call `git submodule update --init --recursive` command."
    );
  }
});

test("parser sql", async () => {
  const code = "select 1";
  const output = await format(code, {
    parser: "sql",
    plugins: [PLUGIN_PATH],
    sqlExecCommand: "perl third_party/pgFormatter/pg_format",
  });
  expect(output).toBe(`SELECT
    1
`);
});

test("with prettier-plugin-embed", async () => {
  const code = `import postgres from "postgres";

const sql = postgres();
  
const name = "John Doe";
const age = 30;
  
const users = await sql\`INSERT INTO  users(name, age) VALUES (\${name}, \${age})  RETURNING name, age\`;
`;
  const output = await format(code, {
    filepath: "main.ts",
    plugins: ["prettier-plugin-embed", PLUGIN_PATH],
    sqlExecCommand:
      "perl third_party/pgFormatter/pg_format --keyword-case 1 --spaces 2",
  });
  expect(output).toBe(`import postgres from "postgres";

const sql = postgres();

const name = "John Doe";
const age = 30;

const users = await sql\`
  insert into users (name, age)
    values (\${name}, \${age})
  returning
    name, age
\`;
`);
});
