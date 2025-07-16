import { Request, Response } from "express";
import Joi from "joi";
import {
  ProductWithPricing,
  SearchProductsUseCase,
} from "../../domain/use-cases/SearchProductsUseCase";

interface SearchQuery {
  q: string;
  limit: number;
  offset: number;
  include_combos: boolean;
}

export class ProductController {
  constructor(private readonly searchProductsUseCase: SearchProductsUseCase) {}

  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      // Validação da entrada
      const schema = Joi.object({
        q: Joi.string().min(1).max(100).required(),
        limit: Joi.number().integer().min(1).max(100).default(20),
        offset: Joi.number().integer().min(0).default(0),
        include_combos: Joi.boolean().default(true),
      });

      const { error, value } = schema.validate(req.query);

      if (error) {
        res.status(400).json({
          error: "Validation error",
          details: error.details[0]?.message,
        });
        return;
      }

      const {
        q: query,
        limit,
        offset,
        include_combos: includeCombos,
      } = value as SearchQuery;

      // Executar caso de uso
      const result = await this.searchProductsUseCase.execute(query, {
        limit,
        offset,
        includeCombos,
      });

      // Formatar resposta
      const response = {
        data: result.data.map((product) => this.formatProductResponse(product)),
        pagination: result.pagination,
        query: {
          term: query,
          includeCombos,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error in searchProducts:", error);
      res.status(500).json({
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Something went wrong",
      });
    }
  }

  private formatProductResponse(product: ProductWithPricing): any {
    const formatted: any = {
      id: product.id,
      name: product.name,
      code: product.code,
      description: product.description,
      category: product.category,
      basePrice: product.basePrice,
    };

    if (product.pricing) {
      formatted.pricing = {
        individual: product.pricing.individualPrice,
        recommendedOption: product.pricing.recommendedOption,
        availableCombos: product.pricing.availableCombos.map((combo) => ({
          id: combo.id,
          name: combo.name,
          description: combo.description,
          price: combo.comboPrice,
          savings: combo.savings,
          savingsPercentage: combo.savingsPercentage,
          products: combo.products,
        })),
      };

      if (product.pricing.recommendedCombo) {
        formatted.pricing.recommendedCombo = {
          id: product.pricing.recommendedCombo.id,
          name: product.pricing.recommendedCombo.name,
          price: product.pricing.recommendedCombo.price,
          savings: product.pricing.recommendedCombo.savings,
          reason: product.pricing.recommendedCombo.reason,
        };
      }
    }

    return formatted;
  }
}
