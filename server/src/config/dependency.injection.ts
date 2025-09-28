
import { TesseractOcrProvider } from "../providers/implementations/tesseract-ocr.provider.js";
import { WinstonLoggerProvider } from "../providers/implementations/winston.logger.provider.js";
import { AadhaarService } from "../services/implementations/aadhaar.service.js";
import { AadhaarController } from "../controllers/aadhaar.controller.js";
import { AadhaarRepository } from "../repositories/implementations/aadhaar.repository.js";
import type { IAadhaarRepository } from "../repositories/interfaces/aadhaar.repository.js";
import type { IOcrProvider } from "../providers/interfaces/ocr.provider.interface.js";
import type { ILogger } from "../providers/interfaces/logger.provider.interface.js";
import type { IAadhaarService } from "../services/interfaces/aadhaar.service.interface.js";
import type { AadhaarController as AadhaarControllerType } from "../controllers/aadhaar.controller.js";

export class DependencyContainer {
  private static instance: DependencyContainer;
  private aadhaarRepository?: IAadhaarRepository;
  private ocrProvider?: IOcrProvider;
  private logger?: ILogger;
  private aadhaarService?: IAadhaarService;
  private aadhaarController?: AadhaarControllerType;

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  getAadhaarRepository(): IAadhaarRepository {
    if (!this.aadhaarRepository) {
      this.aadhaarRepository = new AadhaarRepository();
    }
    return this.aadhaarRepository;
  }

  getOcrProvider(): IOcrProvider {
    if (!this.ocrProvider) {
      this.ocrProvider = new TesseractOcrProvider("eng");
    }
    return this.ocrProvider;
  }

  getLogger(): ILogger {
    if (!this.logger) {
      this.logger = new WinstonLoggerProvider();
    }
    return this.logger;
  }

  getAadhaarService(): IAadhaarService {
    if (!this.aadhaarService) {
      this.aadhaarService = new AadhaarService(
        this.getAadhaarRepository(),
        this.getOcrProvider(),
        this.getLogger()
      );
    }
    return this.aadhaarService;
  }

  getAadhaarController(): AadhaarControllerType {
    if (!this.aadhaarController) {
      this.aadhaarController = new AadhaarController(
        this.getAadhaarService(),
        this.getLogger()
      );
    }
    return this.aadhaarController;
  }
}
