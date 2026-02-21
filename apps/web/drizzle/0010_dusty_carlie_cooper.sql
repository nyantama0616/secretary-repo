ALTER TABLE "daily_reports" DROP CONSTRAINT "daily_reports_monthly_report_id_monthly_reports_id_fk";
--> statement-breakpoint
ALTER TABLE "daily_reports" DROP COLUMN "monthly_report_id";