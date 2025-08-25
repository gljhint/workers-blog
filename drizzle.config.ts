import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/5208f3e453320be791b73e92369fa7c06d5e052b0465ca3ed94de9a11100d783.sqlite",
  },
} satisfies Config;