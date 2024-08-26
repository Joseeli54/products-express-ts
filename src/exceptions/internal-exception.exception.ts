import { Errors } from "../types/errors.model";
import { HttpException } from "./root.exception";

export class InternalException extends HttpException{
    constructor(message: string, errors: any, errorCode: number, errorType: Errors){
        super(message, errorCode, errorType, 500, errors)
    }
}