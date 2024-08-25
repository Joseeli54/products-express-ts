import { hashSync } from "bcrypt"
import { ErrorCode } from "../../exceptions/root.exception"
import { Result } from "../../interfaces/results/results.interface"
import { User } from "../../models/users.model"
import { usersRepository } from "../../repositories/users.repository"
import { prismaClient } from "../../server"
import { Errors } from "../../types/errors.model"
import { Role } from "../../types/roles.model"
import { SignUpSchema } from "../../schema/users.schema"
import { InternalException } from "../../exceptions/internal-exception.exception"

async function signUp(data: Omit<User, 'id' | 'password' | 'role'>, password: string): Promise<Result<any>> {

    let body = {name: data.name, email: data.email, password: password}
    try{
        SignUpSchema.parse(body)
    }catch(err:any){
        let errors = []

        for (let index = 0; index < err.issues.length; index++) {
            let message = err.issues[index].message;
            errors.push(message)
        }

        return {
            success: false,
            message: "Could not create user due to some invalid parameters",
            data: null,
            errorCode: ErrorCode.INVALID,
            errorType: Errors.INVALID,
            errors: errors
        }
    }
      
    const user: Omit<User, 'id' | 'password'> = {
      ...data,
      role: Role.USER
    }
  
    // Verify that user by the same email does not already exist
    let hasUser = await prismaClient.user.findFirst({where: {email: user.email}})
    if (hasUser) {
      return {
        success: false,
        data: null,
        errors: ['User already exist'],
        errorCode: ErrorCode.USER_ALREADY_EXISTS,
        errorType: Errors.ALREADY_EXISTS,
        message: 'The email address for the account you are trying to create already exists.'
      }
    }
  
    const userS: Omit<User, 'id'> = {
      name: user.name,
      email: user.email,
      role: user.role,
      password: hashSync(password, 10),
    }
  
    // Save user
    try {
      await usersRepository.create(userS)
    } catch (err) {
      throw new InternalException('Error creating unexpected product', err, ErrorCode.INTERNAL_EXCEPTION)
    }
  
    return {
      success: true,
      data: userS,
      message: 'User created successfully'
    }
  }
  
  export const signUpService = {
    signUp
  }