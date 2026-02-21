ALTER TABLE "monthly_reports" ADD COLUMN "start_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "monthly_reports" ADD CONSTRAINT "monthly_reports_start_date_unique" UNIQUE("start_date");