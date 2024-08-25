export interface GetListProductsResponseDto {
    products: {
      id: number
      name: string
      description: string
      availability: string
      price: number
      count: number
    }[]
}