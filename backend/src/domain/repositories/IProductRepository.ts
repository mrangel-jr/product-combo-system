import { Product } from "../entities/Product";
import { SearchFilters, SearchResult } from "../types";

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByCode(code: string): Promise<Product | null>;
  search(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResult<Product>>;
  findWithDiscounts(productId: string): Promise<Product | null>;
}
