import { ErrorCode } from '../exceptions/root.exception'
import { Result } from '../interfaces/results/results.interface'
import { Order } from '../models/order.model'
import { ordersRepository } from '../repositories/orders.repository'
import { productsRepository } from '../repositories/products.repository'
import { getOrderSchema, OrderSchema } from '../schema/orders.schema'
import { prismaClient } from '../server'
import { Errors } from '../types/errors.model'

async function getListOrders(skip: number, limit: number): Promise<Result<Order[]>> {
    let orders: Order[]
    let count: number
  
    try {
      orders = await ordersRepository.getRange(skip, limit)
      count = await ordersRepository.count()
    } catch {
      return {
        success: false,
        data: [],
        errors: ['Unexpected server error.'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'Could not get the products list due to unexpected error'
      }
    }
  
    return {
      success: true,
      data: orders,
      message: 'The list was loaded successfully',
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        itemCount: count,
        pageCount: Math.ceil(count / limit)
      }
    }
}

async function getListOrdersCurrentUser(skip: number, limit: number, authUser: any): Promise<Result<Order[]>> {
    let orders: Order[]
    let count: number
  
    try {
      orders = await ordersRepository.getRangeByUserId(skip, limit, authUser.id)
      count = await ordersRepository.countByUserId(authUser.id)
    } catch {
      return {
        success: false,
        data: [],
        errors: ['Unexpected server error.'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'Could not get the products list due to unexpected error'
      }
    }
  
    return {
      success: true,
      data: orders,
      message: 'The list was loaded successfully',
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        itemCount: count,
        pageCount: Math.ceil(count / limit)
      }
    }
}

async function getListOrderByIdUser(skip: number, limit: number, userId: number): Promise<Result<Order[]>> {
    let orders: Order[]
    let count: number

    let user = await prismaClient.user.findFirst({where: {id: userId}})
    
    if(!user)
        return {
            success: false,
            data: [],
            errors: ['User not found.'],
            errorCode: ErrorCode.USER_NOT_FOUND,
            errorType: Errors.NOT_FOUND,
            message: "Unable to get orders, because the user does not exist."
        }

    try {
        orders = await ordersRepository.getRangeByUserId(skip, limit, userId)
        count = await ordersRepository.countByUserId(userId)
    } catch {
        return {
            success: false,
            data: [],
            errors: ['Unexpected server error.'],
            errorCode: ErrorCode.INTERNAL_EXCEPTION,
            errorType: Errors.INTERNAL_EXCEPTION,
            message: 'Could not get the products list due to unexpected error'
        }
    }

    return {
        success: true,
        data: orders,
        message: 'Orders retrieved successfully',
        pagination: {
          page: Math.floor(skip / limit) + 1,
          limit,
          itemCount: count,
          pageCount: Math.ceil(count / limit)
        }
    }
}

async function getOrderById(id: number): Promise<Result<Order | null>> {
  //Validation
  let data = { id : id }

  try{
    getOrderSchema.parse(data)
  }catch(err:any){
      let errors = []

      for (let index = 0; index < err.issues.length; index++) {
          let message = err.issues[index].message;
          errors.push(message)
      }

      return {
          success: false,
          message: "Could not get order due to some invalid parameters",
          data: null,
          errorCode: ErrorCode.INVALID,
          errorType: Errors.INVALID,
          errors: errors
      }
  }

  let order: Order | null

  // Get order
  try {
    order = await ordersRepository.getById(id)
  } catch {
    return {
      success: false,
      data: null,
      errors: ['Order could not be retrieved because an unexpected error occurred'],
      errorCode: ErrorCode.INTERNAL_EXCEPTION,
      errorType: Errors.INTERNAL_EXCEPTION,
      message: 'An error occurred while retrieving order'
    }
  }

  if (!order) {
    return {
      success: false,
      data: null,
      errors: ['Order not found'],
      errorCode: ErrorCode.USER_NOT_FOUND,
      errorType: Errors.NOT_FOUND,
      message: 'Order could not be retrieved due to verification errors'
    }
  }

  return {
    success: true,
    data: order,
    message: 'Order retrieved succesfully'
  }
}


