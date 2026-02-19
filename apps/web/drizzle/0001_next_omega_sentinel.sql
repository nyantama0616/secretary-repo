CREATE TABLE "daily_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"plan" text,
	"wake_up_time" timestamp with time zone,
	"bed_time" timestamp with time zone,
	"good_points" text,
	"bad_points" text,
	"learnings" text,
	"next_actions" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_reports_date_unique" UNIQUE("date")
);
