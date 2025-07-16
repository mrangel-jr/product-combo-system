import { Product } from "../entities/Product";
import { IComboRepository } from "../repositories/IComboRepository";
import { IProductRepository } from "../repositories/IProductRepository";
import { CacheService, SearchOptions, SearchResult } from "../types";
import { PricingEngine } from "./PricinEngine";

export interface ProductWithPricing extends Product {
  pricing?: ProductPricing;
}

export interface ProductPricing {
  individualPrice: IndividualPrice;
  recommendedOption: "individual" | "combo";
  recommendedCombo: RecommendedCombo | undefined;
  availableCombos: ComboAnalysis[];
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

export interface ComboAnalysis {
  id: string;
  name: string;
  description?: string;
  comboPrice: number;
  savings: number;
  savingsPercentage: string;
  products: Array<{
    name: string;
    basePrice: number;
    quantity: number;
    isMandatory: boolean;
  }>;
  score: number;
}

export interface RecommendedCombo {
  id: string;
  name: string;
  price: number;
  savings: number;
  reason: string;
}

export class SearchProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly comboRepository: IComboRepository,
    private readonly pricingEngine: PricingEngine,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<ProductWithPricing>> {
    const { limit = 20, offset = 0, includeCombos = true } = options;

    // Verificar cache primeiro
    const cacheKey = `search:${query}:${limit}:${offset}:${includeCombos}`;
    const cachedResult = await this.cacheService.get(cacheKey);

    if (cachedResult) {
      return JSON.parse(cachedResult) as SearchResult<ProductWithPricing>;
    }

    // Buscar produtos
    const searchResult = await this.productRepository.search(query, {
      limit,
      offset,
    });

    if (!includeCombos) {
      const result: SearchResult<ProductWithPricing> = {
        data: searchResult.data,
        pagination: searchResult.pagination,
      };

      await this.cacheService.set(cacheKey, JSON.stringify(result), 900); // 15 min
      return result;
    }

    // Enriquecer com combos
    const enrichedProducts = await Promise.all(
      searchResult.data.map(async (product): Promise<ProductWithPricing> => {
        const combos = await this.comboRepository.findByProductId(product.id);
        const pricing = await this.pricingEngine.calculateBestOption(
          product,
          combos
        );

        return {
          ...product,
          pricing,
          isActive: product.isActive,
          hasStock: product.hasStock,
          applyDiscount: product.applyDiscount,
        };
      })
    );

    const result: SearchResult<ProductWithPricing> = {
      data: enrichedProducts,
      pagination: searchResult.pagination,
    };

    // Cache result
    await this.cacheService.set(cacheKey, JSON.stringify(result), 900);

    return result;
  }
}