async function createOrder( products: {id: string, count_products: number}[],authUser: any): Promise<Result<void>> {
    // Validation
    const errors: string[] = []
  
    if (!Array.isArray(products) || products.length === 0)
        errors.push('Products array is empty or missing\n')
  
    // Verify for duplicated ids
    const uniqueIds = new Set(products.map(p => p.id))
    if (uniqueIds.size !== products.length) {
        errors.push('Duplicate product ids found in the products array\n')
    }

    if (errors.length > 0) {
        return {
          success: false,
          errors,
          data: undefined,
          errorCode: ErrorCode.CONFLICT,
          errorType: Errors.CONFLICT,
          message: `The order could not be created due to these validation errors: ${errors}`
        }
    }
  
    // initialize products unit price and stock
    const orderDetails = products.map(p => {
      return {
        id: p.id,
        count_products: p.count_products,
        count: 0,
        price: 0
      }
    })
  
    // Verify that all products exist and have enough stock for required quantity
    for (const orderDetail of orderDetails) {
      const product = await productsRepository.getById(orderDetail.id)
  
      if (!product) {
        return {
          success: false,
          data: undefined,
          errors: [`Product with id ${orderDetail.id} not found`],
          errorCode: ErrorCode.USER_NOT_FOUND,
          errorType: Errors.NOT_FOUND,
          message: 'The order could not be created because the product was not found.'
        }
      }
  
      if (product.count < orderDetail.count) {
        return {
          success: false,
          data: undefined,
          errors: [
            `Product with id ${orderDetail.id} does not have enough available stock (current stock = ${product.count})`
          ],
          errorCode: ErrorCode.UNPROCESSABLE_ENTITY,
          errorType: Errors.UNPROCESSABLE_ENTITY,
          message: 'Order could not be created due to verification errors'
        }
      }
  
      // if valid item, add unitPrice and stock to orderDetail
      orderDetail.price = product.price
      orderDetail.count = product.count
    }
  
    const saveOrder = {
      status: 'Pending',
      userId: authUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      OrderDetail: orderDetails.map(p => {
        return {
          productId: p.id,
          count: p.count,
          price: p.price
        }
      })
    } as Omit<Order, 'id'>
  
    // Create order
    try {
      await ordersRepository.create(saveOrder)
  
      // Update product quantities
      for (const orderDetail of orderDetails) {
        const remainingStock = orderDetail.count - orderDetail.count_products
        await productsRepository.updateQuantityById(orderDetail.id, remainingStock)
      }
    } catch {
      return {
        success: false,
        data: undefined,
        errors: ['Order could not be created because an unexpected error occurred'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'An error occurred while creating order'
      }
    }
  
    return {
      success: true,
      data: undefined,
      message: 'Order created successfully'
    }
}

async function deleteOrder(id: number): Promise<Result<void>> {

  // Verify that order exists
  const order = await ordersRepository.getById(id)
  if (!order) {
    return {
      success: false,
      data: undefined,
      errors: ['Order not found'],
      errorCode: ErrorCode.USER_NOT_FOUND,
      errorType: Errors.NOT_FOUND,
      message: 'The order could not be deleted because it does not exist.'
    }
  }

  // Delete order
  try {
    await ordersRepository.remove(id)
  } catch {
    return {
      success: false,
      data: undefined,
      errors: ['Order could not be deleted because an unexpected error occurred'],
      errorCode: ErrorCode.INTERNAL_EXCEPTION,
      errorType: Errors.INTERNAL_EXCEPTION,
      message: 'An error occurred while deleting order'
    }
  }

  return {
    success: true,
    data: undefined,
    message: 'Order deleted successfully'
  }
}

async function updateOrder(id: number, status: string): Promise<Result<void>> {

  let data = { status : status}
  // Verification
  try{
    OrderSchema.parse(data)
  }catch(err:any){
      let errors = []

      for (let index = 0; index < err.issues.length; index++) {
          let message = err.issues[index].message;
          errors.push(message)
      }

      return {
          success: false,
          message: "Could not create product due to some invalid parameters",
          data: undefined,
          errorCode: ErrorCode.INVALID,
          errorType: Errors.INVALID,
          errors: errors
      }
  }

  // Verify that order exists and that status is different from current status
  const order = await ordersRepository.getById(id)

  if (!order) {
    return {
      success: false,
      data: undefined,
      errors: ['Order not found'],
      errorCode: ErrorCode.USER_NOT_FOUND,
      errorType: Errors.NOT_FOUND,
      message: 'The order could not be updated because it does not exist.'
    }
  }

  if (order.status === status) {
    return {
      success: false,
      data: undefined,
      errors: ['Order status is already set to the specified status'],
      errorCode: ErrorCode.CONFLICT,
      errorType: Errors.CONFLICT,
      message: 'Order status could not be updated due to verification errors'
    }
  }

  // Update order status
  try {
    await ordersRepository.update(id, status, new Date())
  } catch {
    return {
      success: false,
      data: undefined,
      errors: ['Order status could not be updated because an unexpected error occurred'],
      errorCode: ErrorCode.INTERNAL_EXCEPTION,
      errorType: Errors.INTERNAL_EXCEPTION,
      message: 'An error occurred while updating order status'
    }
  }

  return {
    success: true,
    data: undefined,
    message: 'Order updated successfully'
  }
}

export const ordersService = {
    getListOrders,
    createOrder,
    getListOrdersCurrentUser,
    getOrderById,
    getListOrderByIdUser,
    deleteOrder,
    updateOrder
}
