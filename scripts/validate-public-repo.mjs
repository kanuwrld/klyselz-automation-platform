import { readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";

const listed = spawnSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" }
);

if (listed.status !== 0) {
  console.error("Public-repository check requires a Git working tree.");
  process.exit(1);
}

const files = listed.stdout.split("\0").filter(Boolean);
const errors = [];

const requiredVercelIgnoreRules = [
  "**/.env.*",
  "[0-9][0-9]-*/",
  ".claude/",
  "*.csv",
  "*.xlsx",
  "*.sqlite",
  "*.db",
];

try {
  const vercelIgnore = readFileSync(".vercelignore", "utf8")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  for (const rule of requiredVercelIgnoreRules) {
    if (!vercelIgnore.includes(rule)) {
      errors.push(`.vercelignore: required rule missing: ${rule}`);
    }
  }
} catch {
  errors.push(".vercelignore: required deployment boundary is missing");
}

const forbiddenPaths = [
  {
    name: "environment file",
    test: (path) => /(^|\/)\.env(?:\.|$)/u.test(path) && !path.endsWith("/.env.example") && path !== ".env.example",
  },
  {
    name: "private customer or prospect CSV",
    test: (path) =>
      path.endsWith(".csv") && path !== "tools/prospect-pipeline/prospects.example.csv",
  },
  {
    name: "office or financial export",
    test: (path) => /\.(?:xlsx?|ods)$/iu.test(path),
  },
  {
    name: "database file",
    test: (path) => /\.(?:db|sqlite3?)$/iu.test(path),
  },
  {
    name: "certificate or private key",
    test: (path) => /\.(?:pem|key|p12|pfx|crt|cer)$/iu.test(path),
  },
  {
    name: "private operating directory",
    test: (path) =>
      /^(?:(?:0[1-7])-[^/]+|EROPACI-VAPES-WP-BOT|\.claude)\//u.test(path),
  },
];

const secretPatterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u],
  ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{40,})\b/u],
  ["OpenAI-style token", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/u],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/u],
  ["Telegram bot token", /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/u],
  ["database URL with credentials", /\b(?:postgres(?:ql)?|mysql):\/\/[^:\s/]+:[^@\s/]+@/iu],
];

for (const path of files) {
  for (const rule of forbiddenPaths) {
    if (rule.test(path)) errors.push(`${path}: ${rule.name}`);
  }

  let stats;
  try {
    stats = statSync(path);
  } catch {
    continue;
  }
  if (!stats.isFile() || stats.size > 5_000_000) continue;

  const buffer = readFileSync(path);
  if (buffer.includes(0)) continue;
  const content = buffer.toString("utf8");
  for (const [name, pattern] of secretPatterns) {
    if (pattern.test(content)) errors.push(`${path}: possible ${name}`);
  }
}

if (errors.length) {
  console.error("Public-repository check failed:");
  for (const error of [...new Set(errors)].sort()) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Public-repository check passed (${files.length} files scanned).`);
