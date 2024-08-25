export interface GetOrdersListDto {
    orders: {
      id: number
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
    }[]
  }