import { InternalException } from '../exceptions/internal-exception.exception'
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
        throw new InternalException('Server error, contact an administrator.', Errors.INTERNAL_EXCEPTION, ErrorCode.INTERNAL_EXCEPTION)
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
  
    //The variable id of the current server user is taken, which was saved by the User Authentication Middleware.
    try {
      orders = await ordersRepository.getRangeByUserId(skip, limit, authUser.id)
      count = await ordersRepository.countByUserId(authUser.id)
    } catch {
        throw new InternalException('Server error, contact an administrator.', Errors.INTERNAL_EXCEPTION, ErrorCode.INTERNAL_EXCEPTION)
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
    
    //If the user no exist, then return NOT_FOUND
    if(!user)
        return {
            success: false,
            data: [],
            errors: ['User not found.'],
            errorCode: ErrorCode.USER_NOT_FOUND,
            errorType: Errors.NOT_FOUND,
            message: "Unable to get orders, because the user does not exist."
        }

    //In this try, get orders with the pagination specify by the client app.
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
  /////////////////////// Validation /////////////////////////
  // Validation if the id order exists or is the correct format
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

  /////////////////// Procesing ///////////////////
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

  // If the order is not exists, return error NOT_FOUND
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


async function createOrder( products: {id: number, count_products: number}[],authUser: any): Promise<Result<void>> {
    /////////////////////// Validation /////////////////////////
    // In this part, they perform validations where it is verified 
    // if the array is null, if there is any duplicate product within the array
    // and if the formats are compatible.

    const errors: string[] = []
  
    // Verify that the array is not empty
    if (!Array.isArray(products) || products.length === 0)
        errors.push('The product array is empty or not available in the request\n')
  
    // Verify that the products variable is not an empty array and if its format is correctly an array.
    const uniqueIds = new Set(products.map(p => p.id))
    if (uniqueIds.size !== products.length) {
        errors.push('There are products with duplicate identifiers. The request cannot be processed.\n')
    }

    // If there errors, then return error CONFLICT
    if (errors.length > 0) {
        return {
          success: false,
          errors,
          data: undefined,
          errorCode: ErrorCode.INVALID,
          errorType: Errors.INVALID,
          message: `The order could not be created due to these validation errors: ${errors}`
        }
    }

    /////////////////////// Initialization and processing /////////////////////////
    // Initialize the order details, along with the count of products to be obtained, 
    // and the available product count.
    const orderDetails = products.map(p => {
      return {
        productId: p.id,
        count_products: p.count_products,
        count: 0, //Firstly assign zero to count
        price: 0  //Firstly assign zero to price
      }
    })
  
    // A cycle is made to verify that the products exist, as well as verify that 
    // there are products available for the specified count.
    for (const orderDetail of orderDetails) {
      const product = await productsRepository.getById(orderDetail.productId)
  
      if (!product) {
        return {
          success: false,
          data: undefined,
          errors: [`Product with id ${orderDetail.productId} not found`],
          errorCode: ErrorCode.USER_NOT_FOUND,
          errorType: Errors.NOT_FOUND,
          message: 'The order could not be created because the product was not found.'
        }
      }
  
      if (product.count < orderDetail.count_products) {
        return {
          success: false,
          data: undefined,
          errors: [
            `The product with the identifier ${orderDetail.productId} does not have enough stock, therefore, it is not available to be obtained. (current stock = ${product.count})`
          ],
          errorCode: ErrorCode.UNPROCESSABLE_ENTITY,
          errorType: Errors.UNPROCESSABLE_ENTITY,
          message: 'Order could not be created due to verification errors'
        }
      }
  
      //If there has been no error. The value of the price and the quantity of the stock is assigned
      orderDetail.price = product.price
      orderDetail.count = product.count
    }
  
    const saveOrder = {
      status: 'Pending', //I initialize the order status by placing it as 'Pending'
      userId: authUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      OrderDetail: orderDetails.map(p => {
        return {
          productId: p.productId,
          count: p.count,
          price: p.price
        }
      })
    } as Omit<Order, 'id'>
  
    // Create order
    try {
      await ordersRepository.create(saveOrder)
  
      // Update product stock
      for (const orderDetail of orderDetails) {
        const remainingStock = orderDetail.count - orderDetail.count_products
        await productsRepository.updateQuantityById(orderDetail.productId, remainingStock)

        //if count of stock is 0, then is not available product
        if(remainingStock == 0){
          await productsRepository.updateAvailability(orderDetail.productId, "Not available")
        }

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

  //////////////// Validation //////////////////
  // If the order exist, then process to delete of the order
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

  //////////////// Processing /////////////
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

  /////////////////////// Validation /////////////////////////
  // Verification at status of the orders. This status should be 'Pending', 'In Progress' or 'Completed'
  
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

  /////////////////////// Processing /////////////////////////
  // If the order exists, we can proceed, if not, then an error is returned.
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

  // Updating the status of the order and its modification date
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
