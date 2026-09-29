-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BARBER_BOSS', 'BARBER_INDEPENDENT', 'BARBER_AFFILIATE');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BARBER_INDEPENDENT',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "photo" TEXT,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);
