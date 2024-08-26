import { describe, expect, it, jest } from '@jest/globals';
import { loginService } from '../services/Auth/login.service';
import { beforeEach } from 'node:test';
import { usersRepository } from '../repositories/users.repository';
import { Role } from '../types/roles.model';
import { hashSync } from 'bcrypt';

let userLogin = {
    email: 'felipe.arroyo@gmail.com',
    password: 'Password123!'
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
    it('User logging in with invalid password, should return false', async () => {
        const result = await usersRepository.comparePassword(userLogin.password, 'Incorrect123')

        expect(result).toBe(false)
    })

    it('User registration with a non-existing email should return false', async () => {
        const result = await usersRepository.getExistsEmail('test200@gmail.com')

        expect(result).toBe(false);
    })

    it('The login must return a token for user authentication.', async () => {
        const result = await loginService.login(userLogin.email, userLogin.password)

        expect(result.data?.token).toBeTruthy()
    })

})