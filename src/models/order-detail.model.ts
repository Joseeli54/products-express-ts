import { Product } from "./product.model";

export interface OrderDetail {
    orderId: number
    productId: number
    count: number
    price: number
    product: Product
}