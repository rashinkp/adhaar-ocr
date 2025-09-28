import express from "express";
import cors from "cors";
import { DependencyContainer } from "./config/dependency.injection";
import { connectDB } from "./config/databaseConfig";
import { corsOptions, rateLimiter } from "./middleware/securityMiddleware";
import createAadhaarRoutes from "./routes/aadhaar.routes";
import { errorHandler } from "./middleware/errorMiddleware";
import config from "./config/env.config";
import { Routes } from "./constants/routes";

class App {
  public app: express.Application;
  private dependencyContainer: DependencyContainer;

  constructor() {
    this.app = express();
    this.dependencyContainer = DependencyContainer.getInstance();
    this.initializeDatabase();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await connectDB();
      this.dependencyContainer.getLogger().info("Database connection initialized");
    } catch (error) {
      this.dependencyContainer.getLogger().error("Database connection failed", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      process.exit(1);
    }
  }

  private initializeMiddleware(): void {
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(rateLimiter);
    this.dependencyContainer.getLogger().info("Middleware initialized");
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get(Routes.HEALTH, (req, res) => {
      res.json({ status: "OK" });
    });

    // API routes with dependency injection
    const aadhaarController = this.dependencyContainer.getAadhaarController();
    this.app.use("/", createAadhaarRoutes(aadhaarController));
    this.dependencyContainer.getLogger().info("Routes initialized");
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
    this.dependencyContainer.getLogger().info("Error handling initialized");
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      this.dependencyContainer.getLogger().info(`Server started successfully`, {
        port: config.port,
        environment: config.isDevelopment ? 'development' : 'production',
        nodeVersion: process.version,
      });
    });
  }
}

const app = new App();
app.listen();

export default app;
