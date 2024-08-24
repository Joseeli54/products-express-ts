export interface GetListProductsResponseDto {
    products: {
      id: string
      name: string
      description: string
      availability: string
      price: number
      count: number
    }[]
}