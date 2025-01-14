import { 
    validate, 
    ValidatorOptions, 
    ValidationError as ClassValidatorError } from 'class-validator';
import { CustomLogger } from "../utility/loggerType";
import { plainToClass } from 'class-transformer';
import { CustomError } from "../utility/errorType";
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '../utility/firebaseType';


export declare type ClassType<T> = {
    new (...args: any[]): T;
};

@injectable()
export class ModelManager {
    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) private logger: CustomLogger
    ) {}

    private _validateOptions(customOptions?: Partial<ValidatorOptions>): ValidatorOptions {
        return {
            validationError: {
                target: false,
                value: false
            },
            stopAtFirstError: false,
            ...customOptions,
        };
    }

    async validate<T extends object>(model: T, options?: ValidatorOptions, groups?: string[]): Promise<void> {
        const validationOptions = { ...this._validateOptions(), ...options, groups };
        const errors = await validate(model as object, validationOptions);

        if (errors.length > 0) {
            const formattedErrors = this._formatValidationErrors(errors);
            this.logger.error('Model validation failed', 'ModelManager', { model, formattedErrors });
            throw new CustomError('Validation failed', 400, { fieldErrors: formattedErrors});
        }
    }

    private _formatValidationErrors(errors: ClassValidatorError[]): Record<string, string[]> {
        const formattedErrors: Record<string, string[]> = {};
        errors.forEach(error => {
            const property = error.property;
            if(!formattedErrors[property]) {
                formattedErrors[property] = [];
            }
            if (error.constraints) {
                formattedErrors[property].push(...Object.values(error.constraints));
            }
        });
        return formattedErrors;
    }

    async toClass<T extends object>(cls: ClassType<T>, data: any | any[], toValidate = true): Promise<T | T[]> {

        if (data === null) {
            throw new CustomError('Invalid or empty data privided', 400)
        }

        const isArray = Array.isArray(data);
        const normalizedData = isArray 
        ? data.filter(item => item != null && typeof item === 'object')
        : data;

        if ((isArray && normalizedData.length === 0) || (!isArray && Object.keys(normalizedData).length === 0)) {
            throw new CustomError(isArray 
                ? 'Array is empty'
                : 'Object is empty', 400);
        }

        const instances = plainToClass(cls, data, {
            enableImplicitConversion: true
        });

        if(toValidate) {
            const validationMethod = isArray
                ? Promise.all((instances as T[]).map(instance => this.validate(instance)))
                : this.validate(instances as T);
            await validationMethod;        
        }

        return instances;
    }

    async toPlain<T extends object>(model: T, toValidate = true): Promise<any> {
        if(toValidate) {
            await this.validate(model);
        }

        return JSON.parse(JSON.stringify(model));
    }
 }