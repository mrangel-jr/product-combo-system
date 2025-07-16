import { Combo, ComboProduct } from "../../domain/entities/Combo";
import { IComboRepository } from "../../domain/repositories/IComboRepository";
import { DatabaseConnection } from "../../domain/types";

export class PostgresComboRepository implements IComboRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async findByProductId(productId: string): Promise<Combo[]> {
    const query = `
      SELECT DISTINCT c.*, cp.required_quantity, cp.is_mandatory,
             p.name as product_name, p.base_price as product_price
      FROM combos c
      INNER JOIN combo_products cp ON c.id = cp.combo_id
      INNER JOIN products p ON cp.product_id = p.id
      WHERE c.is_active = true
        AND EXISTS (
          SELECT 1 FROM combo_products cp2
          WHERE cp2.combo_id = c.id AND cp2.product_id = $1
        )
      ORDER BY c.priority ASC, c.name
    `;

    const result = await this.db.query(query, [productId]);

    if (result.rows.length === 0) {
      return [];
    }

    // Agrupar por combo
    const combosMap = new Map<string, any>();

    result.rows.forEach((row) => {
      const comboId = row.id as string;

      if (!combosMap.has(comboId)) {
        combosMap.set(comboId, {
          id: row.id,
          name: row.name,
          description: row.description,
          comboPrice: parseFloat(row.combo_price as string),
          discountType: row.discount_type,
          discountValue: parseFloat(row.discount_value as string),
          priority: row.priority,
          isActive: row.is_active,
          products: [],
        });
      }

      const combo = combosMap.get(comboId)!;
      combo.products.push({
        name: row.product_name,
        basePrice: parseFloat(row.product_price as string),
        quantity: row.required_quantity,
        isMandatory: row.is_mandatory,
      });
    });

    return Array.from(combosMap.values()).map(
      (comboData) => new Combo(comboData)
    );
  }

  async findById(id: string): Promise<Combo | null> {
    const query = `
      SELECT c.*, cp.required_quantity, cp.is_mandatory,
             p.id as product_id, p.name as product_name, p.base_price as product_price
      FROM combos c
      LEFT JOIN combo_products cp ON c.id = cp.combo_id
      LEFT JOIN products p ON cp.product_id = p.id
      WHERE c.id = $1 AND c.is_active = true
      ORDER BY cp.position_order
    `;

    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const firstRow = result.rows[0]!;
    const products: ComboProduct[] = [];

    result.rows.forEach((row) => {
      if (row.product_id) {
        products.push({
          id: row.product_id,
          name: row.product_name,
          basePrice: parseFloat(row.product_price as string),
          quantity: row.required_quantity,
          isMandatory: row.is_mandatory,
        });
      }
    });

    return new Combo({
      id: firstRow.id,
      name: firstRow.name,
      description: firstRow.description,
      comboPrice: parseFloat(firstRow.combo_price as string),
      discountType: firstRow.discount_type,
      discountValue: parseFloat(firstRow.discount_value as string),
      priority: firstRow.priority,
      isActive: firstRow.is_active,
      products,
    });
  }

  async findActiveCombosByProducts(productIds: string[]): Promise<Combo[]> {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    const placeholders = productIds
      .map((_, index) => `$${index + 1}`)
      .join(",");

    const query = `
      SELECT DISTINCT c.*
      FROM combos c
      INNER JOIN combo_products cp ON c.id = cp.combo_id
      WHERE c.is_active = true
        AND cp.product_id IN (${placeholders})
      ORDER BY c.priority ASC, c.name
    `;

    const result = await this.db.query(query, productIds);

    return result.rows.map(
      (row) =>
        new Combo({
          id: row.id,
          name: row.name,
          description: row.description,
          comboPrice: parseFloat(row.combo_price as string),
          discountType: row.discount_type,
          discountValue: parseFloat(row.discount_value as string),
          priority: row.priority,
          isActive: row.is_active,
        })
    );
  }
}
