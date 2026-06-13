ALTER TABLE "users" ADD COLUMN "is_guest" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "guest_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_guest_token_unique" UNIQUE("guest_token");