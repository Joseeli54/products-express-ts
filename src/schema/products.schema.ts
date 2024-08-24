import { z } from 'zod'

 export const ProductSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number().min(0),
    count: z.number().min(0)
})

export const updateProductSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    count: z.number().min(0).optional()
})

export const getProductSchema = z.object({
    id: z.string().optional()
})