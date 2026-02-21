ALTER TABLE "daily_reports" ADD COLUMN "review" text;--> statement-breakpoint
ALTER TABLE "daily_reports" DROP COLUMN "good_points";--> statement-breakpoint
ALTER TABLE "daily_reports" DROP COLUMN "bad_points";--> statement-breakpoint
ALTER TABLE "daily_reports" DROP COLUMN "learnings";--> statement-breakpoint
ALTER TABLE "daily_reports" DROP COLUMN "next_actions";
