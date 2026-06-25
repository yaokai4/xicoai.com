CREATE TYPE "public"."application_status" AS ENUM('new', 'reviewing', 'interview', 'offer', 'hired', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'intern', 'partner', 'contract');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."join_status" AS ENUM('new', 'reviewing', 'contacted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."join_type" AS ENUM('investor', 'partner', 'collaborator');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"job_title" varchar(256),
	"name" varchar(128) NOT NULL,
	"email" varchar(256) NOT NULL,
	"phone" varchar(64),
	"links" text,
	"resume_path" varchar(512),
	"resume_name" varchar(256),
	"note" text,
	"locale" varchar(8),
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"email" varchar(256) NOT NULL,
	"company" varchar(256),
	"topic" varchar(64),
	"message" text NOT NULL,
	"locale" varchar(8),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" jsonb NOT NULL,
	"team" varchar(64),
	"location" jsonb,
	"employment_type" "employment_type" DEFAULT 'full_time' NOT NULL,
	"remote" boolean DEFAULT false NOT NULL,
	"summary" jsonb,
	"description" jsonb,
	"requirements" jsonb,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "join_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "join_type" NOT NULL,
	"name" varchar(128) NOT NULL,
	"email" varchar(256) NOT NULL,
	"org" varchar(256),
	"details" jsonb,
	"intro" text,
	"links" text,
	"locale" varchar(8),
	"status" "join_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;