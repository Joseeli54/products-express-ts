export interface CreateOrderDto {
    products: {
      id: string
      count_products: number
    }[]
}