ALTER TABLE "users" ADD COLUMN "name" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP DEFAULT;