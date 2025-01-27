import { injectable } from "inversify";
import { IJson } from '../utility/firebaseType';

export interface IFieldErrorMessages {
    [name: string]: string[];
}

@injectable()
export class CustomError extends Error {
    public name: string;
    public readonly statusCode: number;
    public readonly payload?: IJson;
    public readonly code?: string;

    constructor(
        public message: string,
        statusCode: number = 500,
        payload?: IJson,
        code?: string,
        
    ) {
        super(message);
        this.name = 'CustomError'

        Object.defineProperty(this, 'name', {
            value: 'CustomError',
            enumerable: false,
            writable: false,
        });

        this.statusCode = statusCode;
        this.payload = payload;
        this.code = code;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError);
        }
    }

    static create(
        message: string,
        statusCode: number = 500,
        payload: IJson,
        code?: string
    ): CustomError {
        return new CustomError(message,statusCode,payload,code)
    }
}

