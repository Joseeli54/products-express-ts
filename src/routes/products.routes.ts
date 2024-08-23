import { Router } from "express";
import { errorHandler } from "../error-handler";
import { createProduct, deleteProduct, getProductById, listProduct, updateProduct } from "../controllers/products.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";

const productsRoutes:Router = Router()

productsRoutes.post('/', [authMiddleware, adminMiddleware], errorHandler(createProduct))
productsRoutes.put('/:id', [authMiddleware, adminMiddleware], errorHandler(updateProduct))
productsRoutes.delete('/:id', [authMiddleware, adminMiddleware], errorHandler(deleteProduct))
productsRoutes.get('/', [authMiddleware, ], errorHandler(listProduct))
productsRoutes.get('/:id', [authMiddleware], errorHandler(getProductById))

export default productsRoutes