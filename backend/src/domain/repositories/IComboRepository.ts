import { Combo } from "../entities/Combo";

export interface IComboRepository {
  findByProductId(productId: string): Promise<Combo[]>;
  findById(id: string): Promise<Combo | null>;
  findActiveCombosByProducts(productIds: string[]): Promise<Combo[]>;
}
