import { Product } from "./product.model";

export interface OrderDetail {
    orderId: number
    productId: string
    count: number
    price: number
    product: Product
}