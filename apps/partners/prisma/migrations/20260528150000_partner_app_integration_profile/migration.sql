ALTER TABLE "PartnerApp" ADD COLUMN "description" TEXT NOT NULL DEFAULT 'Partner integration managed in Qentrah Partners.';
ALTER TABLE "PartnerApp" ADD COLUMN "appCategory" TEXT NOT NULL DEFAULT 'operations';
ALTER TABLE "PartnerApp" ADD COLUMN "integrationMode" TEXT NOT NULL DEFAULT 'sandbox';
ALTER TABLE "PartnerApp" ADD COLUMN "supportEmail" TEXT;
ALTER TABLE "PartnerApp" ADD COLUMN "webhookUrl" TEXT;
ALTER TABLE "PartnerApp" ADD COLUMN "privacyPolicyUrl" TEXT;
ALTER TABLE "PartnerApp" ADD COLUMN "termsOfServiceUrl" TEXT;
