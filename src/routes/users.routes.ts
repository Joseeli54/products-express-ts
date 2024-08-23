import { Router } from "express";
import { errorHandler } from "../error-handler";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";
import { createUser, deleteUser, getUserById, listUsers, updateUser } from "../controllers/user.controller";

const usersRoutes:Router = Router()

usersRoutes.get('/', [authMiddleware, adminMiddleware], errorHandler(listUsers))
usersRoutes.get('/:id', [authMiddleware, adminMiddleware], errorHandler(getUserById))
usersRoutes.post('/', [authMiddleware, adminMiddleware], errorHandler(createUser))
usersRoutes.put('/:id', [authMiddleware, adminMiddleware], errorHandler(updateUser))
usersRoutes.delete('/:id', [authMiddleware, adminMiddleware], errorHandler(deleteUser))

export default usersRoutes