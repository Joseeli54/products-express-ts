import { ErrorCode } from '../exceptions/root.exception'
import { Result } from '../interfaces/results/results.interface'
import { Product } from '../models/product.model'
import { productsRepository } from '../repositories/products.repository'
import { getProductSchema, ProductSchema, updateProductSchema } from '../schema/products.schema'
import { prismaClient } from '../server'
import { Errors } from '../types/errors.model'

async function getListProducts(skip: number, limit: number): Promise<Result<Product[]>> {
  let products: Product[]
  let count: number

  try {
    products = await productsRepository.getRange(skip, limit)
    count = await productsRepository.count()
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
    data: products,
    message: 'The list was loaded successfully',
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      itemCount: count,
      pageCount: Math.ceil(count / limit)
    }
  }
}

async function createProduct(product: Omit<Product, 'id'>): Promise<Result<void>> {

    try{
        ProductSchema.parse(product)
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

    let productExists = await prismaClient.product.findFirst({where: { name : product.name }})
    if(productExists){
        return {
            success: false,
            data: undefined,
            errors: ['Already Exists'],
            errorCode: ErrorCode.USER_ALREADY_EXISTS,
            errorType: Errors.ALREADY_EXISTS,
            message: 'The product name already exists.'
        }
    }
  
    const saveProduct: Omit<Product, 'id'> = {
      name: product.name,
      description: product.description,
      price: product.price,
      count: product.count,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  
    // Create product
    try {
      await productsRepository.create(saveProduct)
    } catch {
      return {
        success: false,
        data: undefined,
        errors: ['Unexpected server error.'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'Could not get the products list due to unexpected error'
      }
    }
  
    return {
      success: true,
      data: undefined,
      message: 'Product created successfully'
    }
}

async function updateProductById( product: Omit<Product, 'id'>, id: string): Promise<Result<void>> {
    // Verification
    try{
      updateProductSchema.parse(product)
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

    let productExists = await prismaClient.product.findFirst({where: { id }})
    if (!productExists) {
      return {
        success: false,
        data: undefined,
        errors: ['Product not found'],
        errorCode: ErrorCode.USER_NOT_FOUND,
        errorType: Errors.NOT_FOUND,
        message: 'Product not found'
      }
    }
  
    // Verify that product does not have active orders
    const productHasOrders = await prismaClient.product.findUnique({
        where: {
          id
        },
        include: {
          OrderDetail: true
        }
    })

    if (productHasOrders?.OrderDetail.length! > 0) {
      return {
        success: false,
        data: undefined,
        errors: ['Product was already ordered and cannot be updated'],
        errorCode: ErrorCode.CONFLICT,
        errorType: Errors.CONFLICT,
        message: 'Product was already ordered and cannot be updated'
      }
    }
  
    // Verify that product by the same name does not already exist
    let productByNameExists : any
    if(product.name != undefined){
        productByNameExists = await prismaClient.product.findFirst({where: { id: {not: id }, name: product.name }})
    }else{
        productByNameExists = false
    }

    if (productByNameExists) {
      return {
        success: false,
        data: undefined,
        errors: ['Product with the same name already exists'],
        errorCode: ErrorCode.USER_ALREADY_EXISTS,
        errorType: Errors.ALREADY_EXISTS,
        message: 'Due to validation errors, this product cannot be updated.'
      }
    }
  
    const productToSave: Omit<Product, 'id'> = {
      name: product.name,
      description: product.description,
      price: product.price,
      count: product.count,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  
    // Update product
    try {
      await productsRepository.updateById(id, productToSave)
    } catch {
      return {
        success: false,
        data: undefined,
        errors: ['Unexpected server error.'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'Could not update the product due to unexpected error'
      }
    }
  
    return {
      success: true,
      data: undefined,
      message: 'Product updated successfully'
    }
}

async function getProductById(id: string): Promise<Result<Product | null>> {
    //Validation
    let data = { id : id }

    try{
      getProductSchema.parse(data)
    }catch(err:any){
        let errors = []

        for (let index = 0; index < err.issues.length; index++) {
            let message = err.issues[index].message;
            errors.push(message)
        }

        return {
            success: false,
            message: "Could not get product due to some invalid parameters",
            data: null,
            errorCode: ErrorCode.INVALID,
            errorType: Errors.INVALID,
            errors: errors
        }
    }

    // Get product
    let product: Product | null
  
    try {
      product = await productsRepository.getById(id)
    } catch {
      return {
        success: false,
        data: null,
        errors: ['Unexpected server error.'],
        errorCode: ErrorCode.INTERNAL_EXCEPTION,
        errorType: Errors.INTERNAL_EXCEPTION,
        message: 'Could not get the product due to unexpected error'
      }
    }
  
    if (!product) {
      return {
        success: false,
        data: null,
        errors: ['Product not found'],
        errorCode: ErrorCode.USER_NOT_FOUND,
        errorType: Errors.NOT_FOUND,
        message: 'The product was not found in the product list'
      }
    }
  
    return {
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    }
  }

  async function deleteProductById(id: string): Promise<Result<void>> {
    //Validation
    let data = { id : id }

    try{
      getProductSchema.parse(data)
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

    // Verify that product exists
    let productExists = await prismaClient.product.findFirst({where: { id }})
    if (!productExists) {
      return {
        success: false,
        data: undefined,
        errors: ['Product not found'],
        errorCode: ErrorCode.USER_NOT_FOUND,
        errorType: Errors.NOT_FOUND,
        message: 'The product was not found in the product list'
      }
    }
  
    // Verify that product does not have active orders
    const productHasOrders = await prismaClient.product.findUnique({
        where: {
          id
        },
        include: {
          OrderDetail: true
        }
    })

    if (productHasOrders?.OrderDetail.length! > 0) {
      return {
        success: false,
        data: undefined,
        errors: ['Product was already ordered and cannot be deleted'],
        errorCode: ErrorCode.CONFLICT,
        errorType: Errors.CONFLICT,
        message: 'Due to validation errors, this product cannot be deleted.'
      }
    }
  
    // Delete product
    try {
      await productsRepository.removeById(id)
    } catch {
      return {
        success: false,
        data: undefined,
        errors: ['Product not found'],
        errorCode: ErrorCode.USER_NOT_FOUND,
        errorType: Errors.NOT_FOUND,
        message: 'Due to validation errors, this product cannot be deleted.'
      }
    }
  
    return {
      success: true,
      data: undefined,
      message: 'Product deleted successfully'
    }
  }

export const productsService = {
    getListProducts,
    createProduct,
    updateProductById,
    getProductById,
    deleteProductById
}