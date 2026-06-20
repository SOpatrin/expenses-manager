-- Создаём enum идемпотентно (preview/prod-БД могут прогонять миграцию повторно).
DO $$ BEGIN
 CREATE TYPE "public"."category" AS ENUM('food', 'groceries', 'transport', 'home', 'bills', 'health', 'fun', 'shopping', 'travel', 'education', 'gifts', 'salary', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
-- Старый category хранил свободный текст (заголовок). Переносим его в description,
-- если оно пустое, чтобы не потерять заметку.
UPDATE "transactions" SET "description" = COALESCE("description", "category"::text) WHERE "category" IS NOT NULL AND "category"::text NOT IN ('food', 'groceries', 'transport', 'home', 'bills', 'health', 'fun', 'shopping', 'travel', 'education', 'gifts', 'salary', 'other');--> statement-breakpoint
-- Значения, не входящие в enum, обнуляем — иначе каст ниже упадёт.
UPDATE "transactions" SET "category" = NULL WHERE "category" IS NOT NULL AND "category"::text NOT IN ('food', 'groceries', 'transport', 'home', 'bills', 'health', 'fun', 'shopping', 'travel', 'education', 'gifts', 'salary', 'other');--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::text::"public"."category";
