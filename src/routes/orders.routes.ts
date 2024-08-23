import { Router } from "express";
import { errorHandler } from "../error-handler";
import { createOrder, getOrderById, listOrders, listOrdersByUserId, listOrdersCurrentUser, deleteOrder, updateOrder } from "../controllers/orders.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";

const orderRoutes:Router = Router()

orderRoutes.get('/', [authMiddleware, adminMiddleware], errorHandler(listOrders))
orderRoutes.get('/userById/:id', [authMiddleware, adminMiddleware], errorHandler(listOrdersByUserId))
orderRoutes.get('/currentUser', [authMiddleware], errorHandler(listOrdersCurrentUser))
orderRoutes.get('/order/:id', [authMiddleware, adminMiddleware], errorHandler(getOrderById))
orderRoutes.post('/', [authMiddleware], errorHandler(createOrder))
orderRoutes.delete('/:id', [authMiddleware, adminMiddleware], errorHandler(deleteOrder))
orderRoutes.put('/:id', [authMiddleware, adminMiddleware], errorHandler(updateOrder))

export default orderRoutes