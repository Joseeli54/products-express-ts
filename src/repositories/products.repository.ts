import { PrismaClient } from '@prisma/client'
import { Product } from '../models/product.model'

const prismaClient = new PrismaClient()

async function count(): Promise<number> {
  return await prismaClient.product.count()
}

async function getAll(): Promise<Product[]> {
  return await prismaClient.product.findMany()
}

async function getRange(skip: number, take: number): Promise<Product[]> {
  return await prismaClient.product.findMany({
    skip,
    take
  })
}

async function getById(id: string): Promise<Product | null> {
  return await prismaClient.product.findUnique({
    where: {
      id
    }
  })
}

async function create(product: Omit<Product, 'id'>): Promise<void> {
  await prismaClient.product.create({
    data: product
  })
}

async function updateById(id: string, product: Omit<Product, 'id'>): Promise<void> {
  await prismaClient.product.update({
    where: {
      id
    },
    data: product
  })
}

async function removeById(id: string): Promise<void> {
  await prismaClient.product.delete({
    where: {
      id
    }
  })
}

async function updateQuantityById(id: string, count: number): Promise<void> {
  await prismaClient.product.update({
    where: {
      id
    },
    data: {
      count
    }
  })
}

async function updateAvailability(id: string, availability: string): Promise<void> {
  await prismaClient.product.update({
    where: {
      id
    },
    data: {
      availability
    }
  })
}

async function updatePriceById(id: string, price: number): Promise<void> {
  await prismaClient.product.update({
    where: {
      id
    },
    data: {
      price
    }
  })
}

export const productsRepository = {
  count,
  getAll,
  getRange,
  getById,
  create,
  updateById,
  removeById,
  updateQuantityById,
  updatePriceById,
  updateAvailability
}