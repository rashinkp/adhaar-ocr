import type { 
  AadhaarDataDto, 
  AadhaarSearchDto, 
  ProcessOcrResult, 
  FindRecordResult, 
  GetAllRecordsResult, 
  DeleteRecordResult 
} from "../../dto/service.dto";

export interface IAadhaarService {
  processOcr(
    frontBuffer: Buffer,
    backBuffer: Buffer
  ): Promise<ProcessOcrResult>;
  findRecord(searchDto: AadhaarSearchDto): Promise<FindRecordResult>;
  getAllRecords(): Promise<GetAllRecordsResult>;
  deleteRecord(aadhaarNumber: string): Promise<DeleteRecordResult>;
}
