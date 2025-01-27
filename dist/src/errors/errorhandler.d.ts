import { NextFunction, Request, Response } from "express";
import { CustomError } from "./customError";
export declare const errorHandler: (err: CustomError | Error, req: Request, res: Response, next: NextFunction) => void;
