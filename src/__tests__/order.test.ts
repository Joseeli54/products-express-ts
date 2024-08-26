import { describe, expect, it, jest } from '@jest/globals';
import { ordersService } from '../services/orders.service';
import { ordersRepository } from '../repositories/orders.repository';

const dataInvalid : any = {
    status: "Send",
}

const dataValid : any = {
    status: "Completed",
}

describe('orders', () =>{
    describe('get order route', () =>{

        describe('ordersService get: non-existent order', () => {
            it('The result returns null when I try to search for a order that does not exist', async () => {
                const result = await ordersRepository.getById(1000)

                expect(result).toBe(null)
            })
        })

        describe('ordersService: status invalid', () => {
            it('Orders whose status is changed must match the following: Pending, In Progress, Completed', async () => {
                const result = await ordersRepository.statusIncorrect("Go")

                expect(result).toBe(true)
            })
        })

    })
})