import express, { Express, Request, Response } from "express";
import { PORT } from './secrets'
import rootRouter from "./routes/index.routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors.middleware";
import { SignUpSchema } from "./schema/users.schema";
import { setupSwagger } from "./swagger/swagger";

const app:Express = express();

app.use(express.json())

app.use('/api', rootRouter);

export const prismaClient = new PrismaClient({
    log: ['query']
})

app.use(errorMiddleware)

setupSwagger(app)

app.get('/', (req, res) => {
    res.send('Welcome to the server management products!')
})

app.listen(PORT, () => { console.log(`http://localhost:${PORT}`) });