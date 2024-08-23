import { ErrorCode } from "../../exceptions/root.exception"
import { Errors } from "../../types/errors.model"
import { Pagination } from "./pagination.interface"

export interface Result<T> {
  success: boolean
  message: string
  data: T
  errorCode?: ErrorCode
  errorType?: Errors
  errors?: string[]
  pagination?: Pagination
}