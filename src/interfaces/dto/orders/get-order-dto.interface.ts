export interface GetOrderDto {
    id: number
    userId: number
    status: string
    createdAt: Date
    updatedAt: Date
    OrderDetail: {
      product: {
        id: string
        name: string
        description: string
        count: number
        price: number
      }
    }[]
}