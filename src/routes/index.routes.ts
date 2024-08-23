import { Router } from "express";
import authRoutes from "./auth.routes";
import productsRoutes from "./products.routes";
import orderRoutes from "./orders.routes";
import usersRoutes from "./users.routes";

const rootRouter: Router = Router()

rootRouter.use('/auth', authRoutes)
rootRouter.use('/products', productsRoutes)
rootRouter.use('/orders', orderRoutes)
rootRouter.use('/users', usersRoutes)

export default rootRouter;