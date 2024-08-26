 //message, status code, error codes, error

import { Errors } from "../types/errors.model";

 export class HttpException extends Error {
    message: string;
    errorCode: any;
    statusCode: number;
    errorType?: string;
    errors: ErrorCode;

    constructor(message:string, errorCode:ErrorCode, errorType: Errors, statusCode:number, error:any){
        super(message)

        this.message = message
        this.errorCode = errorCode
        this.statusCode = statusCode
        this.errors = error
        this.errorType = errorType
    }
 }

 export enum ErrorCode {
    USER_NOT_FOUND = 404,
    USER_ALREADY_EXISTS = 422,
    INCORRECT_PASSWORD = 401,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_EXCEPTION = 500,
    UNAUTHORIZED = 401,
    PRODUCT_ARRAY_EMPTY = 410,
    CONFLICT = 422,
    INVALID = 422
}