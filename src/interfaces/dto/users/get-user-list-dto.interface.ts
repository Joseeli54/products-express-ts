export interface GetListUsersDto {
    users: {
      id: number
      name: string
      email: string
      createdAt: Date
      updatedAt: Date
      role: string
    }[]
}