CREATE TABLE "PartnerMcpConnection" (
    "id" TEXT NOT NULL,
    "partnerAuthSubject" TEXT NOT NULL,
    "programmerOrganizationId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "keyLast4" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instructions" TEXT,
    "permissions" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerMcpConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PartnerMcpRequestLog" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT,
    "publicId" TEXT,
    "method" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "toolName" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerMcpRequestLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PartnerMcpConnection_publicId_key" ON "PartnerMcpConnection"("publicId");
CREATE INDEX "PartnerMcpConnection_partnerAuthSubject_idx" ON "PartnerMcpConnection"("partnerAuthSubject");
CREATE INDEX "PartnerMcpConnection_programmerOrganizationId_idx" ON "PartnerMcpConnection"("programmerOrganizationId");
CREATE INDEX "PartnerMcpConnection_status_idx" ON "PartnerMcpConnection"("status");
CREATE INDEX "PartnerMcpRequestLog_connectionId_idx" ON "PartnerMcpRequestLog"("connectionId");
CREATE INDEX "PartnerMcpRequestLog_publicId_idx" ON "PartnerMcpRequestLog"("publicId");
CREATE INDEX "PartnerMcpRequestLog_toolName_idx" ON "PartnerMcpRequestLog"("toolName");

ALTER TABLE "PartnerMcpConnection" ADD CONSTRAINT "PartnerMcpConnection_partnerAuthSubject_fkey" FOREIGN KEY ("partnerAuthSubject") REFERENCES "PartnerProfile"("authSubject") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerMcpConnection" ADD CONSTRAINT "PartnerMcpConnection_programmerOrganizationId_fkey" FOREIGN KEY ("programmerOrganizationId") REFERENCES "ProgrammerOrganization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerMcpRequestLog" ADD CONSTRAINT "PartnerMcpRequestLog_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "PartnerMcpConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
