import { Product } from "../../domain/entities/Product";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import {
  DatabaseConnection,
  SearchFilters,
  SearchResult,
} from "../../domain/types";

export class PostgresProductRepository implements IProductRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async findById(id: string): Promise<Product | null> {
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.status = 'active'
    `;

    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToProduct(result.rows[0]!);
  }

  async findByCode(code: string): Promise<Product | null> {
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.code = $1 AND p.status = 'active'
    `;

    const result = await this.db.query(query, [code]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToProduct(result.rows[0]!);
  }

  async search(
    query: string,
    filters: SearchFilters = {}
  ): Promise<SearchResult<Product>> {
    const { limit = 20, offset = 0 } = filters;

    const searchQuery = `
      SELECT p.*, c.name as category_name,
             COUNT(*) OVER() as total_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
        AND (p.name ILIKE $1 OR p.code ILIKE $1 OR p.description ILIKE $1)
      ORDER BY p.name
      LIMIT $2 OFFSET $3
    `;

    const searchTerm = `%${query}%`;
    const result = await this.db.query(searchQuery, [
      searchTerm,
      limit,
      offset,
    ]);

    const products = result.rows.map((row) => this.mapRowToProduct(row));
    const totalCount =
      result.rows.length > 0
        ? parseInt(result.rows[0]!.total_count as string)
        : 0;

    return {
      data: products,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasNext: offset + limit < totalCount,
      },
    };
  }

  async findWithDiscounts(productId: string): Promise<Product | null> {
    const query = `
      SELECT p.*, c.name as category_name,
             pd.discount_type, pd.discount_value, pd.valid_from, pd.valid_until, pd.is_active
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_discounts pd ON p.id = pd.product_id
      WHERE p.id = $1 AND p.status = 'active'
        AND (pd.is_active = true OR pd.is_active IS NULL)
    `;

    const result = await this.db.query(query, [productId]);

    if (result.rows.length === 0) {
      return null;
    }

    const product = this.mapRowToProduct(result.rows[0]!);

    return product;
  }

  private mapRowToProduct(row: any): Product {
    return new Product({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      basePrice: parseFloat(row.base_price),
      categoryId: row.category_id,
      status: row.status,
      stockQuantity: row.stock_quantity,
      category: row.category_name,
    });
  }
}
