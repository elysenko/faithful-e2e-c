// Prisma 7 configuration file.
//
// DATABASE_URL is injected via environment variable at runtime (K8s secret /
// Docker ENV). dotenv is intentionally absent — it is not installed in
// backend/package.json and is not needed in Docker or K8s contexts.
//
// datasource.url below is consumed ONLY by the Prisma CLI (migrate / db /
// studio), which — as of Prisma 7 — requires the connection URL to be present
// in this config file. It does NOT affect the runtime PrismaClient, which still
// connects exclusively via the @prisma/adapter-pg driver adapter constructed in
// prisma.service.ts. When DATABASE_URL is unset (e.g. non-DB build steps) the
// value is simply undefined and no CLI DB command is expected to run.
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
  },
});
