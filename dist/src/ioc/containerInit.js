"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeContainer = initializeContainer;
const customLogger_1 = require("../logging/customLogger");
const index_1 = require("./index");
const customError_1 = require("../errors/customError");
async function initializeContainer() {
    const tempLogger = new customLogger_1.CustomLogger({ logLevel: 'debug' });
    try {
        tempLogger.debug('Initializing container', 'IoC-Init', {
            containerExists: !!index_1.container,
            containerType: typeof index_1.container
        });
        const initializedContainer = await (0, index_1.setupIoC)(index_1.container);
        if (!initializedContainer) {
            throw customError_1.CustomError.create('setupIoc returned undefined or null container', 500, {
                error: 'Container initialization failed'
            });
        }
        return initializedContainer;
    }
    catch (setupError) {
        tempLogger.error('Container initialization failed', 'IoC-Init', {
            error: setupError instanceof Error
                ? {
                    name: setupError.name,
                    message: setupError.message,
                    stack: setupError.stack
                }
                : 'Uknown error'
        });
        throw customError_1.CustomError.create('InintilizeContainer does not return', 401, {
            error: setupError,
            phase: 'Container initilization'
        });
    }
}
//# sourceMappingURL=containerInit.js.map