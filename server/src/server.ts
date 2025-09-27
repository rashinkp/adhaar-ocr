import express from "express";
import cors from "cors";
import { connectDB } from "./config/database.config.js";
import config from "./config/env.config.js";
import logger from "./config/logger.config.js";
import { corsOptions, rateLimiter, errorHandler } from "./middleware/security.middleware.js";

// Import clean architecture components
import { AadhaarRepository } from "./repositories/AadhaarRepository.js";
import { TesseractOcrProvider } from "./providers/ocr/TesseractOcrProvider.js";
import { AadhaarService } from "./services/AadhaarService.js";
import { AadhaarController } from "./controllers/AadhaarController.js";
import aadhaarRoutes from "./routes/aadhaar.routes.js";

class App {
  public app: express.Application;
  private aadhaarController!: AadhaarController;

  constructor() {
    this.app = express();
    this.initializeDatabase();
    this.initializeDependencies();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await connectDB();
      logger.info("Database connection initialized");
    } catch (error) {
      logger.error("Database connection failed", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      process.exit(1);
    }
  }

  private initializeDependencies(): void {
    // Initialize repositories
    const aadhaarRepository = new AadhaarRepository();

    // Initialize providers
    const tesseractOcrProvider = new TesseractOcrProvider("eng");

    // Initialize services with dependency injection
    const aadhaarService = new AadhaarService(
      aadhaarRepository,
      tesseractOcrProvider
    );

    // Initialize controllers with dependency injection
    this.aadhaarController = new AadhaarController(aadhaarService);

    logger.info("Dependencies initialized successfully");
  }

  private initializeMiddleware(): void {
    this.app.use(cors(corsOptions));
    console.log("CORS Origins:", corsOptions.origin);
    this.app.use(express.json());
    this.app.use(rateLimiter);
    
    logger.info("Middleware initialized");
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({ status: "OK" });
    });

    // API routes with dependency injection
    this.app.use("/api", aadhaarRoutes(this.aadhaarController));
    
    logger.info("Routes initialized");
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
    logger.info("Error handling initialized");
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      logger.info(`Server started successfully`, {
        port: config.port,
        environment: config.isDevelopment ? 'development' : 'production',
        nodeVersion: process.version,
      });
    });
  }
}

// Create and start the application
const app = new App();
app.listen();

export default app;
