import { onRequest } from 'firebase-functions/v2/https';
import { Request, Response } from 'express';
import { app } from './app';


export const apiV2 = onRequest(
    {
        region: 'us-central1'
    },
    async (req: Request , res: Response) => {
    const expressApp = await app;
    expressApp(req, res);
})