import fs from "node:fs";

export const PLUGIN_PATH = "./dist/index.js";

export function checkBuild() {
  if (!fs.existsSync(PLUGIN_PATH)) {
    throw new Error("Integration tests must be preceded by `pnpm build`.");
  }
}
