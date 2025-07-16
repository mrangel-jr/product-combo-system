export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  basePrice: number;
  pricing?: ProductPricing;
}

export interface ProductPricing {
  individual: IndividualPrice;
  recommendedOption: "individual" | "combo";
  recommendedCombo?: RecommendedCombo;
  availableCombos: ComboOption[];
}

export interface IndividualPrice {
  originalPrice: number;
  discount: {
    type: "percentage" | "fixed";
    value: number;
    amount: number;
  };
  finalPrice: number;
}

export interface ComboOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  savings: number;
  savingsPercentage: string;
  products: ComboProduct[];
}

export interface ComboProduct {
  name: string;
  basePrice: number;
  quantity: number;
  isMandatory: boolean;
}

export interface RecommendedCombo {
  id: string;
  name: string;
  price: number;
  savings: number;
  reason: string;
}

export interface SearchResponse {
  data: Product[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
  };
  query: {
    term: string;
    includeCombos: boolean;
  };
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  includeCombos?: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: string;
}
