import { Request, Response } from "express";
import { OrderSchema } from "../schema/orders.schema";
import { CreateOrderDto } from "../interfaces/dto/orders/create-order-dto.interface";
import { ordersService } from "../services/orders.service";
import { ErrorCode } from "../exceptions/root.exception";
import { NotFoundException } from "../exceptions/not-found.exception";
import { GetOrdersListDto } from "../interfaces/dto/orders/get-orders-list-dto.interface";
import { InternalException } from "../exceptions/internal-exception.exception";
import { Errors } from "../types/errors.model";
import { GetOrderDto } from "../interfaces/dto/orders/get-order-dto.interface";
import { UpdateOrderStatusRequestDto } from "../interfaces/dto/orders/update-order-dto.interface";

export const listOrders = async (req: Request, res: Response) => {
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const skip = (page - 1) * limit
    const serviceResult = await ordersService.getListOrders(skip, limit)

    if(!serviceResult.success || !serviceResult.data) throw new InternalException('Something went wrong!', Errors.INTERNAL_EXCEPTION, ErrorCode.INTERNAL_EXCEPTION)

    const response: GetOrdersListDto = {
        orders: serviceResult.data.map(order => {
            return {
                id: order.id,
                updatedAt: order.updatedAt,
                createdAt: order.createdAt,
                status: order.status,
                OrderDetail: order.OrderDetail.map(orderDetail => {
                    return {
                        product: {
                            description: orderDetail.product.description,
                            id: orderDetail.product.id,
                            name: orderDetail.product.name,
                            count: orderDetail.count,
                            price: orderDetail.price
                        },
                    }
                })
            }
        })
    }

    res.json(response)
}

export const listOrdersCurrentUser = async (req: any, res: Response) => {
    //req.user - It is the user who is logged in and was obtained through a token

    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const skip = (page - 1) * limit
    const serviceResult = await ordersService.getListOrdersCurrentUser(skip, limit, req.user)

    if(!serviceResult.success || !serviceResult.data) throw new InternalException('Something went wrong!', Errors.INTERNAL_EXCEPTION, ErrorCode.INTERNAL_EXCEPTION)

    const response: GetOrdersListDto = {
        orders: serviceResult.data.map(order => {
            return {
                id: order.id,
                updatedAt: order.updatedAt,
                createdAt: order.createdAt,
                status: order.status,
                OrderDetail: order.OrderDetail.map(orderDetail => {
                    return {
                        product: {
                            description: orderDetail.product.description,
                            id: orderDetail.product.id,
                            name: orderDetail.product.name,
                            count: orderDetail.count,
                            price: orderDetail.price
                        },
                    }
                })
            }
        })
    }

    res.json(response)
}

export const listOrdersByUserId = async (req: any, res: Response) => {
    //req.user - It is the user who is logged in and was obtained through a token

    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const skip = (page - 1) * limit
    const id = Number(req.params.id)

    const serviceResult = await ordersService.getListOrderByIdUser(skip, limit, id)

    if(!serviceResult.success || !serviceResult.data) return res.json(serviceResult)

    const response: GetOrdersListDto = {
        orders: serviceResult.data.map(order => {
            return {
                id: order.id,
                updatedAt: order.updatedAt,
                createdAt: order.createdAt,
                status: order.status,
                OrderDetail: order.OrderDetail.map(orderDetail => {
                    return {
                        product: {
                            description: orderDetail.product.description,
                            id: orderDetail.product.id,
                            name: orderDetail.product.name,
                            count: orderDetail.count,
                            price: orderDetail.price
                        },
                    }
                })
            }
        })
    }

    res.json(response)
}

export const getOrderById = async (req: any, res: Response) => {
    //req.user - It is the user who is logged in and was obtained through a token

    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const skip = (page - 1) * limit
    const id = Number(req.params.id)

    const serviceResult = await ordersService.getOrderById(id)

    if(!serviceResult.success || !serviceResult.data) return res.json(serviceResult)

    const response: GetOrderDto = {
        id: serviceResult.data.id,
        userId: serviceResult.data.userId,
        updatedAt: serviceResult.data.updatedAt,
        createdAt: serviceResult.data.createdAt,
        status: serviceResult.data.status,
        OrderDetail: serviceResult.data.OrderDetail.map(orderDetail => {
            return {
                product: {
                    description: orderDetail.product.description,
                    id: orderDetail.product.id,
                    name: orderDetail.product.name,
                    count: orderDetail.count,
                    price: orderDetail.price
                },
            }
        })
    }

    res.json(response)
}

export const createOrder = async (req: any, res: Response) => {
    // Those products that are going to be ordered are added
    //req.user - It is the user who is logged in and was obtained through a token

    try{
        const body: CreateOrderDto = req.body
        const serviceResult = await ordersService.createOrder(body.products, req.user)
        res.json(serviceResult)
    } catch(err){
        throw new NotFoundException('Product not found.', ErrorCode.USER_NOT_FOUND)
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
    try{
        const id = Number(req.params.id)
        const serviceResult = await ordersService.deleteOrder(id)
        res.json(serviceResult)
    } catch(err){
        throw new NotFoundException('Product not found.', ErrorCode.USER_NOT_FOUND)
    }
}

export const updateOrder = async (req: Request, res: Response) => {
    try{
        const id = Number(req.params.id)
        const body: UpdateOrderStatusRequestDto = req.body
        const serviceResult = await ordersService.updateOrder(id, body.status)
        res.json(serviceResult)
    } catch(err){
        throw new NotFoundException('Product not found.', ErrorCode.USER_NOT_FOUND)
    }
}