import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../server";
import { ProductSchema } from "../schema/products.schema";
import { NotFoundException } from "../exceptions/not-found.exception";
import { ErrorCode, HttpException } from "../exceptions/root.exception";
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

    const response: GetListProductsResponseDto = {
        products: serviceResult.data
    }

    return res.json({success: true, response, message: "The product list is obtain successfully"})
}

export const createProduct = async (req: Request, res: Response) => {
    const body : CreateProductRequestDto = req.body
    const serviceResult = await productsService.createProduct(body)
    return res.json(serviceResult)
}

export const updateProduct = async (req: Request, res: Response) => {
    const body : UpdateProductRequestDto = req.body
    const id = Number(req.params.id)
    const serviceResult = await productsService.updateProductById(body, id)
    return res.json(serviceResult)
}

export const deleteProduct = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const serviceResult = await productsService.deleteProductById(id)
    return res.json(serviceResult)
}

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const serviceResult = await productsService.getProductById(id)

    const response: GetProductByIdResponseDto = {
        name: serviceResult.data!.name,
        description: serviceResult.data!.description,
        price: serviceResult.data!.price,
        count: serviceResult.data!.count,
        availability: serviceResult.data!.availability,
        createdAt: serviceResult.data!.createdAt,
        updatedAt: serviceResult.data!.updatedAt
    }

    return res.json({success: true, response, message: "Product obtain successfully"})
}