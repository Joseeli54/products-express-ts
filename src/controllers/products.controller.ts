import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../server";
import { ProductSchema } from "../schema/products.schema";
import { NotFoundException } from "../exceptions/not-found.exception";
import { ErrorCode } from "../exceptions/root.exception";
import { productsService } from "../services/products.service";
import { GetListProductsResponseDto } from "../interfaces/dto/products/get-list-products-dto.interface";
import { CreateProductRequestDto } from "../interfaces/dto/products/create-product-dto.interface";
import { UpdateProductRequestDto } from "../interfaces/dto/products/update-product-dto.interface";
import { GetProductByIdResponseDto } from "../interfaces/dto/products/get-product-by-id-dto.interface";
import { InternalException } from "../exceptions/internal-exception.exception";
import { Errors } from "../types/errors.model";

export const listProduct = async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const skip = (page - 1) * limit
    const serviceResult = await productsService.getListProducts(skip, limit)

    if(!serviceResult.success || !serviceResult.data) throw new InternalException('Something went wrong!', Errors.INTERNAL_EXCEPTION, ErrorCode.INTERNAL_EXCEPTION)

    const response: GetListProductsResponseDto = {
        products: serviceResult.data
    }

    res.json(response)
}

export const createProduct = async (req: Request, res: Response) => {
    ProductSchema.parse(req.body)

    try{
        const body : CreateProductRequestDto = req.body
        const serviceResult = await productsService.createProduct(body)
        res.json(serviceResult)
    } catch(err){
        throw new NotFoundException('Product not found.', ErrorCode.USER_NOT_FOUND)
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try{
        const body : UpdateProductRequestDto = req.body
        const id = req.params.id
        const serviceResult = await productsService.updateProductById(body, id)
        res.json(serviceResult)
    } catch(err){
        throw new NotFoundException('Product not found.', ErrorCode.USER_NOT_FOUND)
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try{
        const id = req.params.id
        const serviceResult = await productsService.deleteProductById(id)
        res.json(serviceResult)
    }catch{
        throw new NotFoundException('Product not found.', ErrorCode.USER_NOT_FOUND)
    }
}

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id
        const serviceResult = await productsService.getProductById(id)
      
        if (!serviceResult.success || !serviceResult.data) throw new InternalException('Something went wrong!', Errors.INTERNAL_EXCEPTION, ErrorCode.INTERNAL_EXCEPTION)

        const response: GetProductByIdResponseDto = {
            name: serviceResult.data.name,
            description: serviceResult.data.description,
            price: serviceResult.data.price,
            count: serviceResult.data.count,
            createdAt: serviceResult.data.createdAt,
            updatedAt: serviceResult.data.updatedAt
        }
        res.json(response)

    }catch{
        throw new NotFoundException('Product not found.', ErrorCode.USER_NOT_FOUND)
    }
}