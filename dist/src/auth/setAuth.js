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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebaseAdmin = initializeFirebaseAdmin;
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
const customLogger_1 = require("../logging/customLogger");
const customError_1 = require("../errors/customError");
const authConfig_1 = require("../config/authConfig");
function initializeFirebaseAdmin(needAdminPrivileges) {
    const logger = new customLogger_1.CustomLogger();
    const config = authConfig_1.firebaseConfigManager.getConfig();
    let firebaseConfig = config?.firebaseConfig || process.env.FIREBASE_CONFIG;
    if (needAdminPrivileges && !config?.serviceAccountPath) {
        logger.error('GOOGLE_APPLICATION_CREDENTIALS not set for admin privileges', 'authenticationSetup');
        throw customError_1.CustomError.create('GOOGLE_APPLICATION_CREDENTIALS not set for admin privileges', 500, { environment: process.env.NODE_ENV });
    }
    if (typeof firebaseConfig === 'string') {
        try {
            firebaseConfig = JSON.parse(firebaseConfig);
        }
        catch (error) {
            logger.error('Failed to parse Firebase Configuration', 'authenticationSetup', { firebaseConfig,
                error
            });
            throw customError_1.CustomError.create('Invalid JSON in Firebase configuration', 400, { config: firebaseConfig,
                error: error
            });
        }
    }
    if (!firebaseConfig) {
        logger.error('Firebase configuration is missing', 'authenticationSetup');
        throw customError_1.CustomError.create('Firebase configuration is missing', 400, { environment: process.env.NODE_ENV });
    }
    if (admin.apps.length === 0) {
        logger.info('Initializing Firebase Admin', 'authenticationSetup');
        const credentials = config?.serviceAccountPath
            ? JSON.parse(fs.readFileSync(config.serviceAccountPath, 'utf-8'))
            : firebaseConfig;
        admin.initializeApp({
            credential: admin.credential.cert(credentials)
        });
    }
    return admin;
}
//# sourceMappingURL=setAuth.js.map