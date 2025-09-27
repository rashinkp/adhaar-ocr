import type { AadhaarDto } from "../dto/aadhaar.dto";
import type { IAadhaar } from "../models/aadhaar.model";


export class AadhaarMapper {
  static toDto(schema: IAadhaar): AadhaarDto {
    const dto: AadhaarDto = {
      id: schema._id?.toString() || "",
      aadhaarNumber: schema.aadhaarNumber,
      name: schema.name,
    };

    if (schema.dob !== undefined) {
      dto.dob = schema.dob;
    }
    if (schema.address !== undefined) {
      dto.address = schema.address;
    }
    if (schema.gender !== undefined) {
      dto.gender = schema.gender as "Male" | "Female" | "Other";
    }
    if (schema.createdAt !== undefined) {
      dto.createdAt = schema.createdAt;
    }

    return dto;
  }

  static toDtoArray(schemas: IAadhaar[]): AadhaarDto[] {
    return schemas.map(schema => this.toDto(schema));
  }

  static toSchema(dto: Partial<AadhaarDto>): Partial<IAadhaar> {
    const schema: Partial<IAadhaar> = {};
    
    if (dto.aadhaarNumber !== undefined) {
      schema.aadhaarNumber = dto.aadhaarNumber;
    }
    if (dto.name !== undefined) {
      schema.name = dto.name;
    }
    if (dto.dob !== undefined) {
      schema.dob = dto.dob;
    }
    if (dto.address !== undefined) {
      schema.address = dto.address;
    }
    if (dto.gender !== undefined) {
      schema.gender = dto.gender;
    }
    
    return schema;
  }
}
