import { Product } from "@/types/product";
import { Package, Star, TrendingUp } from "lucide-react";
import React from "react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const renderIndividualPrice = () => {
    if (!product.pricing?.individual) {
      return (
        <div className="text-2xl font-bold text-gray-900">
          {formatPrice(product.basePrice)}
        </div>
      );
    }

    const { individual } = product.pricing;
    const hasDiscount = individual.discount.value > 0;

    return (
      <div className="space-y-1">
        {hasDiscount && (
          <div className="text-sm text-gray-500 line-through">
            {formatPrice(individual.originalPrice)}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(individual.finalPrice)}
          </span>
          {hasDiscount && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              -{individual.discount.value}%
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderRecommendedCombo = () => {
    if (!product.pricing?.recommendedCombo) return null;

    const combo = product.pricing.recommendedCombo;

    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-800">Recomendado</span>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">{combo.name}</h4>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-green-700">
              {formatPrice(combo.price)}
            </span>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">
                Economize {formatPrice(combo.savings)}
              </div>
              <div className="text-xs text-gray-500">{combo.reason}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAvailableCombos = () => {
    if (!product.pricing?.availableCombos?.length) return null;

    const otherCombos = product.pricing.availableCombos.filter(
      (combo) => combo.id !== product.pricing?.recommendedCombo?.id
    );

    if (otherCombos.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Outros combos disponíveis
        </h4>
        <div className="space-y-2">
          {otherCombos.slice(0, 2).map((combo) => (
            <div
              key={combo.id}
              className="p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-900">{combo.name}</h5>
                  <p className="text-sm text-gray-600">{combo.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatPrice(combo.price)}
                  </div>
                  <div className="text-xs text-green-600">
                    Economize {formatPrice(combo.savings)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      {/* Header do Produto */}
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {product.name}
          </h3>
          <span className="text-sm text-gray-500 ml-2">{product.code}</span>
        </div>
        {product.description && (
          <p className="text-gray-600 text-sm">{product.description}</p>
        )}
        {product.category && (
          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {product.category}
          </span>
        )}
      </div>

      {/* Preço Individual */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Preço Individual
        </h4>
        {renderIndividualPrice()}
      </div>

      {/* Combo Recomendado */}
      {renderRecommendedCombo()}

      {/* Outros Combos */}
      {renderAvailableCombos()}

      {/* Indicador de Melhor Opção */}
      {product.pricing?.recommendedOption === "combo" && (
        <div className="mt-4 flex items-center gap-2 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">Melhor negócio: Combo!</span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
