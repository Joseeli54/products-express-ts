import { Errors } from "../types/errors.model";
import { ErrorCode, HttpException } from "./root.exception";

export class NotFoundException extends HttpException{
    constructor(message: string, errorCode: ErrorCode, errorType: Errors,  error: any = null){
        super(message, errorCode, errorType, 404, error);
    }
}