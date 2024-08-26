import { PrismaClient } from '@prisma/client'
import { Product } from '../models/product.model'

const prismaClient = new PrismaClient()

async function count(): Promise<number> {
  //quantity of products
  return await prismaClient.product.count()
}

async function getAll(): Promise<Product[]> {
  //get all products in the DB
  return await prismaClient.product.findMany()
}

async function getRange(skip: number, take: number): Promise<Product[]> {
  //get a range of products configure with skip and take
  return await prismaClient.product.findMany({
    skip,
    take
  })
}

async function getById(id: number): Promise<Product | null> {
  //get product by id
  return await prismaClient.product.findUnique({
    where: {
      id
    }
  })
}

async function create(product: Omit<Product, 'id'>): Promise<void> {
  //create a product
  await prismaClient.product.create({
    data: product
  })
}

async function updateById(id: number, product: Omit<Product, 'id'>): Promise<void> {
  //update a specify product
  await prismaClient.product.update({
    where: {
      id
    },
    data: product
  })
}

async function removeById(id: number): Promise<void> {
  //remove a specify product
  await prismaClient.product.delete({
    where: {
      id
    }
  })
}

async function updateQuantityById(id: number, count: number): Promise<void> {
  //update the count of the product (stock)
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
  //update the availability of product
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
  //update the price of product
  await prismaClient.product.update({
    where: {
      id
    },
    data: {
      price
    }
  })
}

async function sameName(nameSend: string, nameDB: string){
  if(nameSend == nameDB){
    return true;
  }

  return false;
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
  updateAvailability,
  sameName
}