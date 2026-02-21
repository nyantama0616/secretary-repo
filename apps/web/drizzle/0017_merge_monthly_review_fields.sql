ALTER TABLE "monthly_reports" ADD COLUMN "review" text;--> statement-breakpoint
ALTER TABLE "monthly_reports" DROP COLUMN "project_progress";--> statement-breakpoint
ALTER TABLE "monthly_reports" DROP COLUMN "growth_changes";--> statement-breakpoint
ALTER TABLE "monthly_reports" DROP COLUMN "purpose_action_gap";--> statement-breakpoint
ALTER TABLE "monthly_reports" DROP COLUMN "improvements";
