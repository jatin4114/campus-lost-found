-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SAVED_SEARCH_MATCH';

-- Note: Prisma's migration diff engine doesn't track the previous
-- migration's hand-written GENERATED ALWAYS AS (...) STORED column
-- correctly, and originally emitted a spurious `DROP INDEX
-- Item_searchVector_idx` + `ALTER COLUMN searchVector DROP DEFAULT` here
-- (which fails outright — you can't DROP DEFAULT on a generated column).
-- Both were removed; the searchVector column/index from the prior
-- migration are untouched by this one.

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType",
    "categoryId" TEXT,
    "locationId" TEXT,
    "search" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedSearch_userId_idx" ON "SavedSearch"("userId");

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
