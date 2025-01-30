import { Container } from "inversify";
import { Express } from 'express';
export interface IApp {
    container: Container;
    expressApp: Express;
}
