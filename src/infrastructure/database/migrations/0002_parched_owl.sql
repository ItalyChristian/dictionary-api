-- Remove existing duplicate history rows, keeping only the most recent view
-- per (user, word), so the unique index below can be created.
DELETE FROM "word_history" a
USING "word_history" b
WHERE a."user_id" = b."user_id"
  AND a."word_id" = b."word_id"
  AND (a."viewed_at" < b."viewed_at"
       OR (a."viewed_at" = b."viewed_at" AND a."id" < b."id"));
--> statement-breakpoint
CREATE UNIQUE INDEX "word_history_user_word_unique" ON "word_history" USING btree ("user_id","word_id");
