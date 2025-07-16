import { DiscountType, ProductStatus } from "../types";

export interface ProductConstructorParams {
  id: string;
  name: string;
  code: string;
  description?: string;
  basePrice: number;
  categoryId: string;
  status?: ProductStatus;
  stockQuantity?: number;
  category: string;
}

export class Product {
  public readonly id: string;
  public readonly name: string;
  public readonly code: string;
  public readonly description?: string;
  public readonly basePrice: number;
  public readonly categoryId?: string;
  public readonly status: ProductStatus;
  public readonly stockQuantity: number;
  public readonly category?: string;

  constructor(params: ProductConstructorParams) {
    this.id = params.id;
    this.name = params.name;
    this.code = params.code;
    this.description = params.description || "";
    this.basePrice = params.basePrice;
    this.categoryId = params.categoryId;
    this.status = params.status || "active";
    this.stockQuantity = params.stockQuantity || 0;
    this.category = params.category;
  }

  isActive(): boolean {
    return this.status === "active";
  }

  hasStock(): boolean {
    return this.stockQuantity > 0;
  }

  applyDiscount(discount?: Discount): number {
    if (!discount || !discount.isValid()) {
      return this.basePrice;
    }

    if (discount.type === "percentage") {
      return this.basePrice * (1 - discount.value / 100);
    }

    if (discount.type === "fixed") {
      return Math.max(0, this.basePrice - discount.value);
    }

    return this.basePrice;
  }
}

export interface DiscountConstructorParams {
  id: string;
  type: DiscountType;
  value: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
}

export class Discount {
  public readonly id: string;
  public readonly type: DiscountType;
  public readonly value: number;
  public readonly validFrom: Date;
  public readonly validUntil?: Date;
  public readonly isActive: boolean;

  constructor(params: DiscountConstructorParams) {
    this.id = params.id;
    this.type = params.type;
    this.value = params.value;
    this.validFrom = params.validFrom || new Date();
    this.validUntil = params.validUntil || new Date();
    this.isActive = params.isActive !== false;
  }

  isValid(date: Date = new Date()): boolean {
    if (!this.isActive) return false;

    if (this.validFrom && date < this.validFrom) return false;
    if (this.validUntil && date > this.validUntil) return false;

    return true;
  }
}
