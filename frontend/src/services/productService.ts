import { SearchOptions, SearchResponse } from "@/types/product";
import api from "./api";

export const productService = {
  async searchProducts(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    const { limit = 20, offset = 0, includeCombos = true } = options;

    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
      include_combos: includeCombos.toString(),
    });

    const response = await api.get<SearchResponse>(
      `/products/search?${params}`
    );
    return response.data;
  },

  async getProductById(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};
