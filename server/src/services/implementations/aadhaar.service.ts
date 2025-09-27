import logger from "../../config/logger.config";
import type { AadhaarResponseDto, AadhaarSearchDto } from "../../dto/aadhaar.dto";
import { AadhaarMapper } from "../../mappers/aadhaar.mapper";
import type { IOcrProvider } from "../../providers/interfaces/ocr.provider.interface";
import type { IAadhaarRepository } from "../../repositories/interfaces/aadhaar.repository";
import { parseAadhaarText } from "../../utils/aadhaar.parser";
import type { IAadhaarService } from "../interfaces/aadhaar.service.interface";


export class AadhaarService implements IAadhaarService {
  constructor(
    private readonly aadhaarRepository: IAadhaarRepository,
    private readonly ocrProvider: IOcrProvider
  ) {}

  async processOcr(
    frontBuffer: Buffer,
    backBuffer: Buffer
  ): Promise<AadhaarResponseDto> {
    try {
      // Extract text from both images
      const [frontText, backText] =
        await this.ocrProvider.extractTextFromMultiple([
          frontBuffer,
          backBuffer,
        ]);

      // Parse Aadhaar data from extracted text
      const parsedData = parseAadhaarText(frontText || "", backText || "");

      logger.info("OCR processing completed", {
        hasParsedData: !!parsedData,
        aadhaarNumber: parsedData.aadhaarNumber,
      });

      // Validate required fields
      if (!parsedData.aadhaarNumber || !parsedData.name) {
        logger.warn("OCR parsing incomplete", {
          missingFields: {
            aadhaarNumber: !parsedData.aadhaarNumber,
            name: !parsedData.name,
            dob: !parsedData.dob,
            address: !parsedData.address,
          },
        });

        return {
          success: false,
          message: "Parsed data incomplete; cannot store",
          parsed: parsedData,
          ocrText: { frontText: frontText || "", backText: backText || "" },
        };
      }

      // Save to repository
      const savedRecord = await this.aadhaarRepository.save(parsedData);

      // Convert to DTO
      const aadhaarDto = AadhaarMapper.toDto(savedRecord);

      logger.info("Aadhaar record saved successfully", {
        aadhaarNumber: aadhaarDto.aadhaarNumber,
      });

      return {
        success: true,
        data: aadhaarDto,
        ocrText: { frontText: frontText || "", backText: backText || "" },
        parsed: parsedData,
      };
    } catch (error) {
      logger.error("OCR processing failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        success: false,
        message: "OCR processing failed",
      };
    }
  }

  async findRecord(searchDto: AadhaarSearchDto): Promise<AadhaarResponseDto> {
    try {
      const { aadhaarNumber, dob } = searchDto;

      if (!aadhaarNumber) {
        logger.warn("Search request missing aadhaarNumber");
        return {
          success: false,
          message: "aadhaarNumber is required",
        };
      }

      let record;

      if (dob) {
        // Format dob for search
        let searchDob = dob;
        if (searchDob.includes("/")) {
          try {
            const dobDate = new Date(searchDob.split("/").reverse().join("-"));
            searchDob = dobDate.toISOString().split("T")[0] || "";
          } catch (error) {
            // Keep original format if parsing fails
            console.warn("Date parsing failed for search:", dob);
          }
        }

        record = await this.aadhaarRepository.findByAadhaarNumberAndDob(
          aadhaarNumber,
          searchDob
        );
      } else {
        record =
          await this.aadhaarRepository.findByAadhaarNumber(aadhaarNumber);
      }

      if (!record) {
        logger.info("Aadhaar record not found", {
          aadhaarNumber,
          dob,
        });

        return {
          success: false,
          message: "Record not found",
        };
      }

      const aadhaarDto = AadhaarMapper.toDto(record);

      logger.info("Aadhaar record found successfully", {
        aadhaarNumber: aadhaarDto.aadhaarNumber,
      });

      return {
        success: true,
        data: aadhaarDto,
      };
    } catch (error) {
      logger.error("Error finding Aadhaar record", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        aadhaarNumber: searchDto.aadhaarNumber,
        dob: searchDto.dob,
      });

      return {
        success: false,
        message: "Error finding Aadhaar record",
      };
    }
  }

  async getAllRecords(): Promise<AadhaarResponseDto> {
    try {
      const records = await this.aadhaarRepository.findAll();
      const aadhaarDtos = AadhaarMapper.toDtoArray(records);

      return {
        success: true,
        data: aadhaarDtos as any, // Type assertion for array response
      };
    } catch (error) {
      logger.error("Error fetching all records", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        message: "Error fetching records",
      };
    }
  }

  async deleteRecord(aadhaarNumber: string): Promise<AadhaarResponseDto> {
    try {
      const deleted =
        await this.aadhaarRepository.deleteByAadhaarNumber(aadhaarNumber);

      if (!deleted) {
        return {
          success: false,
          message: "Record not found",
        };
      }

      logger.info("Aadhaar record deleted successfully", {
        aadhaarNumber,
      });

      return {
        success: true,
        message: "Record deleted successfully",
      };
    } catch (error) {
      logger.error("Error deleting Aadhaar record", {
        error: error instanceof Error ? error.message : "Unknown error",
        aadhaarNumber,
      });

      return {
        success: false,
        message: "Error deleting record",
      };
    }
  }
}
