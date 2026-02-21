CREATE TABLE "monthly_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"project_progress" text,
	"growth_changes" text,
	"purpose_action_gap" text,
	"improvements" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_reports" ADD COLUMN "monthly_report_id" text;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_monthly_report_id_monthly_reports_id_fk" FOREIGN KEY ("monthly_report_id") REFERENCES "public"."monthly_reports"("id") ON DELETE set null ON UPDATE no action;