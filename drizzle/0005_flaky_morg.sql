ALTER TABLE "users" ADD COLUMN "receipt_scans_today" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "receipt_scans_reset_at" timestamp;