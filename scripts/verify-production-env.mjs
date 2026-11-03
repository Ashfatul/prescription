import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const requiredKeys = ["DATABASE_URL", "JWT_SECRET"];
const envFiles = [".env.production.local", ".env.local", ".env.production", ".env"];

function readLocalEnv() {
  const values = {};

  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || values[match[1]]) continue;

      values[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2").trim();
    }
  }

  return values;
}

const localEnv = readLocalEnv();
const getValue = (key) => process.env[key]?.trim() || localEnv[key]?.trim() || "";
const missing = requiredKeys.filter((key) => !getValue(key));

if (missing.length > 0) {
  console.error(`Missing required production environment variable(s): ${missing.join(", ")}`);
  console.error(
    process.env.VERCEL === "1"
      ? "Add them in Vercel: Project Settings > Environment Variables, then redeploy."
      : "Add them to the deployment environment or a local .env file."
  );
  process.exit(1);
}

if (process.env.VERCEL === "1") {
  try {
    const databaseHost = new URL(getValue("DATABASE_URL")).hostname;
    if (["localhost", "127.0.0.1", "::1"].includes(databaseHost)) {
      console.error("DATABASE_URL points to localhost, which is unreachable from Vercel.");
      console.error("Use a hosted PostgreSQL connection string instead.");
      process.exit(1);
    }
  } catch {
    console.error("DATABASE_URL must be a valid PostgreSQL connection string.");
    process.exit(1);
  }
}

console.log("Production environment variables are configured.");
