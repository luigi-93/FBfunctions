import { IJson } from "../utility/firebaseType";
import { flatten } from 'lodash'
import express from 'express';
import { ValidateError } from "tsoa";
import { CustomError } from "./CustomError";
import { ValidationError } from "../validation/validationError";


function deepFind(obj: IJson, key: string): IJson[] {
    if (key in obj) {
        return [obj]
    }

    return flatten(
        Object.values(obj).map(v =>
            typeof v === "object" && v !== null ? deepFind(v, key) : []
        )
    );
}

//Attempt to extract as much as possible detailed error informations
export function getFirstValidationMessage(
    fieldErrors: object | null | undefined,
    fieldNameToLookfor: string
): string | undefined {
    const obj = deepFind(fieldErrors || {}, fieldNameToLookfor);

    if(obj.length > 0 && obj[0]?.[fieldNameToLookfor]) {
        const objConstr = obj[0]?.[fieldNameToLookfor];

        if (typeof objConstr === "string") {
            return objConstr;
        }
        const keys = Object.keys(objConstr);
        return objConstr[keys[0]]
    }

    return undefined;
}


export function setErrorHandler(
    originalError: Error,
    res: express.Response,
    generalErrorHandler: (err: Error, _res: express.Response) => void): void {
        let errorToThrow: Error = originalError;

        //handle different types of validation errors
        if (originalError instanceof ValidateError) {
            errorToThrow = new CustomError(
                originalError.message || "Validation failer",
                400,
                { fieldError: originalError.fields }
            );
        } else if (originalError instanceof ValidationError) {
            errorToThrow = new CustomError(
                originalError.message || "Validation Failed",
                400,
                { fieldErrors: originalError.fieldErrors}
            );
        }


        try {
            if (
                (originalError instanceof ValidateError || originalError instanceof ValidationError) &&
                errorToThrow instanceof CustomError &&
                errorToThrow.payload?.fieldErrors
            ) {
                const extraMessage = 
                getFirstValidationMessage(errorToThrow.payload.fieldErrors, "constraints") ||
                getFirstValidationMessage(errorToThrow.payload.fieldErrors, "message");

                if(extraMessage) {
                    errorToThrow.message += `, ${extraMessage}`;
                }
            }
        } catch (err) {
            console.error('Error while processong validation details:', err);
        }

        console.warn("http error", errorToThrow);
        generalErrorHandler(errorToThrow, res);
    }


