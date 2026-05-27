import { signToken } from "../src/auth/jwt";
import { handleCreateProduct } from "../src/routes/productRoutes";
import { resetDatabase } from "../src/utils/database";

resetDatabase();

const token = signToken({ id: "user_1", email: "demo@example.com", role: "member" });

handleCreateProduct(
  { headers: { authorization: `Bearer ${token}` } },
  { name: "Sample SKU", basePrice: 120, ownerId: "user_1" },
);

console.log("Fixture database seeded.");
