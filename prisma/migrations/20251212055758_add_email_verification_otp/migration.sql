-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationOTP" TEXT,
ADD COLUMN     "emailVerificationOTPExpires" TIMESTAMP(3);
