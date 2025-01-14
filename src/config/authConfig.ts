/**
 * Purpose: It lets the user of your library set Firebase credentials programmatically instead of relying on environment variables.

firebaseConfig: This can be passed directly as an object containing client-side Firebase configurations (apiKey, authDomain, etc.).

serviceAccountPath: Optionally, for server-side usage, this allows the user to provide the path to their Firebase service account key.

If the serviceAccountPath is provided, it overrides the environment variable GOOGLE_APPLICATION_CREDENTIALS.
This allows flexibility based on whether the code is run on a server (backend) or client (frontend).
 */


import { CustomError } from "../utility/errorType";
import { ServiceConfig, ValidationResult, FirebaseConfig } from '../utility/firebaseType';



export class FirebaseConfigurationManager {
    private static instance: FirebaseConfigurationManager;
    private config: ServiceConfig | null = null;

    private constructor() {}

    static getInstance(): FirebaseConfigurationManager {
        if(!this.instance) {
            this.instance = new FirebaseConfigurationManager()
        }
        return this.instance;
    }

    /**
     * Set the Firebase configuration programmatically
     * @param firebaseConfig - Firebase client config(apiKey, authDomain, etc.)
     * @param serviceAccountPath - Optional. Path to the service account JSON file(for server-side)
     */
    setConfig(firebaseConfig: FirebaseConfig, serviceAccountPath?: string): void {
        const validationResult = this.validateConfig(firebaseConfig);

        if (!validationResult.isValid) {
            throw CustomError.create(
                `Invalid Firebase configuration. Missing fields: ${validationResult.missingFields.join(', ')}`,
                400,
                { missingFields: validationResult.missingFields }
            )}

        this.config = {
            firebaseConfig,
            serviceAccountPath
        }
    }

    /**
     * Retrive the current Firebase configuaration
     * @returns Current ServiceConfig or null
     */
    getConfig(): ServiceConfig | null {
        return this.config;
    }


    /**
     * Validate Firebase Configuration
     * @param config - Pratial Firebase configuration to validate
     * @returns Validation result
     */
    validateConfig(config: Partial<FirebaseConfig>): ValidationResult {
        const requiredFields = ['apiKey', 'authDomain','projectId','appId'] as const;
        const missingFields = requiredFields.filter(field => 
            config[field] === undefined || config[field]?.trim() === ''
        );

        return {
            isValid: missingFields.length === 0,
            missingFields,
            config: missingFields.length === 0
                ? config as FirebaseConfig
                : null
        }

    
    }

    /**
     * Sanitize and prepare configuration
     * @param config - Partial Firease configuration
     * @returns Sanitized FirebaseConfig or null
     */
    sanitizeConfig(config: Partial<FirebaseConfig>): FirebaseConfig | null {
        const validationResult = this.validateConfig(config);
        return validationResult.isValid
            ? validationResult.config
            : null;
    }

}

export const firebaseConfigManager = FirebaseConfigurationManager.getInstance();
