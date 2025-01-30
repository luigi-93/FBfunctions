import { Express } from 'express';
export interface IServerInitializer {
    initilize(app: Express, port: number, cleanup: () => Promise<void>): Promise<void>;
}
