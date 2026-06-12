-- AlterTable: add optional owner to Story (null for pre-account / guest stories)
ALTER TABLE "Story" ADD COLUMN "userId" INTEGER;

-- CreateIndex
CREATE INDEX "Story_userId_idx" ON "Story"("userId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
