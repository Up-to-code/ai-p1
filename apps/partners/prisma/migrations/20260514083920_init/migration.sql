-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerProfile" (
    "id" TEXT NOT NULL,
    "authSubject" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammerOrganization" (
    "id" TEXT NOT NULL,
    "ownerAuthSubject" TEXT NOT NULL,
    "tenantOrganizationId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'programmer',
    "countryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgrammerOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerApp" (
    "id" TEXT NOT NULL,
    "partnerAuthSubject" TEXT NOT NULL,
    "partnerOrganizationId" TEXT,
    "clientId" TEXT NOT NULL,
    "clientSecretHash" TEXT,
    "name" TEXT NOT NULL,
    "publisherName" TEXT NOT NULL,
    "homepageUrl" TEXT,
    "iconUrl" TEXT,
    "logoUrl" TEXT,
    "clientType" TEXT NOT NULL,
    "redirectUris" TEXT[],
    "allowedScopes" TEXT[],
    "status" TEXT NOT NULL,
    "workspacePartnerAppId" TEXT,
    "workspaceOauthClientId" TEXT,
    "workspaceSyncStatus" TEXT,
    "workspaceSyncError" TEXT,
    "ananWorkspaceClientId" TEXT,
    "authorizationExpiresAfterDays" INTEGER NOT NULL,
    "reviewNotes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SandboxOrganization" (
    "id" TEXT NOT NULL,
    "partnerAuthSubject" TEXT NOT NULL,
    "partnerAppId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SandboxOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SandboxOAuthCode" (
    "id" TEXT NOT NULL,
    "partnerAuthSubject" TEXT NOT NULL,
    "partnerAppId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "scopes" TEXT[],
    "codeChallenge" TEXT NOT NULL,
    "codeChallengeMethod" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SandboxOAuthCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SandboxOAuthToken" (
    "id" TEXT NOT NULL,
    "partnerAuthSubject" TEXT NOT NULL,
    "partnerAppId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accessTokenHash" TEXT,
    "refreshTokenHash" TEXT,
    "clientId" TEXT NOT NULL,
    "scopes" TEXT[],
    "status" TEXT NOT NULL,
    "accessExpiresAt" TIMESTAMP(3) NOT NULL,
    "refreshExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SandboxOAuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SandboxResource" (
    "id" TEXT NOT NULL,
    "partnerAuthSubject" TEXT NOT NULL,
    "partnerAppId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SandboxResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SandboxRequestLog" (
    "id" TEXT NOT NULL,
    "partnerAuthSubject" TEXT,
    "partnerAppId" TEXT,
    "organizationId" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "scopes" TEXT[],
    "input" JSONB,
    "response" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SandboxRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerAppReview" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reviewerAuthSubject" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerAppReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerEvent" (
    "id" TEXT NOT NULL,
    "actorAuthSubject" TEXT,
    "appId" TEXT,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnanWorkspaceLink" (
    "id" TEXT NOT NULL,
    "partnerAppId" TEXT NOT NULL,
    "ananWorkspaceId" TEXT NOT NULL,
    "ananOrganizationId" TEXT NOT NULL,
    "grantedScopes" TEXT[],
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnanWorkspaceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnanIntegrationEvent" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnanIntegrationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProfile_authSubject_key" ON "PartnerProfile"("authSubject");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammerOrganization_ownerAuthSubject_key" ON "ProgrammerOrganization"("ownerAuthSubject");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammerOrganization_tenantOrganizationId_key" ON "ProgrammerOrganization"("tenantOrganizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerApp_clientId_key" ON "PartnerApp"("clientId");

-- CreateIndex
CREATE INDEX "PartnerApp_partnerAuthSubject_idx" ON "PartnerApp"("partnerAuthSubject");

-- CreateIndex
CREATE INDEX "PartnerApp_partnerOrganizationId_idx" ON "PartnerApp"("partnerOrganizationId");

-- CreateIndex
CREATE INDEX "PartnerApp_status_idx" ON "PartnerApp"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SandboxOrganization_organizationId_key" ON "SandboxOrganization"("organizationId");

-- CreateIndex
CREATE INDEX "SandboxOrganization_partnerAppId_idx" ON "SandboxOrganization"("partnerAppId");

-- CreateIndex
CREATE INDEX "SandboxOrganization_partnerAuthSubject_idx" ON "SandboxOrganization"("partnerAuthSubject");

-- CreateIndex
CREATE UNIQUE INDEX "SandboxOAuthCode_code_key" ON "SandboxOAuthCode"("code");

-- CreateIndex
CREATE INDEX "SandboxOAuthCode_partnerAppId_idx" ON "SandboxOAuthCode"("partnerAppId");

-- CreateIndex
CREATE UNIQUE INDEX "SandboxOAuthToken_accessTokenHash_key" ON "SandboxOAuthToken"("accessTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "SandboxOAuthToken_refreshTokenHash_key" ON "SandboxOAuthToken"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "SandboxOAuthToken_partnerAppId_idx" ON "SandboxOAuthToken"("partnerAppId");

-- CreateIndex
CREATE INDEX "SandboxResource_organizationId_resourceType_idx" ON "SandboxResource"("organizationId", "resourceType");

-- CreateIndex
CREATE INDEX "SandboxResource_partnerAppId_idx" ON "SandboxResource"("partnerAppId");

-- CreateIndex
CREATE INDEX "SandboxRequestLog_partnerAppId_idx" ON "SandboxRequestLog"("partnerAppId");

-- CreateIndex
CREATE INDEX "SandboxRequestLog_organizationId_idx" ON "SandboxRequestLog"("organizationId");

-- CreateIndex
CREATE INDEX "PartnerAppReview_appId_idx" ON "PartnerAppReview"("appId");

-- CreateIndex
CREATE INDEX "PartnerEvent_actorAuthSubject_idx" ON "PartnerEvent"("actorAuthSubject");

-- CreateIndex
CREATE INDEX "PartnerEvent_appId_idx" ON "PartnerEvent"("appId");

-- CreateIndex
CREATE INDEX "PartnerEvent_eventType_idx" ON "PartnerEvent"("eventType");

-- CreateIndex
CREATE INDEX "AnanWorkspaceLink_partnerAppId_idx" ON "AnanWorkspaceLink"("partnerAppId");

-- CreateIndex
CREATE INDEX "AnanWorkspaceLink_ananWorkspaceId_idx" ON "AnanWorkspaceLink"("ananWorkspaceId");

-- CreateIndex
CREATE INDEX "AnanWorkspaceLink_status_idx" ON "AnanWorkspaceLink"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AnanIntegrationEvent_idempotencyKey_key" ON "AnanIntegrationEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "AnanIntegrationEvent_status_idx" ON "AnanIntegrationEvent"("status");

-- CreateIndex
CREATE INDEX "AnanIntegrationEvent_contract_idx" ON "AnanIntegrationEvent"("contract");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammerOrganization" ADD CONSTRAINT "ProgrammerOrganization_ownerAuthSubject_fkey" FOREIGN KEY ("ownerAuthSubject") REFERENCES "PartnerProfile"("authSubject") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerApp" ADD CONSTRAINT "PartnerApp_partnerAuthSubject_fkey" FOREIGN KEY ("partnerAuthSubject") REFERENCES "PartnerProfile"("authSubject") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerApp" ADD CONSTRAINT "PartnerApp_partnerOrganizationId_fkey" FOREIGN KEY ("partnerOrganizationId") REFERENCES "ProgrammerOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxOrganization" ADD CONSTRAINT "SandboxOrganization_partnerAuthSubject_fkey" FOREIGN KEY ("partnerAuthSubject") REFERENCES "PartnerProfile"("authSubject") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxOrganization" ADD CONSTRAINT "SandboxOrganization_partnerAppId_fkey" FOREIGN KEY ("partnerAppId") REFERENCES "PartnerApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxOAuthCode" ADD CONSTRAINT "SandboxOAuthCode_partnerAuthSubject_fkey" FOREIGN KEY ("partnerAuthSubject") REFERENCES "PartnerProfile"("authSubject") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxOAuthCode" ADD CONSTRAINT "SandboxOAuthCode_partnerAppId_fkey" FOREIGN KEY ("partnerAppId") REFERENCES "PartnerApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxOAuthToken" ADD CONSTRAINT "SandboxOAuthToken_partnerAuthSubject_fkey" FOREIGN KEY ("partnerAuthSubject") REFERENCES "PartnerProfile"("authSubject") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxOAuthToken" ADD CONSTRAINT "SandboxOAuthToken_partnerAppId_fkey" FOREIGN KEY ("partnerAppId") REFERENCES "PartnerApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxResource" ADD CONSTRAINT "SandboxResource_partnerAuthSubject_fkey" FOREIGN KEY ("partnerAuthSubject") REFERENCES "PartnerProfile"("authSubject") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxResource" ADD CONSTRAINT "SandboxResource_partnerAppId_fkey" FOREIGN KEY ("partnerAppId") REFERENCES "PartnerApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerAppReview" ADD CONSTRAINT "PartnerAppReview_appId_fkey" FOREIGN KEY ("appId") REFERENCES "PartnerApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerEvent" ADD CONSTRAINT "PartnerEvent_actorAuthSubject_fkey" FOREIGN KEY ("actorAuthSubject") REFERENCES "PartnerProfile"("authSubject") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerEvent" ADD CONSTRAINT "PartnerEvent_appId_fkey" FOREIGN KEY ("appId") REFERENCES "PartnerApp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnanWorkspaceLink" ADD CONSTRAINT "AnanWorkspaceLink_partnerAppId_fkey" FOREIGN KEY ("partnerAppId") REFERENCES "PartnerApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
