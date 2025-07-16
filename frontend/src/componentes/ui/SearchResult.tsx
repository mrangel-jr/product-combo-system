import { SearchResponse } from "@/types/product";
import { AlertCircle, Package } from "lucide-react";
import React from "react";
import ProductCard from "./ProductCard";

interface SearchResultsProps {
  results?: SearchResponse;
  loading: boolean;
  error?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro na busca
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Busque por produtos
        </h3>
        <p className="text-gray-600">
          Digite o nome ou código do produto que você procura
        </p>
      </div>
    );
  }

  if (results.data.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-600">
          Tente buscar com termos diferentes ou verifique a ortografia
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header dos Resultados */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Resultados da busca: {results.query.term}
        </h2>
        <p className="text-gray-600 mt-1">
          {results.pagination.total} produto
          {results.pagination.total !== 1 ? "s" : ""} encontrado
          {results.pagination.total !== 1 ? "s" : ""}
          {results.query.includeCombos && " (com combos disponíveis)"}
        </p>
      </div>

      {/* Lista de Produtos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {results.data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Paginação (simplificada) */}
      {results.pagination.hasNext && (
        <div className="text-center py-6">
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Carregar mais produtos
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
