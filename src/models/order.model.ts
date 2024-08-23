import { OrderDetail } from "./order-detail.model"

export interface Order {
    id: number
    userId: number
    status: string
    OrderDetail: OrderDetail[]
    createdAt: Date
    updatedAt: Date
  }