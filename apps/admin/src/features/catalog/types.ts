// apps/admin/src/features/catalog/types.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string; icon: string | null };
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Partial<Omit<Category, 'id' | 'productCount' | 'createdAt' | 'updatedAt'>> & { name: string };

export type ProductInput = Partial<Omit<Product, 'id' | 'category' | 'discountPercent' | 'createdAt' | 'updatedAt'>> & {
  name: string;
  description: string;
  price: number;
  categoryId: string;
};
