import { IFieldErrorMessages, CustomError } from "../errors/customError";
import { ValidationError as ClassValidatorError } from 'class-validator';
export declare class ValidationError extends CustomError {
    validationErrors: ClassValidatorError[];
    fieldErrors: IFieldErrorMessages;
    private unknownFieldName;
    constructor(validationErrors: ClassValidatorError[], message?: string);
    private populateFieldErrors;
    private parseValidationError;
    private getFieldErrorMessages;
}
