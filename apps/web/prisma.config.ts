import { defineConfig, env } from "prisma/config";
import { existsSync, readFileSync } from "node:fs";

loadLocalEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});

function loadLocalEnv(): void {
  if (!existsSync(".env")) {
    return;
  }

  const entries = readFileSync(".env", "utf8").split(/\r?\n/u);

  for (const entry of entries) {
    const match = entry.match(/^([A-Z0-9_]+)=(.*)$/iu);

    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^["']|["']$/gu, "");
  }
}
