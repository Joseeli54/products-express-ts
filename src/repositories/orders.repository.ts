import { PrismaClient } from '@prisma/client'
import { Order } from '../models/order.model'

const prismaClient = new PrismaClient()

async function count(): Promise<number> {
  return await prismaClient.order.count()
}

async function countByUserId(userId: number): Promise<number> {
    return await prismaClient.order.count({
        where: {
            userId
        }
    })
}
  
async function getAll(): Promise<Order[]> {
    // include products and include orders inside Orderdetails
    const orders = await prismaClient.order.findMany({
        include: {
            OrderDetail: {
                include: {
                    product: true
                }
            }
        }
    })

    return orders.map(order => {
        return {
        ...order
        }
    })
}

async function getRange(skip: number, take: number): Promise<Order[]> {
    //I configure the pagination when returning orders with skip and take.
    const orders = await prismaClient.order.findMany({
        skip,
        take,
        include: {
          OrderDetail: {
            include: {
              product: true
            }
          }
        }
      })
    
      return orders.map(order => {
        return {
          ...order
        }
      })
}

async function getAllByUserId(userId: number): Promise<Order[]> {
    //I get all the orders from a specific user
    const orders = await prismaClient.order.findMany({
      where: {
        userId
      },
      include: {
        OrderDetail: {
          include: {
            product: true
          }
        }
      }
    })
  
    return orders.map(order => {
      return {
        ...order,
      }
    })
}

async function getRangeByUserId(skip: number, take: number, userId: number): Promise<Order[]> {
    //I configure the pagination when returning orders with skip and take from a specific user. 
    const orders = await prismaClient.order.findMany({
      where: {
        userId
      },
      skip,
      take,
      include: {
        OrderDetail: {
          include: {
            product: true
          }
        }
      }
    })
  
    return orders.map(order => {
      return {
        ...order,
      }
    })
}

async function getById(id: number): Promise<Order | null> {
    //get one order in specify
    const order = await prismaClient.order.findUnique({
      where: {
        id
      },
      include: {
        OrderDetail: {
          include: {
            product: true
          }
        }
      }
    })
  
    if (!order) return null
  
    return {
      ...order,
    }
}

async function create(order: Omit<Order, 'id'>): Promise<void> {
    //create order
    await prismaClient.order.create({
      data: {
        userId: order.userId,
        status: order.status,
        OrderDetail: {
          create: order.OrderDetail
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    })
}

async function remove(id: number): Promise<void> {
    //remove order
    await prismaClient.orderDetail.deleteMany({
      where: {
        orderId: id
      }
    })

    await prismaClient.order.delete({
      where: {
        id
      }
    })
}

async function update(id: number, status: string, updatedAt: Date): Promise<void> {
    //update order
    await prismaClient.order.update({
      where: {
        id
      },
      data: {
        status,
        updatedAt
      }
    })
}

export const ordersRepository = {
    count,
    countByUserId,
    getAll,
    getRange,
    getAllByUserId,
    getRangeByUserId,
    getById,
    create,
    remove,
    update
}
  