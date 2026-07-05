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

export const waitlistStatus = pgEnum("waitlist_status", [
  "new",
  "invited",
  "converted",
  "archived",
]);

export const postStatus = pgEnum("post_status", ["draft", "published"]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: jsonb("title").$type<L10n>().notNull(),
  excerpt: jsonb("excerpt").$type<L10n>(),
  body: jsonb("body").$type<L10n>(),
  tag: varchar("tag", { length: 48 }),
  coverColor: varchar("cover_color", { length: 24 }),
  status: postStatus("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

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

/** Early-access signups for the Xico Clean macOS app (and future products). */
export const waitlistSignups = pgTable("waitlist_signups", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  name: varchar("name", { length: 128 }),
  product: varchar("product", { length: 48 }).notNull().default("xico-clean"),
  source: varchar("source", { length: 64 }),
  locale: varchar("locale", { length: 8 }),
  status: waitlistStatus("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Simple key-value store for site-wide settings (e.g. social links). */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Setting = typeof settings.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type JoinSubmission = typeof joinSubmissions.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;

/* ─────────────────────────────────────────────────────────────
 * Xico Clean commerce: Stripe orders → issued activation keys.
 * Buyer pays on mac.xicoai.com; a Stripe webhook mints an 18-digit
 * key (stored hashed + encrypted, never in plaintext). The Mac app
 * later POSTs the key to /api/license/activate, which binds a device
 * seat and returns an Ed25519-signed license the app installs offline.
 * All tables are prefixed `mac_` to namespace the product line.
 * ──────────────────────────────────────────────────────────── */

/** The two buy-out tiers. `personal` = 1 Mac, `family` = up to 5 Macs. */
export const macLicensePlan = pgEnum("mac_license_plan", ["personal", "family"]);

export const macOrderStatus = pgEnum("mac_order_status", [
  "pending",
  "paid",
  "refunded",
  "failed",
  "expired",
]);

export const macLicenseStatus = pgEnum("mac_license_status", [
  "active",
  "refunded",
  "revoked",
]);

/** One purchase attempt. `orderNo` is an unguessable public token used by
 * the success page (and Stripe metadata) to poll status and fetch the key. */
export const macOrders = pgTable("mac_orders", {
  id: serial("id").primaryKey(),
  orderNo: varchar("order_no", { length: 64 }).notNull().unique(),
  plan: macLicensePlan("plan").notNull(),
  email: varchar("email", { length: 256 }),
  // Minor units (e.g. cents); JPY is zero-decimal so minor == major.
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 8 }).notNull(),
  status: macOrderStatus("status").notNull().default("pending"),
  provider: varchar("provider", { length: 24 }).notNull().default("stripe"),
  providerSessionId: varchar("provider_session_id", { length: 256 }).unique(),
  providerPaymentIntent: varchar("provider_payment_intent", { length: 256 }),
  checkoutUrl: text("checkout_url"),
  locale: varchar("locale", { length: 8 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

/** An issued activation key. The plaintext 18-digit code is never stored:
 * `keyHash` = HMAC(secret, code) for lookup, `keyEncrypted` = AES-256-GCM so
 * the success page / a resend can re-reveal it. `licenseUid` is the stable id
 * embedded in the signed license envelope (for later revocation). */
export const macLicenses = pgTable("mac_licenses", {
  id: serial("id").primaryKey(),
  licenseUid: varchar("license_uid", { length: 64 }).notNull().unique(),
  keyHash: varchar("key_hash", { length: 128 }).notNull().unique(),
  keyEncrypted: text("key_encrypted").notNull(),
  keyLast4: varchar("key_last4", { length: 4 }).notNull(),
  plan: macLicensePlan("plan").notNull(),
  seats: integer("seats").notNull().default(1),
  maxMajorVersion: integer("max_major_version").notNull().default(99),
  email: varchar("email", { length: 256 }),
  // One license per order — makes webhook fulfilment idempotent under retries.
  orderId: integer("order_id")
    .references(() => macOrders.id, { onDelete: "set null" })
    .unique(),
  status: macLicenseStatus("status").notNull().default("active"),
  activatedCount: integer("activated_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** A device that consumed a seat of a license. */
export const macLicenseActivations = pgTable("mac_license_activations", {
  id: serial("id").primaryKey(),
  licenseId: integer("license_id")
    .notNull()
    .references(() => macLicenses.id, { onDelete: "cascade" }),
  deviceId: varchar("device_id", { length: 128 }).notNull(),
  deviceName: varchar("device_name", { length: 128 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Stripe webhook idempotency ledger — a repeated event id is a no-op. */
export const macPaymentEvents = pgTable("mac_payment_events", {
  eventId: varchar("event_id", { length: 128 }).primaryKey(),
  eventType: varchar("event_type", { length: 64 }).notNull(),
  orderNo: varchar("order_no", { length: 64 }),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type MacOrder = typeof macOrders.$inferSelect;
export type MacLicense = typeof macLicenses.$inferSelect;
export type MacLicenseActivation = typeof macLicenseActivations.$inferSelect;
export type MacLicensePlan = (typeof macLicensePlan.enumValues)[number];
