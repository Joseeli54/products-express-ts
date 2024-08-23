import { Role } from "../../../types/roles.model"

export interface UpdateUserDto {
  name: string
  email: string
  password: string
  role: Role
  createdAt: Date
  updatedAt: Date
}