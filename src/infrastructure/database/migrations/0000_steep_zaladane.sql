CREATE TABLE "user_favorites" (
	"user_id" uuid NOT NULL,
	"word_id" text NOT NULL,
	"favorited_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "word_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"word_id" text NOT NULL,
	"word" text NOT NULL,
	"viewed_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" text PRIMARY KEY NOT NULL,
	"word" text NOT NULL,
	"meanings" jsonb NOT NULL,
	"phonetics" jsonb NOT NULL,
	"favorite_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "words_word_unique" UNIQUE("word")
);
