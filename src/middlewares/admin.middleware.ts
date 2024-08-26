import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";
import { ErrorCode } from "../exceptions/root.exception";
import { Errors } from "../types/errors.model";

const adminMiddleware = async(req: any, res:Response, next:NextFunction) => {
    const user = req.user

    if(user.role == "ADMIN"){
        next()
    }else{
        next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED, Errors.UNAUTHORIZED))
    }
}

export default adminMiddleware