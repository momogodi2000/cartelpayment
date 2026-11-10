-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Animal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breedId" TEXT NOT NULL,
    "breederId" TEXT,
    "gender" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "size" TEXT NOT NULL,
    "weightKg" REAL,
    "coat" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "descriptionEn" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "temperamentEn" TEXT NOT NULL,
    "temperamentFr" TEXT NOT NULL,
    "socializationEn" TEXT NOT NULL,
    "socializationFr" TEXT NOT NULL,
    "pedigree" TEXT,
    "microchip" TEXT,
    "transportInfo" TEXT,
    "healthDocStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "isPaymentTest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Animal_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "Breed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Animal_breederId_fkey" FOREIGN KEY ("breederId") REFERENCES "Breeder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Animal" ("breedId", "breederId", "city", "coat", "color", "country", "createdAt", "currency", "dateOfBirth", "descriptionEn", "descriptionFr", "featured", "gender", "healthDocStatus", "id", "isDemo", "microchip", "name", "pedigree", "priceCents", "published", "seoDescription", "seoTitle", "size", "slug", "socializationEn", "socializationFr", "species", "status", "temperamentEn", "temperamentFr", "transportInfo", "updatedAt", "weightKg") SELECT "breedId", "breederId", "city", "coat", "color", "country", "createdAt", "currency", "dateOfBirth", "descriptionEn", "descriptionFr", "featured", "gender", "healthDocStatus", "id", "isDemo", "microchip", "name", "pedigree", "priceCents", "published", "seoDescription", "seoTitle", "size", "slug", "socializationEn", "socializationFr", "species", "status", "temperamentEn", "temperamentFr", "transportInfo", "updatedAt", "weightKg" FROM "Animal";
DROP TABLE "Animal";
ALTER TABLE "new_Animal" RENAME TO "Animal";
CREATE UNIQUE INDEX "Animal_slug_key" ON "Animal"("slug");
CREATE INDEX "Animal_status_species_idx" ON "Animal"("status", "species");
CREATE INDEX "Animal_breedId_idx" ON "Animal"("breedId");
CREATE INDEX "Animal_priceCents_idx" ON "Animal"("priceCents");
CREATE INDEX "Animal_country_idx" ON "Animal"("country");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
