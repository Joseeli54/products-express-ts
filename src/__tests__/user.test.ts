import { describe, expect, it, jest } from '@jest/globals';
import { loginService } from '../services/Auth/login.service';
import { signUpService } from '../services/Auth/signup.service';
import { beforeEach } from 'node:test';
import { usersRepository } from '../repositories/users.repository';
import { Role } from '../types/roles.model';
import { hashSync } from 'bcrypt';
import { usersService } from '../services/users.service';
import { UpdateUserDto } from '../interfaces/dto/users/update-user-dto.interface';

jest.mock('../../src/repositories/users.repository.ts')

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
    it('If we send incomplete data, an error message should be sent indicating this.', async () => {
        const result = await usersService.createUser(user, "")

        expect(result.success).toBe(false)
        expect(result.errorCode).toBe(407)
        expect(result.errors).toStrictEqual(["String must contain at least 6 character(s)"])
    })

    it('User registration with a non-existing email should flag error, return false and error code 404.', async () => {
        const result = await usersService.getUserById(100)

        expect(result.success).toBe(false)
        expect(result.errorCode).toBe(404)
        expect(result.errors?.length! > 0).toBe(true)
    })

    describe('usersService: role invalid', () => {
        it('Orders whose role is changed must match the following: ADMIN, USER', async () => {
            const result = await usersService.updateUser(2, roleInvalid, "ChangePassword123")

            expect(result.success).toBe(false)
            expect(result.errors).toStrictEqual([
                "Invalid enum value. Expected 'USER' | 'ADMIN', received 'CLIENTE'"
            ])
        })
    })


})