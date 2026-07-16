import { buildServer } from './helpers/server.js';
import { cleanDb } from './helpers/db.js';
import prisma from '../src/config/DatabaseConfig.js';
import { hashPassword } from '../src/utils/JwtToken.js';
import { generateId } from '../src/utils/IdGenerator.js';

describe('User API Tests', () => {
  let server;

  beforeAll(async () => {
    server = await buildServer();
  });

  beforeEach(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await server.stop();
    await prisma.$disconnect();
  });

  describe('POST /register', () => {
    test('should register successfully with valid payload', async () => {
      const email = `john_${generateId()}@example.com`;
      const response = await server.inject({
        method: 'POST',
        url: '/register',
        payload: {
          name: 'John Doe',
          email,
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.message).toBe('User Created');
      expect(body.data).toHaveProperty('id');
      expect(body.data.name).toBe('John Doe');
      expect(body.data.email).toBe(email);
      expect(body.data).toHaveProperty('password');
    });

    test('should fail when parameters are missing', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/register',
        payload: {
          name: 'John Doe',
          email: '',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Please fill all the fields');
    });

    test('should fail when email is already registered', async () => {
      const email = `john_${generateId()}@example.com`;
      const id = generateId();

      await prisma.users.create({
        data: {
          user_id: id,
          name: 'Existing User',
          email,
          password: hashPassword('password123'),
        },
      });

      const response = await server.inject({
        method: 'POST',
        url: '/register',
        payload: {
          name: 'John Doe',
          email,
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Email Already Use');
    });
  });

  describe('POST /login', () => {
    let email;
    let userId;

    beforeEach(async () => {
      email = `john_${generateId()}@example.com`;
      userId = generateId();

      await prisma.users.create({
        data: {
          user_id: userId,
          name: 'John Doe',
          email,
          password: hashPassword('password123'),
        },
      });
    });

    test('should login successfully with valid credentials', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email,
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.message).toBe('User Logged successfully');
      expect(body.data).toHaveProperty('accessToken');
    });

    test('should fail with wrong password', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email,
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Invalid email or password');
    });

    test('should fail when user does not exist', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: `nonexistent_${generateId()}@example.com`,
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Invalid email or password');
    });

    test('should fail when email is empty', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: '',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Email is not allowed to be Empty');
    });

    test('should fail when password is empty', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email,
          password: '',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Password is not allowed to be Empty');
    });
  });

  describe('GET /users/me', () => {
    test('should successfully retrieve current user profile with valid token', async () => {
      const email = `john_${generateId()}@example.com`;
      const userId = generateId();

      await prisma.users.create({
        data: {
          user_id: userId,
          name: 'John Doe',
          email,
          password: hashPassword('password123'),
        },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email,
          password: 'password123',
        },
      });

      const { accessToken } = JSON.parse(loginResponse.payload).data;

      const response = await server.inject({
        method: 'GET',
        url: '/users/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.message).toBe('User retrieved');
      expect(body.data.id).toBe(userId);
      expect(body.data.name).toBe('John Doe');
      expect(body.data.email).toBe(email);
    });

    test('should fail when authorization header is missing', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/users/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('missing authentication token');
    });

    test('should fail with invalid or expired token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/users/me',
        headers: {
          Authorization: 'Bearer invalid-token-string',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('invalid authentication token or token Expired');
    });
  });
});
