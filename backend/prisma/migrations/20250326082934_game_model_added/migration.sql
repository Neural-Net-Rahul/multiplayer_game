-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "roomId" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "boardStatus" TEXT NOT NULL,
    "chatMessages" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);
