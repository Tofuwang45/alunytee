import { requireAuth, type AuthenticatedRequest } from "../auth/middleware";
import type { CreateProductInput } from "../models/product";
import { ProductService } from "../services/productService";

const service = new ProductService();

export function handleCreateProduct(request: AuthenticatedRequest, body: CreateProductInput) {
  const user = requireAuth(request);
  const product = service.createProduct({
    ...body,
    ownerId: user.id,
  });
  return { status: 201, body: product };
}

export function handleListProducts(request: AuthenticatedRequest) {
  requireAuth(request);
  return { status: 200, body: service.listProducts() };
}
