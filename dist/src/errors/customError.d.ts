import { IJson } from '../utility/firebaseType';
export interface IFieldErrorMessages {
    [name: string]: string[];
}
export declare class CustomError extends Error {
    message: string;
    name: string;
    readonly statusCode: number;
    readonly payload?: IJson;
    readonly code?: string;
    constructor(message: string, statusCode?: number, payload?: IJson, code?: string);
    static create(message: string, statusCode: number | undefined, payload: IJson, code?: string): CustomError;
}
