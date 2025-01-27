"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const customError_1 = require("./customError");
const errorHandler = (err, req, res, next) => {
    const statusCode = err instanceof customError_1.CustomError ? err.statusCode : 500;
    const errorMessage = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        status: 'error',
        message: errorMessage,
        ...(err instanceof customError_1.CustomError && { payload: err.payload }),
    });
    next(err);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorhandler.js.map