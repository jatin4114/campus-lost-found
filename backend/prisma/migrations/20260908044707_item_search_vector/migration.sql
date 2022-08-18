-- AlterTable: generated STORED tsvector column for full-text search over
-- title (weight A, matches rank higher) and description (weight B).
ALTER TABLE "Item" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B')
  ) STORED;

CREATE INDEX "Item_searchVector_idx" ON "Item" USING GIN ("searchVector");
