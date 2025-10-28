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

test("pgFormatter", async () => {
  const code = "select 1";
  const output = await format(code, {
    parser: "sql",
    plugins: [PLUGIN_PATH],
    command: "perl third_party/pgFormatter/pg_format",
  });
  expect(output).toBe(`SELECT
    1
`);
});
