ALTER TABLE "tasks" DROP CONSTRAINT "tasks_daily_report_id_daily_reports_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_daily_report_id_daily_reports_id_fk" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE set null ON UPDATE no action;