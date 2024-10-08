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
import { sendMail } from "../../mailer/mailer"
import { UnprocessableEntity } from "../../exceptions/validation.exception"

async function signUp(data: Omit<User, 'id' | 'password' | 'role'>, password: string): Promise<Result<any>> {
    //Create de user with the name, email and password
    let body = {name: data.name, email: data.email, password: password}

    //Verify that the data is correct and format type
    try{
        SignUpSchema.parse(body)
    }catch(err:any){
        throw new UnprocessableEntity(err.issues, "Could not create user due to some invalid parameters", Errors.INVALID, ErrorCode.INVALID)        
        //     message: "Could not create user due to some invalid parameters",
        //     data: null,
        //     errorCode: ErrorCode.INVALID,
        //     errorType: Errors.INVALID,
        //     errors: err.issues
    }
      
    const user: Omit<User, 'id' | 'password'> = {
      ...data,
      role: Role.USER
    }
  
    // Verify that user by the same email does not already exist
    let hasUser = await prismaClient.user.findFirst({where: {email: user.email}})
    if (hasUser) {
      throw new UnprocessableEntity(['User already exist'], "The email address for the account you are trying to create already exists.", 
                                    Errors.ALREADY_EXISTS, ErrorCode.USER_ALREADY_EXISTS)

      //   errors: ['User already exist'],
      //   errorCode: ErrorCode.USER_ALREADY_EXISTS,
      //   errorType: Errors.ALREADY_EXISTS,
      //   message: 'The email address for the account you are trying to create already exists.'
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

      const from: string = `Create Account" <` + process.env.MAIL_HOST + `>`;
      const to: string = user.email;
      const subject: string = 'Create Account - Product Express';
      const mailTemplate: string = `<p>Hello `+ user.name + `,</p>
                                    <p>Thank you for signing up for our trial API called Product Express.</p>`;
      //The email is sent at the time of registration, if the email does not exist or there is an error, the process will continue.
      sendMail( from, to, subject, mailTemplate);
    } catch (err) {
      throw new InternalException('Error creating unexpected product', err, ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
      //   errors: err,
      //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
      //   errorType: Errors.INTERNAL_EXCEPTION,
      //   message: 'Error creating unexpected product'
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