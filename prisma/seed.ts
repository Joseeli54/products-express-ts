import { PrismaClient, Product, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { init } from '@paralleldrive/cuid2';

const length = 24; // 50% odds of collision after ~51,386,368 ids
const cuid = init({ length });

export const usersSeed: User[] = [
    {
        id: 1,
        email: 'felipe.arroyo@gmail.com',
        name: "Felipe Arroyo",
        password: bcrypt.hashSync("Password123!", 10),
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        email: 'perez.jhon@gmail.com',
        name: "Jhon Perez",
        password: bcrypt.hashSync("Password123!", 10),
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        email: 'carolina.aguilera@gmail.com',
        name: "Carolina Aguilera",
        password: bcrypt.hashSync("Password123!", 10),
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 4,
        email: 'mariela.rodriguez@gmail.com',
        name: "Mariela Rodriguez",
        password: bcrypt.hashSync("Password123!", 10),
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date()
    },
];

export const productSeed: Product[] = [
    {
        id: cuid(),
        name: "Mercedes-Benz G 580",
        description: "German brand vehicle",
        count: 3,
        price: 15000.00,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: cuid(),
        name: "iPhone 15 Pro",
        description: "Black titanium, white titanium, blue titanium, natural titanium",
        count: 10,
        price: 1199.99,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: cuid(),
        name: "Energy drinks",
        description: "Energy drinks that you can use to train physically.",
        count: 50,
        price: 2.99,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: cuid(),
        name: "Canned food",
        description: "Sardine, tuna, canned meat, among others.",
        count: 100,
        price: 3,
        createdAt: new Date(),
        updatedAt: new Date()
    },
];

const prismaClient = new PrismaClient()

async function main() {
    for (const user of usersSeed) {
      await prismaClient.user.upsert({
        where: { id: user.id },
        update: {},
        create: user
      })
    }
  
    for (const product of productSeed) {
      await prismaClient.product.upsert({
        where: { id: product.id },
        update: {},
        create: product
      })
    }
}

main()
  .then(async () => {
    await prismaClient.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prismaClient.$disconnect()
    process.exit(1)
  })