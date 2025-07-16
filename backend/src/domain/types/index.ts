export type ProductStatus = "active" | "inactive";
export type DiscountType = "percentage" | "fixed";

export interface DatabaseRow {
  [key: string]: any;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface SearchOptions extends PaginationOptions {
  includeCombos?: boolean;
}

export interface SearchFilters extends PaginationOptions {
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationResult {
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}

export interface SearchResult<T> {
  data: T[];
  pagination: PaginationResult;
}

export interface CacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  close(): Promise<void>;
}

export interface DatabaseConnection {
  query(text: string, params?: any[]): Promise<{ rows: DatabaseRow[] }>;
  close(): Promise<void>;
}
