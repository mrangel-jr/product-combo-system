import { Combo } from "../entities/Combo";
import { Product } from "../entities/Product";
import {
  ComboAnalysis,
  IndividualPrice,
  ProductPricing,
  RecommendedCombo,
} from "./SearchProductsUseCase";

interface PricingRule {
  name: string;
  weight: number;
}

export class PricingEngine {
  private readonly rules: PricingRule[] = [
    { name: "savings", weight: 0.4 },
    { name: "popularity", weight: 0.3 },
    { name: "stock", weight: 0.2 },
    { name: "margin", weight: 0.1 },
  ];

  async calculateBestOption(
    product: Product,
    combos: Combo[]
  ): Promise<ProductPricing> {
    // Calcular preço individual com desconto
    const individualPrice = await this.calculateIndividualPrice(product);

    if (!combos || combos.length === 0) {
      return {
        individualPrice,
        recommendedOption: "individual",
        recommendedCombo: undefined,
        availableCombos: [],
      };
    }

    // Calcular preços dos combos
    const comboAnalysis: ComboAnalysis[] = combos.map((combo) => {
      const savings = combo.calculateSavings();
      const savingsPercentage = combo.calculateSavingsPercentage();

      return {
        id: combo.id,
        name: combo.name,
        description: combo.description || "",
        comboPrice: combo.comboPrice,
        savings,
        savingsPercentage,
        products: combo.products,
        score: this.calculateComboScore(combo, savings),
      };
    });

    // Ordenar por score (melhor primeiro)
    const sortedCombos = comboAnalysis.sort((a, b) => b.score - a.score);
    const bestCombo = sortedCombos[0];

    // Determinar recomendação
    const recommendedOption = this.shouldRecommendCombo(
      individualPrice,
      bestCombo
    )
      ? "combo"
      : "individual";

    return {
      individualPrice,
      recommendedOption,
      recommendedCombo:
        recommendedOption === "combo" && bestCombo
          ? this.createRecommendedCombo(bestCombo)
          : undefined,
      availableCombos: sortedCombos.slice(0, 5), // Máximo 5 combos
    };
  }

  private async calculateIndividualPrice(
    product: Product
  ): Promise<IndividualPrice> {
    // Aqui buscaria descontos do produto
    // Por simplicidade, assumindo desconto de 20% se disponível
    const hasDiscount = Math.random() > 0.5; // Simulação
    const discountPercentage = hasDiscount ? 20 : 0;
    const finalPrice = product.basePrice * (1 - discountPercentage / 100);

    return {
      originalPrice: product.basePrice,
      discount: {
        type: "percentage",
        value: discountPercentage,
        amount: product.basePrice - finalPrice,
      },
      finalPrice,
    };
  }

  private calculateComboScore(combo: Combo, savings: number): number {
    // Algoritmo simplificado de score
    const savingsScore = Math.min(savings / 10, 10); // Máximo 10 pontos
    const popularityScore = combo.priority || 5; // Baseado na prioridade
    const stockScore = 8; // Assumindo estoque bom
    const marginScore = 6; // Assumindo margem OK

    return (
      savingsScore * this.rules[0]!.weight +
      popularityScore * this.rules[1]!.weight +
      stockScore * this.rules[2]!.weight +
      marginScore * this.rules[3]!.weight
    );
  }

  private shouldRecommendCombo(
    individualPrice: IndividualPrice,
    bestCombo?: ComboAnalysis
  ): boolean {
    if (!bestCombo) return false;

    // Recomendar combo se economia for >= R$ 5,00
    return bestCombo.savings >= 5.0;
  }

  private createRecommendedCombo(combo: ComboAnalysis): RecommendedCombo {
    return {
      id: combo.id,
      name: combo.name,
      price: combo.comboPrice,
      savings: combo.savings,
      reason: "Maior economia disponível",
    };
  }
}
