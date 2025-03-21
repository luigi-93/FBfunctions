import { initializeFirebaseAdmin } from "../auth/setAuth";
import { error } from "console";
import * as dotenv from 'dotenv';

dotenv.config(); 
console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const firebaseAdmin = initializeFirebaseAdmin(true);

const uid = 'some-uid';
const additionalClaims = {
    scope: ['admin'],
};


firebaseAdmin.auth().createCustomToken(uid, additionalClaims)
    .then((customToken) => {
        console.log('Custom token created:', customToken)
    })
    .catch((error) => {
        console.error('Error createing custom token: ', error)
    })