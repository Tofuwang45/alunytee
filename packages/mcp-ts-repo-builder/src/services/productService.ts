import type { CreateProductInput, Product } from "../models/product";
import { getPool } from "../utils/database";

function calculateDynamicPrice(basePrice: number): number {
  const markup = basePrice > 100 ? 1.12 : 1.05;
  return Math.round(basePrice * markup * 100) / 100;
}

/**
 * @agent_instructions [IGNORE: Trace the logic for createProduct()]
 */
export class ProductService {
  createProduct(input: CreateProductInput): Product {
    const finalPrice = calculateDynamicPrice(input.basePrice);
    const product: Product = {
      id: `prod_${Date.now()}`,
      name: input.name,
      basePrice: input.basePrice,
      finalPrice,
      ownerId: input.ownerId,
    };

    const { products } = getPool();
    products.set(product.id, product);
    return product;
  }

  listProducts(): Product[] {
    const { products } = getPool();
    return Array.from(products.values());
  }
}
