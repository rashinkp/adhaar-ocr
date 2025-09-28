import type { Request, Response } from "express";
import { ResponseHelper } from "../utils/response.helper";
import { ErrorCodes, HttpStatus, ResponseMessages } from "../constants";

export const errorHandler = function (
  err: Error,
  req: Request,
  res: Response,
) {
  console.error(err.stack);

  const { response } = ResponseHelper.error(
    ResponseMessages.INTERNAL_ERROR,
    ErrorCodes.INTERNAL_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR
  );

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
};
