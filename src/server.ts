import express, { Express, Request, Response } from "express";
import { PORT } from './secrets'
import rootRouter from "./routes/index.routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors.middleware";
import { SignUpSchema } from "./schema/users.schema";

const app:Express = express();

app.use(express.json())

app.use('/api', rootRouter);

export const prismaClient = new PrismaClient({
    log: ['query']
})

app.use(errorMiddleware)

app.listen(PORT, () => { console.log(`http://localhost: ${PORT}`) });