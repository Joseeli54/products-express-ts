export interface CreateProductRequestDto {
    name: string
    description: string
    price: number
    count: number
    createdAt : Date
    updatedAt : Date
}