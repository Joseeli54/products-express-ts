import { Errors } from "../types/errors.model";
import { ErrorCode, HttpException } from "./root.exception";

export class BadRequestsException extends HttpException{
    constructor(message: string, errorCode:ErrorCode, errorType: Errors){
        super(message, errorCode, errorType, 400, null);
    }
}