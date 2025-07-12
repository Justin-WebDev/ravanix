-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
