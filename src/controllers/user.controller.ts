import { Request, Response } from "express";
import { usersService } from "../services/users.service";
import { GetListUsersDto } from "../interfaces/dto/users/get-user-list-dto.interface";
import { CreateUserDto } from "../interfaces/dto/users/create-user-dto.interface";
import { UpdateUserDto } from "../interfaces/dto/users/update-user-dto.interface";
import { GetUserDto } from "../interfaces/dto/users/get-user-dto.interface";

export const listUsers = async (req: Request, res: Response) => {
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const skip = (page - 1) * limit
    const serviceResult = await usersService.getListOrders(skip, limit)

    const response: GetListUsersDto = {
        users: serviceResult.data.map(user => {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt!,
                updatedAt: user.updatedAt!,
                role: user.role
            }
        })
    }

    res.json(response)
}

export const getUserById = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const serviceResult = await usersService.getUserById(id)
  
    const response: GetUserDto = {
      id: serviceResult.data!.id,
      name: serviceResult.data!.name,
      email: serviceResult.data!.email,
      role: serviceResult.data!.role,
      createdAt: serviceResult.data!.createdAt!,
      updatedAt: serviceResult.data!.updatedAt!,
    }
  
    res.json(response)
}

export const createUser = async (req: Request, res: Response) => {
    const body: CreateUserDto = req.body
    const serviceResult = await usersService.createUser(body, body.password)
    res.json(serviceResult)
}

export const updateUser = async (req: Request, res: Response) => {
    const body: UpdateUserDto = req.body
    const id = Number(req.params.id)
    const serviceResult = await usersService.updateUser(id, body, body.password)
    res.json(serviceResult)
}

export const deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const serviceResult = await usersService.deleteUser(id)
    res.json(serviceResult)
}



