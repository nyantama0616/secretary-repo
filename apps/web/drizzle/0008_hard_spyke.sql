ALTER TABLE "daily_reports" DROP CONSTRAINT "daily_reports_monthly_report_id_monthly_reports_id_fk";
--> statement-breakpoint
ALTER TABLE "daily_reports" ALTER COLUMN "monthly_report_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_monthly_report_id_monthly_reports_id_fk" FOREIGN KEY ("monthly_report_id") REFERENCES "public"."monthly_reports"("id") ON DELETE cascade ON UPDATE no action;