import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/lib/schema';
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const db = cache(() => {
  const { env } = getCloudflareContext();
  return drizzle(env.DB as unknown as D1Database, { schema });
});
