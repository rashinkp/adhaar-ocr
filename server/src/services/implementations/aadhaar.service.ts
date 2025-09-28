import { AadhaarMapper } from "../../mappers/aadhaar.mapper";
import type { ILogger } from "../../providers/interfaces/logger.provider.interface";
import type { IOcrProvider } from "../../providers/interfaces/ocr.provider.interface";
import type { IAadhaarRepository } from "../../repositories/interfaces/aadhaar.repository";
import { parseAadhaarText } from "../../utils/aadhaar.parser";
import type { 
  AadhaarDataDto, 
  AadhaarProcessDto, 
  AadhaarSearchDto, 
  ProcessOcrResult, 
  FindRecordResult, 
  GetAllRecordsResult, 
  DeleteRecordResult 
} from "../../dto/service.dto";
import type { IAadhaarService } from "../interfaces/aadhaar.service.interface";


export class AadhaarService implements IAadhaarService {
  constructor(
    private readonly _aadhaarRepository: IAadhaarRepository,
    private readonly _ocrProvider: IOcrProvider,
    private readonly _logger: ILogger
  ) {}

  async processOcr(
    frontBuffer: Buffer,
    backBuffer: Buffer
  ): Promise<ProcessOcrResult> {
    try {
      // Extract text from both images
      const [frontText, backText] =
        await this._ocrProvider.extractTextFromMultiple([
          frontBuffer,
          backBuffer,
        ]);

      // Parse Aadhaar data from extracted text
      const parsedData = parseAadhaarText(frontText || "", backText || "");

      this._logger.info("OCR processing completed", {
        hasParsedData: !!parsedData,
        aadhaarNumber: parsedData.aadhaarNumber,
      });

      // Validate required fields
      if (!parsedData.aadhaarNumber || !parsedData.name) {
        this._logger.warn("OCR parsing incomplete", {
          missingFields: {
            aadhaarNumber: !parsedData.aadhaarNumber,
            name: !parsedData.name,
            dob: !parsedData.dob,
            address: !parsedData.address,
          },
        });

        return {
          success: false,
          error: {
            type: 'INCOMPLETE_DATA',
            message: 'Parsed data incomplete; cannot store',
            details: { parsedData, ocrText: { frontText: frontText || "", backText: backText || "" } }
          }
        };
      }

      // Save to repository
      const savedRecord = await this._aadhaarRepository.save(parsedData);

      // Convert to DTO
      const aadhaarDto = AadhaarMapper.toDto(savedRecord);

      this._logger.info("Aadhaar record saved successfully", {
        aadhaarNumber: aadhaarDto.aadhaarNumber,
      });

      return {
        success: true,
        data: {
          data: aadhaarDto,
          ocrText: { frontText: frontText || "", backText: backText || "" },
          parsed: parsedData,
        }
      };
    } catch (error) {
      this._logger.error("OCR processing failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        success: false,
        error: {
          type: 'OCR_ERROR',
          message: 'OCR processing failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async findRecord(searchDto: AadhaarSearchDto): Promise<FindRecordResult> {
    try {
      const { aadhaarNumber, dob } = searchDto;

      if (!aadhaarNumber) {
        this._logger.warn("Search request missing aadhaarNumber");
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Aadhaar number is required',
          }
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

        record = await this._aadhaarRepository.findByAadhaarNumberAndDob(
          aadhaarNumber,
          searchDob
        );
      } else {
        record =
          await this._aadhaarRepository.findByAadhaarNumber(aadhaarNumber);
      }

      if (!record) {
        this._logger.info("Aadhaar record not found", {
          aadhaarNumber,
          dob,
        });

        return {
          success: false,
          error: {
            type: 'NOT_FOUND',
            message: 'Record not found',
          }
        };
      }

      const aadhaarDto = AadhaarMapper.toDto(record);

      this._logger.info("Aadhaar record found successfully", {
        aadhaarNumber: aadhaarDto.aadhaarNumber,
      });

      return {
        success: true,
        data: aadhaarDto
      };
    } catch (error) {
      this._logger.error("Error finding Aadhaar record", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        aadhaarNumber: searchDto.aadhaarNumber,
        dob: searchDto.dob,
      });

      return {
        success: false,
        error: {
          type: 'DATABASE_ERROR',
          message: 'Error finding Aadhaar record',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async getAllRecords(): Promise<GetAllRecordsResult> {
    try {
      const records = await this._aadhaarRepository.findAll();
      const aadhaarDtos = AadhaarMapper.toDtoArray(records);

      return {
        success: true,
        data: aadhaarDtos
      };
    } catch (error) {
      this._logger.error("Error fetching all records", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: {
          type: 'DATABASE_ERROR',
          message: 'Error fetching records',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async deleteRecord(aadhaarNumber: string): Promise<DeleteRecordResult> {
    try {
      const deleted =
        await this._aadhaarRepository.deleteByAadhaarNumber(aadhaarNumber);

      if (!deleted) {
        return {
          success: false,
          error: {
            type: 'NOT_FOUND',
            message: 'Record not found',
          }
        };
      }

      this._logger.info("Aadhaar record deleted successfully", {
        aadhaarNumber,
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      this._logger.error("Error deleting Aadhaar record", {
        error: error instanceof Error ? error.message : "Unknown error",
        aadhaarNumber,
      });

      return {
        success: false,
        error: {
          type: 'DATABASE_ERROR',
          message: 'Error deleting record',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}
