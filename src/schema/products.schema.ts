import { z } from 'zod'

 export const ProductSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number().min(0),
    count: z.number().min(0)
})