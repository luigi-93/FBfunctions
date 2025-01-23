/**
 * In order to test the library I create a simple controller
 */

import { Controller, Get, Route, Security } from "tsoa";
import { provideSingleton, SecurityScopes } from "../../utility/firebaseType";


@provideSingleton(MockController)
@Route("mock")
export class MockController extends Controller {
    /**
     * Eventually public endpoint (not need)
     */
    @Get("/")
    public async getMockData(): Promise<{ status: string }> {
        return { status: "public ok"};
    }


    /**
     * JWT authentication test
     */
    @Get("/secured/jwt")
    @Security("jwt", [SecurityScopes.Admin])
    public async getSecuredJwt(): Promise<{ status: string }> {
        return { status: "jwt secured ok"};
    }

    /**
     * API key authentication test
     */
    @Get("/security/api-key")
    @Security("apiKey")
    public async getSecurityApiKeyData(): Promise <{ status: string }> {
        return { status: "api key secured ok"}
    }
}


