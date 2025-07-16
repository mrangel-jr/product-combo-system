import { DiscountType } from "../types";

export interface ComboProduct {
  id?: string;
  name: string;
  basePrice: number;
  quantity: number;
  isMandatory: boolean;
}

export interface ComboConstructorParams {
  id: string;
  name: string;
  description?: string;
  comboPrice: number;
  discountType: DiscountType;
  discountValue: number;
  priority?: number;
  isActive?: boolean;
  products?: ComboProduct[];
}

export class Combo {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly comboPrice: number;
  public readonly discountType: DiscountType;
  public readonly discountValue: number;
  public readonly priority: number;
  public readonly isActive: boolean;
  public readonly products: ComboProduct[];

  constructor(params: ComboConstructorParams) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description || "";
    this.comboPrice = params.comboPrice;
    this.discountType = params.discountType;
    this.discountValue = params.discountValue;
    this.priority = params.priority || 0;
    this.isActive = params.isActive !== false;
    this.products = params.products || [];
  }

  calculateTotalPrice(): number {
    return this.products.reduce((total, product) => {
      return total + product.basePrice * product.quantity;
    }, 0);
  }

  calculateSavings(): number {
    const originalPrice = this.calculateTotalPrice();
    return Math.max(0, originalPrice - this.comboPrice);
  }

  calculateSavingsPercentage(): string {
    const originalPrice = this.calculateTotalPrice();
    if (originalPrice === 0) return "0.00";
    return ((this.calculateSavings() / originalPrice) * 100).toFixed(2);
  }

  isValidCombo(): boolean {
    return this.isActive && this.products.length > 0;
  }
}
