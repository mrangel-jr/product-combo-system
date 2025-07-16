import cors from "cors";
import dotenv from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

// Infrastructure
import { PostgresConnection } from "./infrastructure/database/PostgresConnection";
import { PostgresComboRepository } from "./infrastructure/repositories/PostgresComboRepository";
import { PostgresProductRepository } from "./infrastructure/repositories/PostgresProductRepository";

// Domain
import { SearchProductsUseCase } from "./domain/use-cases/SearchProductsUseCase";

// Interface
import { PricingEngine } from "./domain/use-cases/PricinEngine";
import { RedisService } from "./infrastructure/cache/RedisService";
import { ProductController } from "./interfaces/controllers/ProductController";
import { createProductRoutes } from "./interfaces/routes/productRoutes";

dotenv.config();

export class App {
  public app: Application;
  private dbConnection!: PostgresConnection;
  private cacheService!: RedisService;
  private productController!: ProductController;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan("combined"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private async setupDependencies(): Promise<void> {
    // Infrastructure
    this.dbConnection = new PostgresConnection();
    this.cacheService = new RedisService();

    // Repositories
    const productRepository = new PostgresProductRepository(this.dbConnection);
    const comboRepository = new PostgresComboRepository(this.dbConnection);

    // Domain Services
    const pricingEngine = new PricingEngine();

    // Use Cases
    const searchProductsUseCase = new SearchProductsUseCase(
      productRepository,
      comboRepository,
      pricingEngine,
      this.cacheService
    );

    // Controllers
    this.productController = new ProductController(searchProductsUseCase);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (req: Request, res: Response) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use("/api/products", createProductRoutes(this.productController));

    // 404 handler
    this.app.use("*", (req: Request, res: Response) => {
      res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Unhandled error:", err);

        res.status(500).json({
          error: "Internal server error",
          message:
            process.env.NODE_ENV === "development"
              ? err.message
              : "Something went wrong",
        });
      }
    );
  }

  async start(): Promise<void> {
    await this.setupDependencies();
    this.setupRoutes();

    const PORT = process.env.PORT || 3001;

    this.app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  }

  async close(): Promise<void> {
    if (this.dbConnection) {
      await this.dbConnection.close();
    }
    if (this.cacheService) {
      await this.cacheService.close();
    }
  }
}

// Start application
if (require.main === module) {
  const app = new App();
  app.start().catch(console.error);

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("🔄 Graceful shutdown initiated");
    await app.close();
    process.exit(0);
  });
}
