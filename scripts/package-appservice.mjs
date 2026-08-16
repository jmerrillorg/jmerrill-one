import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const output = process.argv[2];

if (!output) {
  console.error("Usage: npm run package:appservice -- <output.zip>");
  process.exit(1);
}

const root = process.cwd();
const standaloneDir = resolve(root, ".next/standalone");
const standaloneStaticDir = resolve(standaloneDir, ".next/static");
const staticDir = resolve(root, ".next/static");
const publicDir = resolve(root, "public");
const outputPath = resolve(root, output);

if (!existsSync(resolve(standaloneDir, "server.js"))) {
  console.error("Missing .next/standalone/server.js. Run npm run build first.");
  process.exit(1);
}

mkdirSync(dirname(outputPath), { recursive: true });

if (existsSync(publicDir)) {
  rmSync(resolve(standaloneDir, "public"), { recursive: true, force: true });
  cpSync(publicDir, resolve(standaloneDir, "public"), { recursive: true });
}

if (existsSync(staticDir)) {
  rmSync(standaloneStaticDir, { recursive: true, force: true });
  mkdirSync(dirname(standaloneStaticDir), { recursive: true });
  cpSync(staticDir, standaloneStaticDir, { recursive: true });
}

rmSync(outputPath, { force: true });
execFileSync("zip", ["-qr", outputPath, "."], {
  cwd: standaloneDir,
  stdio: "inherit",
});

