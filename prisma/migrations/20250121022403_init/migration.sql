-- CreateTable
CREATE TABLE "WelcomeCard" (
    "id" TEXT NOT NULL,
    "frontTitle" TEXT NOT NULL,
    "frontImage" TEXT,
    "backTitle" TEXT NOT NULL,
    "backDescription" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelcomeCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WelcomeCard" ADD CONSTRAINT "WelcomeCard_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
