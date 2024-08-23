import { Role } from "../../../types/roles.model"

export interface CreateUserDto {
  name: string
  email: string
  password: string
  role: Role
  createdAt: Date
  updatedAt: Date
}