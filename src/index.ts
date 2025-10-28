import { execSync } from "child_process";
import type { Parser, Plugin, Printer, SupportOption } from "prettier";

const SQL_EXEC_AST = "sql-exec-ast";

const sqlParser: Parser<string> = {
  parse: (text) => text,
  astFormat: SQL_EXEC_AST,
  locStart: () => -1,
  locEnd: () => -1,
};

const sqlExecAstPrinter: Printer<string> = {
  print: (path, options) => {
    const text = path.node;

    const command = options.command ? String(options.command) : "";
    const cwd = options.cwd ? String(options.cwd) : undefined;

    const output = execSync(command, {
      encoding: "utf8",
      input: text,
      cwd,
    });
    return output;
  },
};

export interface SqlExecOptions {
  /**
   * Formatting command to execute.
   *
   * It must take input from **STDIN** and output the formatted text to **STDOUT**, then **exit**.
   * If your formatter doesn’t support this or needs **environment variables** set, wrap it with a simple shell script, Node.js, or Python script.
   */
  command: string;

  /**
   * Working directory for command execution.
   */
  cwd?: string;
}

const options: Record<keyof SqlExecOptions, SupportOption> = {
  command: {
    category: "Format",
    type: "string",
    description: "Formatting command to execute.",
  },
  cwd: {
    category: "Format",
    type: "path",
    description: "Working directory for command execution.",
  },
};

const plugin: Plugin<string> = {
  options,
  parsers: {
    sql: sqlParser,
  },
  printers: {
    [SQL_EXEC_AST]: sqlExecAstPrinter,
  },
};

export default plugin;
