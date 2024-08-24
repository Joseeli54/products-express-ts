export interface UpdateProductRequestDto {
    name: string
    description: string
    price: number
    count: number
    availability: string
    createdAt : Date
    updatedAt : Date
  }