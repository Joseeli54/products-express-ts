import { describe, expect, it, jest } from '@jest/globals';
import { productsService } from '../services/products.service';

jest.mock('../../src/repositories/products.repository.ts')

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
    description: "This is the test"
}

describe('products', () =>{
    describe('get product route', () =>{

        describe('productService: product not complete', () => {
            it('Should return 507 when product data is incomplete', async () => {
                const result = await productsService.createProduct(productDataIncomplete)

                expect(result.errorCode).toBe(507)
                expect(result.success).toBe(false)
                expect(result.errorType).toBe("INVALID")
            })
        })

        describe('productService: Products with the same name', () => {
            it('It shouldnt let me create a product with the same name and give me a 501 error code.', async () => {
                const result = await productsService.createProduct(alreadyNameProduct)

                expect(result.success).toBe(false)
                expect(result.errorCode).toBe(501)
                expect(result.errors).toStrictEqual([
                    "Already Exists"
                ])
            })
        })

        describe('productService Create: data invalid', () => {
            it('If you try to create a product with invalid data, it should give you an error message about the problem.', async () => {
                const result = await productsService.createProduct(dataInvalidCreate)

                expect(result.success).toBe(false)
                expect(result.errors).toStrictEqual([
                    "Expected string, received number",
                    "Expected string, received number",
                    "Expected number, received string",
                    "Number must be greater than or equal to 0"
                ])
            })
        })

        describe('productService get: non-existent product', () => {
            it('The result returns 404 when I try to search for a product that does not exist', async () => {
                const result = await productsService.getProductById(1000)

                expect(result.errorCode).toBe(404)
            })
        })

        describe('productService put: non-existent product', () => {
            it('The result returns 404 when I try to update a product that does not exist', async () => {
                const result = await productsService.updateProductById(productEdit, 1000)

                expect(result.errorCode).toBe(404)
            })
        })

        describe('productService Update: data invalid', () => {
            it('If you try to update a product with invalid data, it should give you an error message about the problem.', async () => {
                const result = await productsService.createProduct(dataInvalidUpdate)

                expect(result.success).toBe(false)
                expect(result.errors).toStrictEqual([
                    "Required",
                    "Number must be greater than or equal to 0",
                    "Required"
                ])
            })
        })
    })
})