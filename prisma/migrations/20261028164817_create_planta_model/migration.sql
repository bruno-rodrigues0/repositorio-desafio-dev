/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Luminosidade" AS ENUM ('SOMBRA', 'MEIA_SOMBRA', 'SOL_PLENO');

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Conta";

-- CreateTable
CREATE TABLE "Planta" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "preco" INTEGER NOT NULL,
    "estoque" INTEGER NOT NULL,
    "luminosidade" "Luminosidade" NOT NULL,
    "petFriendly" BOOLEAN NOT NULL,
    "regaACadaDias" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Planta_pkey" PRIMARY KEY ("id")
);
