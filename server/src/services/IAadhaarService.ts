import type { AadhaarResponseDto, AadhaarSearchDto } from "../dto/AadhaarDto.js";

export interface IAadhaarService {
  processOcr(frontBuffer: Buffer, backBuffer: Buffer): Promise<AadhaarResponseDto>;
  findRecord(searchDto: AadhaarSearchDto): Promise<AadhaarResponseDto>;
  getAllRecords(): Promise<AadhaarResponseDto>;
  deleteRecord(aadhaarNumber: string): Promise<AadhaarResponseDto>;
}
