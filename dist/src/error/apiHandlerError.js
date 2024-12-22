"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstValidationMessage = getFirstValidationMessage;
exports.setErrorHandler = setErrorHandler;
const lodash_1 = require("lodash");
const tsoa_1 = require("tsoa");
const errorType_1 = require("../utility/errorType");
const validationError_1 = require("../validation/validationError");
function deepFind(obj, key) {
    if (key in obj) {
        return [obj];
    }
    return (0, lodash_1.flatten)(Object.values(obj).map(v => typeof v === "object" && v !== null ? deepFind(v, key) : []));
}
function getFirstValidationMessage(fieldErrors, fieldNameToLookfor) {
    const obj = deepFind(fieldErrors || {}, fieldNameToLookfor);
    if (obj.length > 0 && obj[0]?.[fieldNameToLookfor]) {
        const objConstr = obj[0]?.[fieldNameToLookfor];
        if (typeof objConstr === "string") {
            return objConstr;
        }
        const keys = Object.keys(objConstr);
        return objConstr[keys[0]];
    }
    return undefined;
}
function setErrorHandler(originalError, res, generalErrorHandler) {
    let errorToThrow = originalError;
    if (originalError instanceof tsoa_1.ValidateError) {
        errorToThrow = new errorType_1.CustomError(originalError.message || "Validation failer", 400, { fieldError: originalError.fields });
    }
    else if (originalError instanceof validationError_1.ValidationError) {
        errorToThrow = new errorType_1.CustomError(originalError.message || "Validation Failed", 400, { fieldErrors: originalError.fieldErrors });
    }
    try {
        if ((originalError instanceof tsoa_1.ValidateError || originalError instanceof validationError_1.ValidationError) &&
            errorToThrow instanceof errorType_1.CustomError &&
            errorToThrow.payload?.fieldErrors) {
            const extraMessage = getFirstValidationMessage(errorToThrow.payload.fieldErrors, "constraints") ||
                getFirstValidationMessage(errorToThrow.payload.fieldErrors, "message");
            if (extraMessage) {
                errorToThrow.message += `, ${extraMessage}`;
            }
        }
    }
    catch (err) {
        console.error('Error while processong validation details:', err);
    }
    console.warn("http error", errorToThrow);
    generalErrorHandler(errorToThrow, res);
}
//# sourceMappingURL=apiHandlerError.js.map