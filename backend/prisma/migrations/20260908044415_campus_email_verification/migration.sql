-- AlterTable
ALTER TABLE "User" ADD COLUMN     "campusId" TEXT;

-- CreateIndex
CREATE INDEX "User_campusId_idx" ON "User"("campusId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
