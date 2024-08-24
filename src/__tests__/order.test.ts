import { describe, expect, it, jest } from '@jest/globals';
import { ordersService } from '../services/orders.service';

jest.mock('../../src/repositories/orders.repository.ts')

const dataInvalid : any = {
    status: "Send",
}

const dataValid : any = {
    status: "Completed",
}

describe('orders', () =>{
    describe('get order route', () =>{

        describe('ordersService get: non-existent order', () => {
            it('The result returns 404 when I try to search for a order that does not exist', async () => {
                const result = await ordersService.getOrderById(20)

                expect(result.errorCode).toBe(404)
            })
        })

        describe('ordersService: status invalid', () => {
            it('Orders whose status is changed must match the following: Pending, In Progress, Completed', async () => {
                const result = await ordersService.updateOrder(2, dataInvalid.status)

                expect(result.success).toBe(false)
                expect(result.errors).toStrictEqual([
                    "Invalid enum value. Expected 'Pending' | 'In Progress' | 'Completed', received 'Send'"
                ])
            })
        })

        describe('ordersService put: non-existent order', () => {
            it('The result returns 404 when I try to update a order that does not exist', async () => {
                const result = await ordersService.updateOrder(20, dataValid.status)

                expect(result.errorCode).toBe(404)
            })
        })

    })
})