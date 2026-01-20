-- Clear existing embedding data to allow column type change
UPDATE "Poem" SET embedding = NULL;

-- Alter embedding column from vector(512) to vector(1024)
ALTER TABLE "Poem" ALTER COLUMN embedding TYPE vector(1024);

-- AddForeignKey
ALTER TABLE "CollectionPoem" ADD CONSTRAINT "CollectionPoem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionPoem" ADD CONSTRAINT "CollectionPoem_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "Poem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
