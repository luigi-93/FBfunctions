import { Controller } from "tsoa";
export declare class MockController extends Controller {
    getMockData(): Promise<{
        status: string;
    }>;
    getSecuredJwt(): Promise<{
        status: string;
    }>;
    getSecurityApiKeyData(): Promise<{
        status: string;
    }>;
}
