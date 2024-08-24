import {Router} from 'express'
import { login, signup, profile } from '../controllers/auth.controller'
import { errorHandler } from '../error-handler'
import authMiddleware from '../middlewares/auth.middleware'

const authRoutes = Router()

authRoutes.post('/login', errorHandler(login))
authRoutes.post('/signup', errorHandler(signup))
authRoutes.get('/profile', [authMiddleware], errorHandler(profile))

export default authRoutes