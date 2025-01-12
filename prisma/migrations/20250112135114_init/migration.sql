-- CreateTable
CREATE TABLE "KeywordEmbedding" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeywordEmbedding_keyword_key" ON "KeywordEmbedding"("keyword");

-- CreateIndex
CREATE INDEX "KeywordEmbedding_keyword_idx" ON "KeywordEmbedding"("keyword");
