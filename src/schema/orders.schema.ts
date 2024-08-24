import { z } from 'zod'

export const OrderSchema = z.object({
    status: z.enum(['Pending', 'In Progress', 'Completed'])
})

export const getOrderSchema = z.object({
    id: z.number().optional()
})