import { onRequest } from 'firebase-functions/v2/https';
import { Request, Response, Express  } from 'express';
import { app } from './app';

let expressApp: Express | null = null;

async function getApp() {
    if(!expressApp) {
        expressApp = await app()
    }
    return expressApp;
}


export const apiV2 = onRequest(
     {
         region: 'us-central1'
     },
     async (req: Request , res: Response) => {
     const app = await getApp();
     app(req, res);
 })