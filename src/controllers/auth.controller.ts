import { NextFunction, Request, Response } from "express"
import { SignUpSchema } from "../schema/users.schema";
import { loginService } from "../services/Auth/login.service";
import { signUpService } from "../services/Auth/signup.service";
import { ErrorCode, HttpException } from "../exceptions/root.exception";
import { InternalException } from "../exceptions/internal-exception.exception";
import { loginSchema } from "../schema/login.schema";

export const signup = async (req: Request, res: Response) => {
    const { password } = req.body
    try{
        const user = await signUpService.signUp(req.body, password)
        res.json(user)
    } catch(err){
        throw new InternalException('Error creating unexpected product', err, ErrorCode.INTERNAL_EXCEPTION)
    }
}

export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    try{
        const response = await loginService.login(email, password)

        if(response.data?.token != undefined && response.data?.user != undefined){
            let token = response.data?.token
            let user = response.data?.user

            return res
            .cookie('JWT', token, {
                                        httpOnly: true, 
                                        sameSite: process.env.NODE_ENV == 'production' ? 'strict' : 'lax',
                                        secure: process.env.NODE_ENV == 'production',
                                        path: '/',
                                        maxAge: 1000 * 60 * 60 * Number(process.env.COOKIES_EXPIRES_HOURS)
                                  }
            )
            .status(200)
            .send({ user })
        }else{
            return res.send(response)
        }
    } catch(err){
        throw new InternalException('Error creating unexpected product', err, ErrorCode.INTERNAL_EXCEPTION)
    }
}

// /profile -> return the logged in user
export const profile = async (req: any, res: Response) => {
    res.json(req.user)
}
