import express from 'express';
export declare function getFirstValidationMessage(fieldErrors: object | null | undefined, fieldNameToLookfor: string): string | undefined;
export declare function setErrorHandler(originalError: Error, res: express.Response, generalErrorHandler: (err: Error, _res: express.Response) => void): void;
