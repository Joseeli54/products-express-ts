import { z } from 'zod'

 export const OrderSchema = z.object({
    userId: z.number().min(0),
    status: z.string(),
})