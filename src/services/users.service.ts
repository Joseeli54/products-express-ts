import { hashSync } from 'bcrypt'
import { ErrorCode } from '../exceptions/root.exception'
import { Result } from '../interfaces/results/results.interface'
import { User } from '../models/users.model'
import { usersRepository } from '../repositories/users.repository'
import { prismaClient } from '../server'
import { Errors } from '../types/errors.model'
import { createUserSchema, updateUserSchema } from '../schema/users.schema'
import { InternalException } from '../exceptions/internal-exception.exception'
import { sendMail } from '../mailer/mailer'
import { NotFoundException } from '../exceptions/not-found.exception'
import { UnprocessableEntity } from '../exceptions/validation.exception'

async function getListOrders(skip: number, limit: number): Promise<Result<User[]>> {
    let users: User[]
    let count: number

    if(limit.toString() == "NaN"){
      throw new UnprocessableEntity(["The 'limit' parameters isn't exist"], "The 'limit' parameters are not being included in the sent request. Example:'/?limit=n'", Errors.INVALID, ErrorCode.INVALID) 
      // errors: errors
      // errorCode: ErrorCode.INVALID,
      // errorType: Errors.INVALID,
      // message: 'Could not create product due to some invalid parameters' 
    }
  
    if(skip.toString() == "NaN"){
      throw new UnprocessableEntity(["The 'page' parameters isn't exist"], "The 'page' parameters are not being included in the sent request. Example:'/?page=n'", Errors.INVALID, ErrorCode.INVALID) 
      // errors: errors
      // errorCode: ErrorCode.INVALID,
      // errorType: Errors.INVALID,
      // message: 'Could not create product due to some invalid parameters' 
    }

    //get all orders existing
    try {
      users = await usersRepository.getRange(skip, limit)
      count = await usersRepository.count()
    } catch (err) {
      throw new InternalException('Server error, contact an administrator.', err,  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
      //   errors: err,
      //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
      //   errorType: Errors.INTERNAL_EXCEPTION,
      //   message: 'Server error, contact an administrator.'
    }
  
    return {
      success: true,
      data: users,
      message: 'The list was loaded successfully',
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        itemCount: count,
        pageCount: Math.ceil(count / limit)
      }
    }
}

