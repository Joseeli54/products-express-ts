import { hashSync } from 'bcrypt'
import { ErrorCode } from '../exceptions/root.exception'
import { Result } from '../interfaces/results/results.interface'
import { User } from '../models/users.model'
import { usersRepository } from '../repositories/users.repository'
import { prismaClient } from '../server'
import { Errors } from '../types/errors.model'

async function getListOrders(skip: number, limit: number): Promise<Result<User[]>> {
    let users: User[]
    let count: number
  
    try {
      users = await usersRepository.getRange(skip, limit)
      count = await usersRepository.count()
    } catch {
      return {
        success: false,
        data: [],
        errors: ['Unexpected server error.'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'Could not get the users list due to unexpected error'
      }
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
    } catch {
      return {
        success: false,
        data: null,
        errors: ['User could not be retrieved because an unexpected error occurred'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'An error occurred while retrieving the user'
      }
    }
  
    if (!user) {
      return {
        success: false,
        data: null,
        errors: ['User not found'],
        errorCode: ErrorCode.USER_NOT_FOUND,
        errorType: Errors.NOT_FOUND,
        message: 'The user could not be found.'
      }
    }
  
    return {
      success: true,
      data: user,
      message: 'The user successfully obtained'
    }
}

async function createUser(user: Omit<User, 'id' | 'password'>, password: string): Promise<Result<void>> {
    // Verify that user by the same email does not already exist
    let hasUser = await prismaClient.user.findFirst({where: {email: user.email}})
    if (hasUser) {
      return {
        success: false,
        data: undefined,
        errors: ['User with the same email already exists'],
        errorCode: ErrorCode.USER_ALREADY_EXISTS,
        errorType: Errors.ALREADY_EXISTS,
        message: 'User could not be created due to verification errors'
      }
    }
  
    const userToSave: Omit<User, 'id'> = {
      name: user.name,
      email: user.email,
      role: user.role,
      password: hashSync(password, 10),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  
    // Create user
    try {
      await usersRepository.create(userToSave)
    } catch (error) {
      return {
        success: false,
        data: undefined,
        errors: ['User could not be created because an unexpected error occurred'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'An error occurred while creating the user'
      }
    }
  
    return {
      success: true,
      data: undefined,
      message: 'User created successfully'
    }
}

async function updateUser(id: number, user: Omit<User, 'id' | 'passwordHash'>,password: string): Promise<Result<void>> {
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
      return {
        success: false,
        data: undefined,
        errors: ['User with the same email already exists'],
        errorCode: ErrorCode.USER_ALREADY_EXISTS,
        errorType: Errors.ALREADY_EXISTS,
        message: 'The user could not update because the email is duplicated'
      }
    }

    let userToSave: any
    if(password != undefined){
        userToSave = {
            name: user.name,
            email: user.email,
            role: user.role,
            password: hashSync(password, 10),
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }else{
        userToSave = {
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }
  
    // Update user
    try {
      await usersRepository.update(id, userToSave)
    } catch {
      return {
        success: false,
        data: undefined,
        errors: ['User could not be updated because an unexpected error occurred'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'An error occurred while updating the user'
      }
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
      return {
        success: false,
        data: undefined,
        errors: ['User not found'],
        errorCode: ErrorCode.USER_NOT_FOUND,
        errorType: Errors.NOT_FOUND,
        message: 'The user could not be deleted because it does not exist'
      }
    }
  
    // Delete user
    try {
      await usersRepository.remove(id)
    } catch {
      return {
        success: false,
        data: undefined,
        errors: ['User could not be deleted because an unexpected error occurred'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'An error occurred while deleting the user'
      }
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
