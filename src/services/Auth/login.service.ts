import { compareSync } from "bcrypt"
import { ErrorCode } from "../../exceptions/root.exception"
import { Result } from "../../interfaces/results/results.interface"
import { prismaClient } from "../../server"
import { Errors } from "../../types/errors.model"
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../../secrets"
import { loginSchema } from "../../schema/login.schema"
import { InternalException } from "../../exceptions/internal-exception.exception"
import { NotFoundException } from "../../exceptions/not-found.exception"
import { usersRepository } from "../../repositories/users.repository"
import { UnprocessableEntity } from "../../exceptions/validation.exception"
import { UnauthorizedException } from "../../exceptions/unauthorized.exception"

async function login(email: string,password: string): Promise<Result<{ token: string, user: any } | null>> {
    //Login the user with email and password
    let body = {email: email, password: password}

    //Validation of format type and data
    try{
        loginSchema.parse(body)
    }catch(err:any){
        throw new UnprocessableEntity(err.issues,"Could not log in user due to some invalid parameters", Errors.INVALID, ErrorCode.INVALID)
        //     message: "Could not log in user due to some invalid parameters",
        //     data: null,
        //     errorCode: ErrorCode.INVALID,
        //     errorType: Errors.INVALID,
        //     errors: errors
    }

    // Get user by email
    let ExistUser = await usersRepository.getExistsEmail(email);
    if(!ExistUser){
        throw new NotFoundException("Failed to log in because the user does not exist", ErrorCode.USER_NOT_FOUND, Errors.NOT_FOUND, ["User does not exist"])
        //     message: "Failed to log in because the user does not exist",
        //     data: null,
        //     errorCode: ErrorCode.USER_NOT_FOUND,
        //     errorType: Errors.NOT_FOUND,
        //     errors: ["User does not exist"]
    }

    let user  = await usersRepository.getByEmail(email);
    let equalPasswords = await usersRepository.comparePassword(password, user!.password);
    //Compare the password receive with the user saved
    if(!equalPasswords){
        throw new UnauthorizedException("Failed to log in because the password is incorrect", ErrorCode.INCORRECT_PASSWORD, Errors.INCORRECT_PASSWORD, ["The password is incorrect"])
        //     message: "Failed to log in because the password is incorrect",
        //     data: null,
        //     errorCode: ErrorCode.INCORRECT_PASSWORD,
        //     errorType: Errors.INCORRECT_PASSWORD,
        //     errors: ["The password is incorrect"]
    }

    //generate the token with JWT
    const token = jwt.sign({
        userId: user!.id
    }, JWT_SECRET)

    return {
        success: true,
        data: { token, user },
        message: 'The user has logged in successfully.'
    }
}

export const loginService = {
    login
}