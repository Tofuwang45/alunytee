export interface Product {
  id: string;
  name: string;
  basePrice: number;
  finalPrice: number;
  ownerId: string;
}

export interface CreateProductInput {
  name: string;
  basePrice: number;
  ownerId: string;
}
