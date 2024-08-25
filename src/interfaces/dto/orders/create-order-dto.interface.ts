export interface CreateOrderDto {
    products: {
      id: number
      count_products: number
    }[]
}