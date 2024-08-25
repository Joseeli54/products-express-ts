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

async function getById(id: number): Promise<Product | null> {
  return await prismaClient.product.findUnique({
    where: {
      id
    }
  })
}

async function create(product: Omit<Product, 'id'>): Promise<void> {
  console.log("Consulta")

  await prismaClient.product.create({
    data: product
  })
}

async function updateById(id: number, product: Omit<Product, 'id'>): Promise<void> {
  await prismaClient.product.update({
    where: {
      id
    },
    data: product
  })
}

async function removeById(id: number): Promise<void> {
  await prismaClient.product.delete({
    where: {
      id
    }
  })
}

async function updateQuantityById(id: number, count: number): Promise<void> {
  await prismaClient.product.update({
    where: {
      id
    },
    data: {
      count
    }
  })
}

async function updateAvailability(id: number, availability: string): Promise<void> {
  await prismaClient.product.update({
    where: {
      id
    },
    data: {
      availability
    }
  })
}

async function updatePriceById(id: number, price: number): Promise<void> {
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