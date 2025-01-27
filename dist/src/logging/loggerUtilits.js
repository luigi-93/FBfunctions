"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeMetadata = sanitizeMetadata;
exports.getTracesSampleRate = getTracesSampleRate;
function sanitizeMetadata(meta) {
    const seen = new WeakSet();
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null)
            return obj;
        if (seen.has(obj))
            return '[Circular]';
        seen.add(obj);
        const result = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            result[key] = sanitize(obj[key]);
        }
        return result;
    };
    return sanitize(meta);
}
function getTracesSampleRate() {
    const environment = process.env.NODE_ENV;
    const sampleRates = {
        development: 1.0,
        production: 0.1,
        test: 0.0
    };
    return sampleRates[environment] || 0.5;
}
//# sourceMappingURL=loggerUtilits.js.map