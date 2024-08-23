export interface GetListProductsResponseDto {
    products: {
      id: string
      name: string
      description: string
      price: number
      count: number
    }[]
}