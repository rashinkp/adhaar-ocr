import { Document } from "mongoose";
interface IAadhaar extends Document {
    aadhaarNumber: string;
    name: string;
    dob?: string;
    address: string;
    gender?: string;
    createdAt: Date;
}
declare const AadhaarModel: import("mongoose").Model<IAadhaar, {}, {}, {}, Document<unknown, {}, IAadhaar, {}, {}> & IAadhaar & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export { AadhaarModel };
export type { IAadhaar };
//# sourceMappingURL=Aadhaar.d.ts.map