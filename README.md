# Product Express API

This is a test project used to create an example API with the Node.js tool, TypeScript, in conjunction with Prisma (PostgreSQL).

# Tools to install before running the API

- Install the latest version of [Node (LTS)](https://nodejs.org/en "Node (LTS)")
- Install any tool that allows you to read the code and execute it from a terminal (PowerShell can also be used)
- Install the latest version of [PostgreSQ](https://www.postgresql.org/ "PostgreSQ").
- Install [Git](https://git-scm.com/downloads "Git") on your local machine, to clone the current repository.

# Installation steps
- #### Step 1: Create a new directory where you will clone the project, open a terminal positioned in that directory and run:
`$ git clone https://github.com/Joseeli54/products-express-ts.git`
- #### Step 2: Redirect your location to that cloned folder from the terminal:
`$ cd /path/to/products-express-ts`
- #### Step 3: Install the dependencies required for API execution:
`$ npm install`
- #### Step 4: In the project directory this file `.env.example`, copy the file and name it `.env`. It can also be done from the terminal:
`$ cp example.env .env`

# Configure Prisma and the PostgreSQL database

To configure the database you need to have PostgreSQL installed previously.
- Creation of the database in PostgreSQL (pgAdmin), with `UTF8` encoding from query tools.

`CREATE DATABASE express_ts WITH ENCODING 'UTF8';`

-  In the `.env` file there is a variable called DATABASE_URL, here the url that will link to the Prisma tool is specified. `user` **(your username)**, `password` **(your password)**, `port` ** (5432)** and `db_name` **(express_ts)** of the PostgreSQL driver must be specified.

`DATABASE_URL="postgresql://user:password@localhost:port/db_name"`

- After specifying the handler data and the url, proceed to execute the following command to migrate the database tables with the help of Prisma ORM tool:

`$npx prisma migrate dev`

- The database is loaded with seeds data of test users and products for the development environment. (It is recommended not to use this in production, since some of the test users are administrators). Proceed to execute the following command:

`$npx prisma db seed`

# Running Prisma Studio
After migrating the tables and their data to `express_ts`, you can display the tables in Prisma Studio by executing the following command in the project folder:

`npx prism studio` 

This will allow you to view user, product and order records easily, as well as remove and modify them for test cases.
