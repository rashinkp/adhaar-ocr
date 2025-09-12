import type { Request, Response } from "express"


export const processOcr = async (req : Request, res:Response) => {
      try {
        console.log("Processing Aadhaar images");

        const extractedData = {
          aadhaarNumber: "1234-5678-9012",
          name: "John Doe",
          dob: "1990-01-01",
          address: "123, Example Street, City",
        };

        res.status(200).json({ success: true, data: extractedData });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ success: false, message: "OCR processing failed" });
      }
}


export const findRecord = async(req: Request, res: Response) => {
  try {
    const { aadhaarNumber, dob } = req.query;

    if (!aadhaarNumber || !dob) {
      res
        .status(400)
        .json({
          success: false,
          message: "aadhaarNumber and dob are required",
        });
      return;
    }

    const dummyRecord = {
      aadhaarNumber,
      name: "Jane Doe",
      dob,
      address: "456 Another Street, City",
    };

    res.status(200).json({ success: true, data: dummyRecord });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error finding Aadhaar record" });
  }
};