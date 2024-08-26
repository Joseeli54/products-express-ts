import { describe, expect, it, jest } from '@jest/globals';
import { productsService } from '../services/products.service';
import { productsRepository } from '../repositories/products.repository';
import { beforeEach } from 'node:test';

beforeEach(() => {
    jest.clearAllMocks()
  
    productsRepository.create({
        name: "Mercedes-Benz G 510",
        description: "German brand veh12cle",
        count: 3,
        price: 15000.00,
        availability: "Available",
        createdAt: new Date(),
        updatedAt: new Date()
    })
})

const productDataIncomplete : any = {
    price: 10.0,
    count: 10,
    createdAt: new Date,
    updatedAt: new Date
}

const alreadyNameProduct : any = {
    name: "Mercedes-Benz G 580",
    description: "A sweet tea 7",
    price: 10.0,
    count: 10,
    createdAt: new Date,
    updatedAt: new Date
}

const dataInvalidCreate : any = {
    name: 12,
    description: 849,
    price: "10.0",
    count : -1
}

const dataInvalidUpdate : any = {
    name : "Tea 26",
    price : -40
}

const productEdit : any = {
    "count": 10
}

describe('products', () =>{
    describe('get product route', () =>{

        describe('productService: Products with the same name', () => {
            it('It shouldnt let me create a product with the same name', async () => {
                const result = await productsRepository.sameName(alreadyNameProduct.name, "Mercedes-Benz G 580")
                expect(result).toBe(true)
            })
        })


        describe('productService get: non-existent product', () => {
            it('The result returns null when I try to search for a product that does not exist', async () => {
                const result = await productsRepository.getById(1000)
                expect(result).toBe(null)
            })
        })

        describe('productService put: Change count product', () => {
            it('The result returns true when I try to update a product', async () => {
                const result = await productsService.updateProductById(productEdit, 1)
                expect(result.success).toBe(true)
            })
        })
    })
})