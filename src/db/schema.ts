import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

/** A localized string: { zh, ja, en } — zh is the required base. */
export type L10n = { zh: string; ja?: string; en?: string };
export type L10nList = { zh: string[]; ja?: string[]; en?: string[] };

export const jobStatus = pgEnum("job_status", ["draft", "open", "closed"]);
export const employmentType = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "intern",
  "partner",
  "contract",
]);
export const applicationStatus = pgEnum("application_status", [
  "new",
  "reviewing",
  "interview",
  "offer",
  "hired",
  "rejected",
  "archived",
]);
export const joinType = pgEnum("join_type", [
  "investor",
  "partner",
  "collaborator",
]);
export const joinStatus = pgEnum("join_status", [
  "new",
  "reviewing",
  "contacted",
  "archived",
]);

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: jsonb("title").$type<L10n>().notNull(),
  team: varchar("team", { length: 64 }),
  location: jsonb("location").$type<L10n>(),
  employmentType: employmentType("employment_type")
    .notNull()
    .default("full_time"),
  remote: boolean("remote").notNull().default(false),
  summary: jsonb("summary").$type<L10n>(),
  description: jsonb("description").$type<L10n>(),
  requirements: jsonb("requirements").$type<L10nList>(),
  status: jobStatus("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
  jobTitle: varchar("job_title", { length: 256 }),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 64 }),
  links: text("links"),
  resumePath: varchar("resume_path", { length: 512 }),
  resumeName: varchar("resume_name", { length: 256 }),
  note: text("note"),
  locale: varchar("locale", { length: 8 }),
  status: applicationStatus("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const joinSubmissions = pgTable("join_submissions", {
  id: serial("id").primaryKey(),
  type: joinType("type").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  org: varchar("org", { length: 256 }),
  details: jsonb("details").$type<Record<string, string>>(),
  intro: text("intro"),
  links: text("links"),
  locale: varchar("locale", { length: 8 }),
  status: joinStatus("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  company: varchar("company", { length: 256 }),
  topic: varchar("topic", { length: 64 }),
  message: text("message").notNull(),
  locale: varchar("locale", { length: 8 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type JoinSubmission = typeof joinSubmissions.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
