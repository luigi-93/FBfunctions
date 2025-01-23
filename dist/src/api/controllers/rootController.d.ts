import { Controller } from "tsoa";
export declare class RootController extends Controller {
    getRoot(): Promise<{
        message: string;
    }>;
}
