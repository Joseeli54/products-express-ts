import { Request, Response, NextFunction } from "express"
import { ErrorCode, HttpException } from "./exceptions/root.exception"
import { InternalException } from "./exceptions/internal-exception.exception"
import { NotFoundException } from "./exceptions/not-found.exception"
import { UnprocessableEntity } from "./exceptions/validation.exception"
import { Errors } from "./types/errors.model"

export const errorHandler = (method: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
            await method(req, res, next)
        } catch(error: any){
            let exception: HttpException;

            if(error instanceof NotFoundException){
                exception = error;
            }

            if(error instanceof UnprocessableEntity){
                exception = error;
            }
            
            if(error instanceof HttpException){
                exception = error;
            }else{
                exception = new InternalException('Somethings went wrong!', error, ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
            }
            
            next(exception)
        }
    }
}