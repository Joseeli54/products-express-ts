import { describe, expect, it, jest } from '@jest/globals';
import { loginService } from '../services/Auth/login.service';
import { signUpService } from '../services/Auth/signup.service';
import { beforeEach } from 'node:test';
import { usersRepository } from '../repositories/users.repository';
import { Role } from '../types/roles.model';
import { hashSync } from 'bcrypt';

jest.mock('../../src/repositories/users.repository.ts')

let userLogin = {
    email: 'test@gmail.com',
    password: 'abc123'
}

beforeEach(() => {
    jest.clearAllMocks()
  
    usersRepository.create({
      name: 'John',
      email: userLogin.email,
      password: hashSync(userLogin.password, 10),
      role: Role.USER
    })
})

describe('loginService: User login', () => {
    it('User logging in with invalid password, should mark the error, return false, and error code 400', async () => {
        const result = await loginService.login(userLogin.email, 'Incorrect123')

        expect(result.success).toBe(false)
        expect(result.errorCode).toBe(400)
        expect(result.errors?.length! > 0).toBe(true)
    })

    it('User registration with a non-existing email should flag error, return false and error code 404.', async () => {
        const result = await loginService.login('test200@gmail.com', userLogin.password)

        expect(result.success).toBe(false)
        expect(result.errorCode).toBe(404)
        expect(result.errors?.length! > 0).toBe(true)
    })

    it('The login must return a token for user authentication.', async () => {
        const result = await loginService.login(userLogin.email, userLogin.password)

        expect(result.data?.token).toBeTruthy()
    })

    it('Intentar iniciar sesión con un correo electrónico no válido debería mostrar un mensaje de error', async () => {
        const result : any = await loginService.login('test200', "123")

        expect(result.success).toBe(false)
        expect(result.errors).toStrictEqual([
            "Invalid email",
            "String must contain at least 6 character(s)"
        ])
    })


})