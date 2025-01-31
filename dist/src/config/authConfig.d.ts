import { ServiceConfig, ValidationResult, FirebaseConfig } from '../utility/utilityKeys';
export declare class FirebaseConfigurationManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): FirebaseConfigurationManager;
    setConfig(firebaseConfig: FirebaseConfig, serviceAccountPath?: string): void;
    getConfig(): ServiceConfig | null;
    validateConfig(config: Partial<FirebaseConfig>): ValidationResult;
    sanitizeConfig(config: Partial<FirebaseConfig>): FirebaseConfig | null;
}
export declare const firebaseConfigManager: FirebaseConfigurationManager;
