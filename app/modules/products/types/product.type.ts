export interface Product {
  id: number;
  skuCode: string;
  name: string;
  imageUrl: string;
  description: string;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
}

export interface CreateProductRequest {
  skuCode: string;
  name: string;
  imageUrl: string;
  description: string;
  categoryId: number | null;
}

export interface UpdateProductRequest {
  skuCode: string;
  name: string;
  imageUrl: string;
  description: string;
  categoryId: number | null;
}
