import { provideSingleton } from "../../utility/firebaseType";
//import { injectable } from "inversify";
import { Controller, Get, Route } from "tsoa";


@provideSingleton(RootController)
@Route("/")
export class RootController extends Controller {

    @Get("/")
    public async getRoot(): Promise<{ message: string }> {
        return { message: "Hello, World!" };
    }
}