import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ProductController } from "../controllers/ProductController";

// Rate limiting
const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 requests por minuto
  message: {
    error: "Too many search requests",
    message: "Please try again later",
  },
});

export function createProductRoutes(
  productController: ProductController
): Router {
  const router = Router();

  router.get("/search", searchRateLimit, (req, res) => {
    productController.searchProducts(req, res);
  });

  return router;
}
