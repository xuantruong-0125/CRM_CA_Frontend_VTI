export interface Price {
  id: number;
  basePrice: number;
  taxRate: number;
  effectiveFrom: string;
  effectiveTo: string;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  productId: number;
  productName: string;
  productSkuCode: string;
  productImageUrl: string;
}

export interface CreatePriceRequest {
  basePrice: number;
  taxRate: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  productId: number;
}

export interface UpdatePriceRequest {
  basePrice: number;
  taxRate: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}
