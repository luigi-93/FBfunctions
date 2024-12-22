"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebaseAdmin = initializeFirebaseAdmin;
const admin = __importStar(require("firebase-admin"));
const loggerType_1 = require("../utility/loggerType");
const errorType_1 = require("../utility/errorType");
const authConfig_1 = require("../config/authConfig");
function initializeFirebaseAdmin(needAdminPrivileges) {
    const logger = new loggerType_1.CustomLogger();
    const config = authConfig_1.firebaseConfigManager.getConfig();
    let firebaseConfig = config?.firebaseConfig || process.env.FIREBASE_CONFIG;
    if (needAdminPrivileges && !config?.serviceAccountPath) {
        logger.error('GOOGLE_APPLICATION_CREDENTIALS not set for admin privileges', 'authenticationSetup');
        throw errorType_1.CustomError.create('GOOGLE_APPLICATION_CREDENTIALS not set for admin privileges', 500, { environment: process.env.NODE_ENV });
    }
    if (typeof firebaseConfig === 'string') {
        try {
            firebaseConfig = JSON.parse(firebaseConfig);
        }
        catch (error) {
            logger.error('Failed to parse Firebase Configuration', 'authenticationSetup', { firebaseConfig });
            throw errorType_1.CustomError.create('Invalid JSON in Firebase configuration', 400, { config: firebaseConfig });
        }
    }
    if (!firebaseConfig) {
        logger.error('Firebase configuration is missing', 'authenticationSetup');
        throw errorType_1.CustomError.create('Firebase configuration is missing', 400, { environment: process.env.NODE_ENV });
    }
    if (admin.apps.length === 0) {
        logger.info('Initializing Firebase Admin', 'authenticationSetup');
        admin.initializeApp({
            credential: admin.credential.cert(config?.serviceAccountPath
                ? require(config.serviceAccountPath)
                : firebaseConfig),
        });
    }
    return admin;
}
//# sourceMappingURL=setAuth.js.map