import { Errors } from "../types/errors.model";
import { HttpException } from "./root.exception";

export class UnauthorizedException extends HttpException{
    constructor(message: string, errorCode: number, errorType: Errors, errors?: any,){
        super(message, errorCode, errorType, 401, errors)
    }
}