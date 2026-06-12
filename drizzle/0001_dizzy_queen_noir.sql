ALTER TABLE "account_members" RENAME TO "wallet_members";--> statement-breakpoint
ALTER TABLE "accounts" RENAME TO "wallets";--> statement-breakpoint
ALTER TABLE "wallet_members" RENAME COLUMN "account_id" TO "wallet_id";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "account_id" TO "wallet_id";--> statement-breakpoint
ALTER TABLE "wallet_members" DROP CONSTRAINT "account_members_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "wallet_members" DROP CONSTRAINT "account_members_account_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "wallet_members" ADD CONSTRAINT "wallet_members_wallet_id_user_id_pk" PRIMARY KEY("wallet_id","user_id");--> statement-breakpoint
ALTER TABLE "wallet_members" ADD CONSTRAINT "wallet_members_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;