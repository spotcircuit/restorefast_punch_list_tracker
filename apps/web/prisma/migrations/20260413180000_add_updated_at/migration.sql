-- AlterTable
ALTER TABLE "Project" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Project" SET "updatedAt" = "createdAt";

-- AlterTable
ALTER TABLE "PunchItem" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "PunchItem" SET "updatedAt" = "createdAt";
