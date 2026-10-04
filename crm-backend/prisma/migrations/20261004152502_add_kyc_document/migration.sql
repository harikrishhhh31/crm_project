-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storedAs" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "extractedText" TEXT,
    "fields" JSONB NOT NULL DEFAULT '{}',
    "validationValid" BOOLEAN NOT NULL DEFAULT false,
    "validationErrors" JSONB NOT NULL DEFAULT '[]',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KycDocument_fileId_key" ON "KycDocument"("fileId");

-- CreateIndex
CREATE INDEX "KycDocument_customerId_idx" ON "KycDocument"("customerId");

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