async function getUserById(id: number): Promise<Result<User | null>> {
    // Get user
    let user: User | null
  
    try {
      user = await usersRepository.getById(id)
    } catch (err) {
      throw new InternalException('Server error, contact an administrator.', err,  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
      //   errors: err,
      //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
      //   errorType: Errors.INTERNAL_EXCEPTION,
      //   message: 'Server error, contact an administrator.'
    }
  
    if (!user) {
      throw new NotFoundException("The user could not be found.", ErrorCode.USER_NOT_FOUND, Errors.NOT_FOUND, ['User not found'])
      //   errors: ['Product with the same name already exists'],
      //   errorCode: ErrorCode.USER_ALREADY_EXISTS,
      //   errorType: Errors.ALREADY_EXISTS,
      //   message: 'Due to validation errors, this product cannot be updated.'   
    }
  
    return {
      success: true,
      data: user,
      message: 'The user successfully obtained'
    }
}

async function createUser(user: Omit<User, 'id' | 'password'>, password: string): Promise<Result<void>> {

    let data = { name: user.name, email: user.email, role : user.role, password : password }

    //Validation of format type and data of user
    try{
      createUserSchema.parse(data)
    }catch(err:any){
        throw new UnprocessableEntity(err.issues, "Could not create user due to some invalid parameters", Errors.INVALID, ErrorCode.INVALID)  
        // errors: errors
        // errorCode: ErrorCode.INVALID,
        // errorType: Errors.INVALID,
        // message: 'Could not create product due to some invalid parameters'
    }

    // Verify that user by the same email does not already exist
    let hasUser = await prismaClient.user.findFirst({where: {email: user.email}})
    if (hasUser) {
      throw new UnprocessableEntity(['User with the same email already exists'], "User could not be created due to verification errors", Errors.ALREADY_EXISTS, ErrorCode.USER_ALREADY_EXISTS)  
      // errors: ['User with the same email already exists']
      // errorCode: ErrorCode.INVALID,
      // errorType: Errors.INVALID,
      // message: "User could not be created due to verification errors"
    }
  
    const saveUser: Omit<User, 'id'> = {
      name: user.name,
      email: user.email,
      role: user.role,
      password: hashSync(password, 10),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  
    // Create user
    try {
      await usersRepository.create(saveUser)

      const from: string = `Create Account" <` + process.env.MAIL_HOST + `>`;
      const to: string = user.email;
      const subject: string = 'Create Account - Product Express';
      const mailTemplate: string = `<p>Hello `+ user.name + `,</p>
                                    <p>Thank you for signing up for our trial API called Product Express.</p>`;
      //The email is sent at the time of registration, if the email does not exist or there is an error, the process will continue.
      sendMail( from, to, subject, mailTemplate);
    } catch (error) {
      throw new InternalException('An error occurred while creating the user', error,  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
      //   errors: error,
      //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
      //   errorType: Errors.INTERNAL_EXCEPTION,
      //   message: 'An error occurred while creating the user'
    }
  
    return {
      success: true,
      data: undefined,
      message: 'User created successfully'
    }
}

async function updateUser(id: number, user: Omit<User, 'id' | 'password'>,password: string): Promise<Result<void>> {

    //Validation of format type and data of user
    try{
        updateUserSchema.parse(user)
    }catch(err:any){
        throw new UnprocessableEntity(err.issues, "Could not create user due to some invalid parameters", Errors.INVALID, ErrorCode.INVALID)  
        // errors: errors
        // errorCode: ErrorCode.INVALID,
        // errorType: Errors.INVALID,
        // message: 'Could not create user due to some invalid parameters'
    }

    // Verify user exists
    let hasUser = await prismaClient.user.findFirst({where: {id}})
    if (!hasUser) {
      
      return {
        success: false,
        data: undefined,
        errors: ['User not found'],
        errorCode: ErrorCode.USER_NOT_FOUND,
        errorType: Errors.NOT_FOUND,
        message: 'User not found to be updated.'
      }
    }

    // Verify that user by the same email does not already exist
    let userByEmailExists : any
    if(user.email != undefined){
        userByEmailExists = await prismaClient.user.findFirst({where: { id: {not: id }, email: user.email}})
    }else{
        userByEmailExists = false
    }
    
    if (userByEmailExists) {
      throw new UnprocessableEntity(['User with the same email already exists'], "The user could not update because the email is duplicated", Errors.ALREADY_EXISTS, ErrorCode.USER_ALREADY_EXISTS)  
      // errors: ['User with the same email already exists']
      // errorCode: ErrorCode.INVALID,
      // errorType: Errors.INVALID,
      // message: "The user could not update because the email is duplicated"
    }

    let saveUser: any
    if(password != undefined){
        saveUser = {
            name: user.name,
            email: user.email,
            role: user.role,
            password: hashSync(password, 10),
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }else{
        saveUser = {
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }
  
    // Update user
    try {
      await usersRepository.update(id, saveUser)
    } catch (error) {
      throw new InternalException('An error occurred while updating the user', ['User could not be updated because an unexpected error occurred'],  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
      //   errors: ['User could not be updated because an unexpected error occurred'],
      //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
      //   errorType: Errors.INTERNAL_EXCEPTION,
      //   message: 'An error occurred while updating the user'
    }
  
    return {
      success: true,
      data: undefined,
      message: 'User updated successfully'
    }
}

async function deleteUser(id: number): Promise<Result<void>> {
    // Verify user exists
    let hasUser = await prismaClient.user.findFirst({where: {id}})
    if (!hasUser) {
      throw new NotFoundException("The user could not be deleted because it does not exist", ErrorCode.USER_NOT_FOUND, Errors.NOT_FOUND, ['User not found'])
      //   errors: ['User not found'],
      //   errorCode: ErrorCode.USER_ALREADY_EXISTS,
      //   errorType: Errors.ALREADY_EXISTS,
      //   message: 'The user could not be deleted because it does not exist'
    }
  
    // Delete user
    try {
      await usersRepository.remove(id)
    } catch (err) {
      throw new InternalException('Server error, contact an administrator.', err,  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
      //   errors: err,
      //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
      //   errorType: Errors.INTERNAL_EXCEPTION,
      //   message: 'Server error, contact an administrator.'
    }
  
    return {
      success: true,
      data: undefined,
      message: 'User deleted successfully'
    }
}

export const usersService = {
    getListOrders,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}
