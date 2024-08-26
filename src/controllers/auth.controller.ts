import { NextFunction, Request, Response } from "express";
import { loginService } from "../services/Auth/login.service";
import { signUpService } from "../services/Auth/signup.service";

export const signup = async (req: Request, res: Response) => {
    const { password } = req.body
    const response = await signUpService.signUp(req.body, password)
    return res.json(response)
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body;
    const response = await loginService.login(email, password)

    let token = response.data?.token
    let user = response.data?.user

    if(process.env.NODE_ENV == 'production'){
        return res
        .cookie('JWT', token, {
                                    httpOnly: true, 
                                    sameSite: 'strict',
                                    secure: true,
                                    path: '/',
                                    maxAge: 1000 * 60 * 60 * Number(process.env.COOKIES_EXPIRES_HOURS)
                            }
        )
        .status(200)
        .send({ success: true, user, message: "The user is logged successfully" })
    }else{
        return res.send({ success: true, user, message: "The user is logged successfully", token})
    }
}

// /profile -> return the logged in user
export const profile = async (req: any, res: Response) => {
    return res.json(req.user)
}
