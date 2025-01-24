import { NextFunction, Request, Response } from "express";
import { CustomError } from "./CustomError";


export const errorHandler = (
    err: CustomError | Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err instanceof CustomError ? err.statusCode : 500;
    const errorMessage = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        message: errorMessage,
        ...(err instanceof CustomError && { payload: err.payload }),
    });

    next(err);
}