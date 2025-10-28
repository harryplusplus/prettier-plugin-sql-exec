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
    const command = String(options.command);
    const output = execSync(command, {
      encoding: "utf8",
      input: text,
    });
    return output;
  },
};

export interface SqlExecOptions {
  /**
   * Command to run for formatting. Input is passed via stdin.
   */
  command: string;
}

const options: Record<keyof SqlExecOptions, SupportOption> = {
  command: {
    category: "Format",
    type: "string",
    description: "Command to run for formatting. Input is passed via stdin.",
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
