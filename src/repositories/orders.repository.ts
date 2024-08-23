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
    // include orderProducts and include products inside orderProducts
    const pOrders = await prismaClient.order.findMany({
        include: {
            OrderDetail: {
                include: {
                    product: true
                }
            }
        }
    })

    return pOrders.map(pOrder => {
        return {
        ...pOrder
        }
    })
}

async function getRange(skip: number, take: number): Promise<Order[]> {
    const pOrders = await prismaClient.order.findMany({
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
    
      return pOrders.map(pOrder => {
        return {
          ...pOrder
        }
      })
}

async function getAllByUserId(userId: number): Promise<Order[]> {
    const pOrders = await prismaClient.order.findMany({
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
  
    return pOrders.map(pOrder => {
      return {
        ...pOrder,
      }
    })
}

async function getRangeByUserId(skip: number, take: number, userId: number): Promise<Order[]> {
    const pOrders = await prismaClient.order.findMany({
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
  
    return pOrders.map(pOrder => {
      return {
        ...pOrder,
      }
    })
}

async function getById(id: number): Promise<Order | null> {
    const pOrder = await prismaClient.order.findUnique({
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
  
    if (!pOrder) return null
  
    return {
      ...pOrder,
    }
}

async function create(order: Omit<Order, 'id'>): Promise<void> {
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
  