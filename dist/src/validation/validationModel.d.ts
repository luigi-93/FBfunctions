import { ValidatorOptions } from 'class-validator';
import { CustomLogger } from "../utility/loggerType";
export declare type ClassType<T> = {
    new (...args: any[]): T;
};
export declare class ModelManager {
    private logger;
    constructor(logger: CustomLogger);
    private _validateOptions;
    validate<T extends object>(model: T, options?: ValidatorOptions, groups?: string[]): Promise<void>;
    private _formatValidationErrors;
    toClass<T extends object>(cls: ClassType<T>, data: any | any[], toValidate?: boolean): Promise<T | T[]>;
    toPlain<T extends object>(model: T, toValidate?: boolean): Promise<any>;
}
