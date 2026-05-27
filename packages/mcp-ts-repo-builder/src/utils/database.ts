import type { Product } from "../models/product";
import type { User } from "../models/user";

const users = new Map<string, User>();
const products = new Map<string, Product>();

let poolReady = false;

export function getPool() {
  if (!poolReady) {
    poolReady = true;
  }
  return { users, products };
}

export function resetDatabase() {
  users.clear();
  products.clear();
  poolReady = false;
}
