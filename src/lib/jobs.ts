import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobs, type Job } from "@/db/schema";

export async function getOpenJobs(): Promise<Job[]> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, "open"))
      .orderBy(asc(jobs.sortOrder), desc(jobs.createdAt));
  } catch (e) {
    console.error("getOpenJobs failed", e);
    return [];
  }
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(jobs)
      .where(eq(jobs.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  } catch (e) {
    console.error("getJobBySlug failed", e);
    return null;
  }
}
