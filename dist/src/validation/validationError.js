"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const errorType_1 = require("../utility/errorType");
class ValidationError extends errorType_1.CustomError {
    constructor(validationErrors, message = 'Validattion failed') {
        super(message, 400);
        this.validationErrors = validationErrors;
        this.fieldErrors = {};
        this.unknownFieldName = 'unknow';
        this.name = 'ValidationError';
        this.populateFieldErrors();
    }
    populateFieldErrors() {
        this.validationErrors.forEach(error => {
            this.parseValidationError(error);
        });
    }
    parseValidationError(error) {
        const fieldName = error.property || this.unknownFieldName;
        const messages = this.getFieldErrorMessages(error);
        if (messages.length > 0) {
            if (!this.fieldErrors[fieldName]) {
                this.fieldErrors[fieldName] = [];
            }
            this.fieldErrors[fieldName].push(...messages);
        }
        if (error.children && error.children.length > 0) {
            error.children.forEach(childError => {
                this.parseValidationError(childError);
            });
        }
    }
    getFieldErrorMessages(error) {
        const messages = [];
        if (error.constraints) {
            messages.push(...Object.values(error.constraints));
        }
        if (error.children && error.children.length > 0) {
            error.children.forEach(childError => {
                messages.push(...this.getFieldErrorMessages(childError));
            });
        }
        return messages;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=validationError.js.map