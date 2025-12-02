-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentId_key" ON "Order"("paymentId");
