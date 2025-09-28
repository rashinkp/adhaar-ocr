import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/http.status";
import { ResponseMessages } from "../constants/response.messages";
import { ErrorCodes } from "../constants/error.codes";
import { ResponseHelper } from "../utils/response.helper";

export const errorHandler = function (err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  const { response } = ResponseHelper.error(
    ResponseMessages.INTERNAL_ERROR,
    ErrorCodes.INTERNAL_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR
  );
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
}