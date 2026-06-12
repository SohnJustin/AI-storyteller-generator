-- AlterTable: allow Story.expiresAt to be null (null = never expires, for owned stories)
ALTER TABLE "Story" ALTER COLUMN "expiresAt" DROP NOT NULL;
