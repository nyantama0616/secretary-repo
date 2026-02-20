CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"daily_report_id" text,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'not_started' NOT NULL,
	"sort_order" integer NOT NULL,
	"deadline" timestamp with time zone,
	"estimated_minutes" integer,
	"incompletion_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_daily_report_id_daily_reports_id_fk" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE no action ON UPDATE no action;