export interface GetOrderDto {
    id: number
    userId: number
    status: string
    createdAt: Date
    updatedAt: Date
    OrderDetail: {
      product: {
        id: number
        name: string
        description: string
        count: number
        price: number
      }
    }[]
}