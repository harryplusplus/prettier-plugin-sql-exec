import { execSync } from "child_process";
import type { Parser, Plugin, Printer, SupportOption } from "prettier";

const SQL_EXEC_AST = "sql-exec-ast";

export interface SqlExecOptions {
  /**
   * Formatting command to execute.
   *
   * It must take input from **STDIN** and output the formatted text to **STDOUT**, then **exit**.
   * If your formatter doesn’t support this or needs **environment variables** set, wrap it with a simple shell script, Node.js, or Python script.
   *
   * The command’s working directory is resolved from the `PWD` environment variable if present; otherwise, the default value (`process.cwd()`) is used.
   * Within the VSCode Prettier extension service, `process.cwd()` is always set to `"/"`, while the actual project path is provided through the `PWD` environment variable.
   */
  sqlExecCommand: string;
}

export const options: Record<keyof SqlExecOptions, SupportOption> = {
  sqlExecCommand: {
    category: "Format",
    type: "string",
    description: "Formatting command to execute.",
  },
};

const sqlParser: Parser<string> = {
  parse: (text) => text,
  astFormat: SQL_EXEC_AST,
  locStart: () => -1,
  locEnd: () => -1,
};

export const parsers = {
  sql: sqlParser,
};

const sqlExecAstPrinter: Printer<string> = {
  print: (path, options) => {
    const input = path.node;

    const { sqlExecCommand } = options;
    const command =
      typeof sqlExecCommand === "string" ? sqlExecCommand : undefined;
    if (!command) {
      return input;
    }

    // Please see the JSDoc for `SqlExecOptions.sqlExecCommand`.
    const cwd = process.env["PWD"] || undefined;

    const output = execSync(command, {
      encoding: "utf8",
      input,
      cwd,
    });

    return output;
  },
};

export const printers = {
  [SQL_EXEC_AST]: sqlExecAstPrinter,
};

export default {
  options,
  parsers,
  printers,
} satisfies Plugin<string>;
