import { PrismaClient, Product, Role, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { init } from '@paralleldrive/cuid2';

export const usersSeed = [
    {
        email: 'felipe.arroyo@gmail.com',
        name: "Felipe Arroyo",
        password: bcrypt.hashSync("Password123!", 10),
        role: "ADMIN" as Role,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        email: 'perez.jhon@gmail.com',
        name: "Jhon Perez",
        password: bcrypt.hashSync("Password123!", 10),
        role: "ADMIN" as Role,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        email: 'carolina.aguilera@gmail.com',
        name: "Carolina Aguilera",
        password: bcrypt.hashSync("Password123!", 10),
        role: "USER" as Role,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        email: 'mariela.rodriguez@gmail.com',
        name: "Mariela Rodriguez",
        password: bcrypt.hashSync("Password123!", 10),
        role: "USER" as Role,
        createdAt: new Date(),
        updatedAt: new Date()
    },
];

export const productSeed = [
    {
        name: "Mercedes-Benz G 580",
        description: "German brand vehicle",
        count: 3,
        price: 15000.00,
        availability: "Available",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "iPhone 15 Pro",
        description: "Black titanium, white titanium, blue titanium, natural titanium",
        count: 10,
        price: 1199.99,
        availability: "Available",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Energy drinks",
        description: "Energy drinks that you can use to train physically.",
        count: 50,
        price: 2.99,
        availability: "Available",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Canned food",
        description: "Sardine, tuna, canned meat, among others.",
        count: 100,
        availability: "Available",
        price: 3,
        createdAt: new Date(),
        updatedAt: new Date()
    },
];

const prismaClient = new PrismaClient()

async function main() {
    for (const user of usersSeed) {
      await prismaClient.user.upsert({
        where: { email: user.email },
        update: {},
        create: user
      })
    }
  
    for (const product of productSeed) {
      await prismaClient.product.upsert({
        where: { name: product.name },
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