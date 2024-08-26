import { Errors } from "../types/errors.model";
import { HttpException } from "./root.exception";

export class UnprocessableEntity extends HttpException{
    constructor(error: any, message: string, errorType: Errors, errorCode: number){
        super(message, errorCode, errorType, 422, error)
    }
}