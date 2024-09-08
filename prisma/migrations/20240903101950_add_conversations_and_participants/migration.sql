/*
  Warnings:

  - You are about to drop the `UserConversation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserConversation";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_UserConversations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserConversations_A_fkey" FOREIGN KEY ("A") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserConversations_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserConversations_AB_unique" ON "_UserConversations"("A", "B");

-- CreateIndex
CREATE INDEX "_UserConversations_B_index" ON "_UserConversations"("B");
