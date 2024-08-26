import { describe, expect, it, jest } from '@jest/globals';
import { beforeEach } from 'node:test';
import { usersRepository } from '../repositories/users.repository';
import { Role } from '../types/roles.model';
import { hashSync } from 'bcrypt';

let user = {
    name: "Jose",
    email: "joseprez@hotmail.com",
    role: Role.ADMIN
}

let roleInvalid : any = {
    role: "CLIENTE" as Role
}

beforeEach(() => {
    jest.clearAllMocks()
  
    usersRepository.create({
      name: 'John',
      email: user.email,
      password: hashSync("Password123*", 10),
      role: Role.USER
    })
})

describe('users', () => {
    it('If we send data that is invalid or does not meet the conditions, return null.', async () => {  
        const result2 = await usersRepository.getByEmail("data.error@gmail.com")

        expect(result2).toBe(null)
    })

    it('User registration with a non-existing email should flag error, return null.', async () => {
        const result = await usersRepository.getById(1000);

        expect(result).toBe(null)
    })
})