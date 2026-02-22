CREATE TABLE "weekly_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"start_date" date NOT NULL,
	"goal" text,
	"summary" text,
	"review" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_reports_start_date_unique" UNIQUE("start_date")
);
