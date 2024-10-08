import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";
import { ErrorCode } from "../exceptions/root.exception";
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../secrets";
import { prismaClient } from "../server";
import { Errors } from "../types/errors.model";

const authMiddleware = async(req: any, res:Response, next:NextFunction) => {
    //1. Extract the token from header
    let token = req.headers.authorization!
    token = token.replace("Bearer ", "");

    //2. if token is not present, throw an error of unauthorized
    if(!token){
        next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED, Errors.UNAUTHORIZED))
    }
    try{
        //3. if the token is present, verify that toker and extract the payload
        const payload = jwt.verify(token, JWT_SECRET) as any
        //4. to get the user from the apyload
        const user = await prismaClient.user.findFirst({where: {id: payload.userId}})

        if(!user){
            next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED, Errors.UNAUTHORIZED))
        }
        //5. to attach the user to the current request object
        req.user = user;
        next()
    } catch(error){
        next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED, Errors.UNAUTHORIZED))
    }
}

export default authMiddleware