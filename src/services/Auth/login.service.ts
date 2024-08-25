import { compareSync } from "bcrypt"
import { NotFoundException } from "../../exceptions/not-found.exception"
import { ErrorCode } from "../../exceptions/root.exception"
import { Result } from "../../interfaces/results/results.interface"
import { prismaClient } from "../../server"
import { Errors } from "../../types/errors.model"
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../../secrets"
import { loginSchema } from "../../schema/login.schema"
import { InternalException } from "../../exceptions/internal-exception.exception"

async function login(email: string,password: string): Promise<Result<{ token: string, user: any } | null>> {

    let body = {email: email, password: password}

    try{
        loginSchema.parse(body)
    }catch(err:any){
        let errors = []

        for (let index = 0; index < err.issues.length; index++) {
            let message = err.issues[index].message;
            errors.push(message)
        }

        return {
            success: false,
            message: "Could not log in user due to some invalid parameters",
            data: null,
            errorCode: ErrorCode.INVALID,
            errorType: Errors.INVALID,
            errors: errors
        }
    }

    try{
        // Get user by email
        let user = await prismaClient.user.findFirst({where: {email}})
        if(!user){
            return {
                success: false,
                message: "Failed to log in because the user does not exist",
                data: null,
                errorCode: ErrorCode.USER_NOT_FOUND,
                errorType: Errors.NOT_FOUND,
                errors: ["User does not exist"]
            }
        }

        if(!compareSync(password, user!.password)){
            return {
                success: false,
                message: "Failed to log in because the password is incorrect",
                data: null,
                errorCode: ErrorCode.INCORRECT_PASSWORD,
                errorType: Errors.INCORRECT_PASSWORD,
                errors: ["User does not exist"]
            }
        }

        const token = jwt.sign({
            userId: user!.id
        }, JWT_SECRET)
    
        return {
            success: true,
            data: { token, user },
            message: 'The user has logged in successfully.'
        }
    } catch(err){
        throw new InternalException('Error unexpected login', err, ErrorCode.INTERNAL_EXCEPTION)
    }
}

export const loginService = {
    login
}