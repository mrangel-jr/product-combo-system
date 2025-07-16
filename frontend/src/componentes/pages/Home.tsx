"use client";

import { productService } from "@/services/productService";
import { ApiError, SearchResponse } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SearchBox from "../ui/SearchBox";
import SearchResults from "../ui/SearchResult";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery<SearchResponse, ApiError>({
    queryKey: ["products", searchQuery],
    queryFn: () => productService.searchProducts(searchQuery),
    enabled: !!searchQuery,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
  };

  const errorMessage = error?.message || "Erro ao buscar produtos";

  console.log("Search Results:", searchResults);

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchBox onSearch={handleSearch} loading={isLoading} />
        </div>

        {/* Results Section */}
        <SearchResults
          results={searchResults}
          loading={isLoading}
          error={errorMessage}
        />
      </main>
    </div>
  );
}
