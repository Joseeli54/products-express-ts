import { PrismaClient } from '@prisma/client'
import { User } from '../models/users.model'
import { Role } from '../types/roles.model'
import { compareSync } from 'bcrypt'

const prismaClient = new PrismaClient()

async function count(): Promise<number> {
  return await prismaClient.user.count()
}

async function getAll(): Promise<User[]> {
  //get all users
  const users = await prismaClient.user.findMany()

  return users.map(user => {
    return {
      ...user,
      role: user.role as Role
    }
  })
}

async function getRange(skip: number, take: number): Promise<User[]> {
    //configure the pagination with the skip and take parameters
    const users = await prismaClient.user.findMany({
        skip,
        take,
    })
    
    return users.map(user => {
        return {
          ...user,
          role: user.role as Role
        }
    })
}

async function getById(id: number): Promise<User | null> {
    //get user by id
    const user = await prismaClient.user.findUnique({
      where: {
        id
      }
    })
  
    if (!user) return null
  
    return {
      ...user,
      role: user.role as Role
    }
}
  
async function getByEmail(email: string): Promise<User | null> {
    //get user by email
    const user = await prismaClient.user.findUnique({
        where: {
            email
        }
    })

    if (!user) return null

    return {
        ...user,
        role: user.role as Role
    }
}

async function getExistsEmail(email: string) : Promise<boolean> {
  return Boolean(await prismaClient.user.findFirst({where: {email}}))
}

async function comparePassword(passwordSend: string, passwordUser: string) : Promise<boolean> {

  if(!compareSync(passwordSend, passwordUser)){
    return false;
  }

  return true;
}
  
async function create(user: Omit<User, 'id'>): Promise<void> {
    //create user
    await prismaClient.user.create({
      data: user
    })
}
  
async function update(id: number, user: Omit<User, 'id'>): Promise<void> {
    //update user
    await prismaClient.user.update({
      where: {
        id
      },
      data: user
    })
}
  
async function remove(id: number): Promise<void> {
    //remove user
    await prismaClient.user.delete({
      where: {
        id
      }
    })
}

export const usersRepository = {
    count,
    getAll,
    getRange,
    getById,
    getByEmail,
    create,
    update,
    remove,
    getExistsEmail,
    comparePassword
}