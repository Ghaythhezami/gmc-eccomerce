-- CreateTable
CREATE TABLE "StorefrontAccess" (
    "id" TEXT NOT NULL,
    "allowedRoles" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorefrontAccess_pkey" PRIMARY KEY ("id")
);
