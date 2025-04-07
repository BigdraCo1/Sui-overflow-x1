-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('SENT', 'PENDING', 'FAILED');

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pushedAt" TIMESTAMP(3),
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payload" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encrypted_data" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,

    CONSTRAINT "Payload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "data_hash" TEXT NOT NULL,
    "payloadId" TEXT NOT NULL,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_payloadId_key" ON "Metadata"("payloadId");

-- AddForeignKey
ALTER TABLE "Payload" ADD CONSTRAINT "Payload_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metadata" ADD CONSTRAINT "Metadata_payloadId_fkey" FOREIGN KEY ("payloadId") REFERENCES "Payload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
