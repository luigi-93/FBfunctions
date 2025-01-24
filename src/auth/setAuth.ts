import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { FirebaseConfig } from '../utility/firebaseType';
import { CustomLogger } from '../logging/CustomLogger';
import { CustomError } from '../errors/CustomError';
import { firebaseConfigManager } from '../config/authConfig';


export function initializeFirebaseAdmin(needAdminPrivileges: boolean): typeof admin {
  const logger = new CustomLogger();
  const config = firebaseConfigManager.getConfig()
  
  let firebaseConfig: string | FirebaseConfig | undefined = 
  config?.firebaseConfig || process.env.FIREBASE_CONFIG;

  if (needAdminPrivileges && !config?.serviceAccountPath) {
    logger.error(
      'GOOGLE_APPLICATION_CREDENTIALS not set for admin privileges',
      'authenticationSetup');
    throw CustomError.create(
      'GOOGLE_APPLICATION_CREDENTIALS not set for admin privileges',
      500,
      { environment: process.env.NODE_ENV});
  }


  if (typeof firebaseConfig === 'string') {
    try {
      firebaseConfig = JSON.parse(firebaseConfig);
    } catch (error) {
      logger.error(
        'Failed to parse Firebase Configuration',
        'authenticationSetup',
        { firebaseConfig,
          error
         });
      throw CustomError.create(
        'Invalid JSON in Firebase configuration',
        400,
        { config: firebaseConfig,
          error: error
         });
    }
  }

  // Validate configuration
  if (!firebaseConfig) {
    logger.error(
      'Firebase configuration is missing',
      'authenticationSetup');
      throw CustomError.create(
        'Firebase configuration is missing',
        400,
        { environment: process.env.NODE_ENV});
  }



  // Initialize Firebase Admin only if no app is currently initialized
  if (admin.apps.length === 0) {
    logger.info(
      'Initializing Firebase Admin',
      'authenticationSetup');

      const credentials = config?.serviceAccountPath
        ? JSON.parse(fs.readFileSync(config.serviceAccountPath, 'utf-8'))
        : firebaseConfig;

      admin.initializeApp({
        credential: admin.credential.cert(credentials)
      })
      
  }

  return admin;
}

