import { 
    IFieldErrorMessages, 
    CustomError } 
    from "../errors/CustomError";
import { ValidationError as ClassValidatorError } from 'class-validator';

export class ValidationError extends CustomError {
    public fieldErrors: IFieldErrorMessages = {};
    private unknownFieldName = 'unknow';

    constructor(
        public validationErrors: ClassValidatorError[],
        message: string = 'Validattion failed'
    ) {
        super(message, 400);
        this.name = 'ValidationError';
        this.populateFieldErrors();
    }

    private populateFieldErrors(): void {
        this.validationErrors.forEach(error => {
            this.parseValidationError(error)
        })
    }

    private parseValidationError(error: ClassValidatorError): void {
        const fieldName = error.property || this.unknownFieldName;
        const messages = this.getFieldErrorMessages(error);

        //se all'interno dell'oggetto fieldErrors non trova il campo field name, lo crea. Se c'è ci pusha il/i messaggio
        if (messages.length > 0) {
            if(!this.fieldErrors[fieldName]) {
                this.fieldErrors[fieldName] = [];
            }
            this.fieldErrors[fieldName].push(...messages)
        }

        if (error.children && error.children.length > 0) {
            error.children.forEach(childError => {
                this.parseValidationError(childError);
            });
        }
    }
    
    private getFieldErrorMessages(error: ClassValidatorError): string[] {
        const messages: string[] = [];
        if (error.constraints) {
            messages.push(...Object.values(error.constraints));
        }
        if(error.children && error.children.length > 0) {
            error.children.forEach(childError => {
                messages.push(...this.getFieldErrorMessages(childError))
            });
        }

        return messages;
    }

    

    
}