ALTER TABLE "Organization" ADD COLUMN "customDomain" TEXT;
ALTER TABLE "Organization" ADD COLUMN "customDomainStatus" TEXT DEFAULT 'NONE';
ALTER TABLE "Organization" ADD COLUMN "customDomainVerificationToken" TEXT;
ALTER TABLE "Organization" ADD COLUMN "customDomainVerifiedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Organization_customDomain_key" ON "Organization"("customDomain");
