import { InternalException } from '../exceptions/internal-exception.exception'
import { NotFoundException } from '../exceptions/not-found.exception'
import { ErrorCode } from '../exceptions/root.exception'
import { UnprocessableEntity } from '../exceptions/validation.exception'
import { Result } from '../interfaces/results/results.interface'
import { Product } from '../models/product.model'
import { ordersRepository } from '../repositories/orders.repository'
import { productsRepository } from '../repositories/products.repository'
import { getProductSchema, ProductSchema, updateProductSchema } from '../schema/products.schema'
import { prismaClient } from '../server'
import { Errors } from '../types/errors.model'

async function getListProducts(skip: number, limit: number): Promise<Result<Product[]>> {
  //get product list, configure the pagination with skip and limit parameters
  let products: Product[]
  let count: number

  if(limit.toString() == "NaN"){
    throw new UnprocessableEntity(["The 'limit' parameters isn't exist"], "The 'limit' parameters are not being included in the sent request. Example:'/?limit=n'", Errors.INVALID, ErrorCode.INVALID) 
    // errors: errors
    // errorCode: ErrorCode.INVALID,
    // errorType: Errors.INVALID,
    // message: 'Could not create product due to some invalid parameters' 
  }

  if(skip.toString() == "NaN"){
    throw new UnprocessableEntity(["The 'page' parameters isn't exist"], "The 'page' parameters are not being included in the sent request. Example:'/?page=n'", Errors.INVALID, ErrorCode.INVALID) 
    // errors: errors
    // errorCode: ErrorCode.INVALID,
    // errorType: Errors.INVALID,
    // message: 'Could not create product due to some invalid parameters' 
  }
    
  try {
    products = await productsRepository.getRange(skip, limit)
    count = await productsRepository.count()
  } catch (err) {
    throw new InternalException('Server error, contact an administrator.', err,  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
    //   errors: err,
    //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
    //   errorType: Errors.INTERNAL_EXCEPTION,
    //   message: 'Server error, contact an administrator.'
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

    //validation the format type and data of products
    try{
        ProductSchema.parse(product)
    }catch(err:any){
        throw new UnprocessableEntity(err.issues, "Could not create product due to some invalid parameters", Errors.INVALID, ErrorCode.INVALID)  
        // errors: errors
        // errorCode: ErrorCode.INVALID,
        // errorType: Errors.INVALID,
        // message: 'Could not create product due to some invalid parameters'
    }

    let productExists = await prismaClient.product.findFirst({where: { name : product.name }})
    if(productExists){
        throw new UnprocessableEntity(['There is a product that has the same name'], "The order could not be deleted because one with the same name already exists.", Errors.CONFLICT, ErrorCode.CONFLICT)  
        //   errors: ['There is a product that has the same name'],
        //   errorCode: ErrorCode.CONFLICT,
        //   errorType: Errors.CONFLICT,
        //   message: 'The order could not be deleted because one with the same name already exists.'
    }
  
    const saveProduct: Omit<Product, 'id'> = {
      name: product.name,
      description: product.description,
      price: product.price,
      count: product.count,
      availability: "Available",
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  
    // Create product
    try {
      await productsRepository.create(saveProduct)
    } catch (err) {
      console.log(err)
      throw new InternalException('Server error, contact an administrator.', err,  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
      //   errors: err,
      //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
      //   errorType: Errors.INTERNAL_EXCEPTION,
      //   message: 'Server error, contact an administrator.'
    }
  
    return {
      success: true,
      data: undefined,
      message: 'Product created successfully'
    }
}

async function updateProductById( product: Omit<Product, 'id'>, id: number): Promise<Result<void>> {
    // Verification
    try{
      updateProductSchema.parse(product)
    }catch(err:any){
        throw new UnprocessableEntity(err.issues, "Could not create product due to some invalid parameters", Errors.INVALID, ErrorCode.INVALID)  
        // errors: errors
        // errorCode: ErrorCode.INVALID,
        // errorType: Errors.INVALID,
        // message: 'Could not create product due to some invalid parameters'
    }

    let productExists = await prismaClient.product.findFirst({where: { id }})
    if (!productExists) {
      throw new NotFoundException("The product not found.", ErrorCode.USER_NOT_FOUND, Errors.NOT_FOUND, ['Product not found'])
      //   errors: ['Product not found'],
      //   errorCode: ErrorCode.USER_NOT_FOUND,
      //   errorType: Errors.NOT_FOUND,
      //   message: 'The product not found.'
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

    //I verify that this product does not have pending or ongoing orders. If so, the update is cancelled.
    if (productHasOrders?.OrderDetail.length! > 0) {
      let IncompleteOrders = false;
      
      for (let index = 0; index < productHasOrders!.OrderDetail.length; index++) {
        let orderDetail = productHasOrders!.OrderDetail[index]

        if(orderDetail.productId = id){
          let orderProduct = await ordersRepository.getById(orderDetail.orderId)

          if(orderProduct!.status == 'Pending' || orderProduct!.status == 'In Progress'){
            IncompleteOrders = true;
          }

        }
      }

      //If there are incomplete orders, the error is returned.
      if(IncompleteOrders)
        throw new UnprocessableEntity(['The product has already been ordered, and has orders pending or in progress. Cannot be updated for now.'],
        "The product has already been ordered, and has orders pending or in progress. Cannot be updated for now.", Errors.CONFLICT, ErrorCode.CONFLICT)  
        // errors: ['The product has already been ordered, and has orders pending or in progress. Cannot be updated for now.']
        // errorCode: ErrorCode.CONFLICT,
        // errorType: Errors.CONFLICT,
        // message: 'The product has already been ordered, and has orders pending or in progress. Cannot be updated for now.'
    }
  
    // Verify that product by the same name does not already exist
    let productByNameExists : any
    if(product.name != undefined){
        productByNameExists = await prismaClient.product.findFirst({where: { id: {not: id }, name: product.name }})
    }else{
        productByNameExists = false
    }

    if (productByNameExists) {
      throw new NotFoundException("Due to validation errors, this product cannot be updated.", ErrorCode.USER_ALREADY_EXISTS, Errors.ALREADY_EXISTS, ['Product with the same name already exists'])
      //   errors: ['Product with the same name already exists'],
      //   errorCode: ErrorCode.USER_ALREADY_EXISTS,
      //   errorType: Errors.ALREADY_EXISTS,
      //   message: 'Due to validation errors, this product cannot be updated.'
    }

    if(product.count != undefined){
      if(product.count > 0){
        product.availability = "Available";
      }
    }
  
    const productSave: Omit<Product, 'id'> = {
      name: product.name,
      description: product.description,
      price: product.price,
      count: product.count,
      availability: product.availability,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  
    // Update product
    try {
      await productsRepository.updateById(id, productSave)
    } catch (err) {
      throw new InternalException('Server error, contact an administrator.', err,  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
      //   errors: err,
      //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
      //   errorType: Errors.INTERNAL_EXCEPTION,
      //   message: 'Server error, contact an administrator.'
    }
  
    return {
      success: true,
      data: undefined,
      message: 'Product updated successfully'
    }
}

async function getProductById(id: number): Promise<Result<Product | null>> {
    //Validation
    let data = { id : id }

    try{
      getProductSchema.parse(data)
    }catch(err:any){
        throw new UnprocessableEntity(err.issues, "Could not get product due to some invalid parameters", Errors.INVALID, ErrorCode.INVALID)  
        // errors: errors
        // errorCode: ErrorCode.INVALID,
        // errorType: Errors.INVALID,
        // message: 'Could not get product due to some invalid parameters'
    }

    // Get product
    let product: Product | null
  
    try {
      product = await productsRepository.getById(id)
    } catch (err) {
      throw new InternalException('Server error, contact an administrator.', err,  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
      //   errors: err,
      //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
      //   errorType: Errors.INTERNAL_EXCEPTION,
      //   message: 'Server error, contact an administrator.'
    }
  
    if (!product) {
      throw new NotFoundException("The product was not found in the product list", ErrorCode.USER_NOT_FOUND, Errors.NOT_FOUND, ['Product not found'])
      //   errors: ['Product with the same name already exists'],
      //   errorCode: ErrorCode.USER_ALREADY_EXISTS,
      //   errorType: Errors.ALREADY_EXISTS,
      //   message: 'Due to validation errors, this product cannot be updated.'      
    }
  
    return {
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    }
}

async function deleteProductById(id: number): Promise<Result<void>> {
  //Validation
  let data = { id : id }

  try{
    getProductSchema.parse(data)
  }catch(err:any){
      throw new UnprocessableEntity(err.issues, "Could not create product due to some invalid parameters", Errors.INVALID, ErrorCode.INVALID)  
      // errors: errors
      // errorCode: ErrorCode.INVALID,
      // errorType: Errors.INVALID,
      // message: 'Could not create product due to some invalid parameters'
  }

  // Verify that product exists
  let productExists = await prismaClient.product.findFirst({where: { id }})
  if (!productExists) {
    throw new NotFoundException("The product was not found in the product list", ErrorCode.USER_NOT_FOUND, Errors.NOT_FOUND, ['Product not found'])
    //   errors: ['Product with the same name already exists'],
    //   errorCode: ErrorCode.USER_ALREADY_EXISTS,
    //   errorType: Errors.ALREADY_EXISTS,
    //   message: 'Due to validation errors, this product cannot be updated.'   
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
    throw new UnprocessableEntity(['Product was already ordered and cannot be deleted'], 
      "Due to validation errors, this product cannot be deleted.", Errors.CONFLICT, ErrorCode.CONFLICT)  
    // errors: ['Product was already ordered and cannot be deleted']
    // errorCode: ErrorCode.CONFLICT,
    // errorType: Errors.CONFLICT,
    // message: 'Due to validation errors, this product cannot be deleted.'   
  }

  // Delete product
  try {
    await productsRepository.removeById(id)
  } catch (err) {
    throw new InternalException('Server error, contact an administrator.', err,  ErrorCode.INTERNAL_EXCEPTION, Errors.INTERNAL_EXCEPTION)
    //   errors: err,
    //   errorCode: ErrorCode.INTERNAL_EXCEPTION,
    //   errorType: Errors.INTERNAL_EXCEPTION,
    //   message: 'Server error, contact an administrator.'
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