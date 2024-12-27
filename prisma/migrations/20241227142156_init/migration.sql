-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GENERAL', 'CIRCLE_INVITE', 'CIRCLE_ANNOUNCEMENT', 'CIRCLE_THREAD');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "circleId" TEXT,
    "relatedEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_circleId_idx" ON "Notification"("circleId");

-- CreateIndex
CREATE INDEX "Notification_relatedEntityId_idx" ON "Notification"("relatedEntityId");

-- CreateIndex
CREATE INDEX "NotificationState_notificationId_idx" ON "NotificationState"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationState_userId_idx" ON "NotificationState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationState_userId_notificationId_key" ON "NotificationState"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "NotificationState" ADD CONSTRAINT "NotificationState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationState" ADD CONSTRAINT "NotificationState_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
