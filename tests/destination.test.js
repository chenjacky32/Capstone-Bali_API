import { buildServer } from './helpers/server.js';
import { cleanDb } from './helpers/db.js';
import prisma from '../src/config/DatabaseConfig.js';
import { hashPassword } from '../src/utils/JwtToken.js';
import { generateId } from '../src/utils/IdGenerator.js';

describe('Destination API Tests', () => {
  let server;
  let token;
  let userId;

  beforeAll(async () => {
    server = await buildServer();
  });

  beforeEach(async () => {
    await cleanDb();

    userId = generateId();
    const email = `admin_${generateId()}@example.com`;

    await prisma.users.create({
      data: {
        user_id: userId,
        name: 'Admin User',
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
    token = JSON.parse(loginResponse.payload).data.accessToken;
  });

  afterAll(async () => {
    await server.stop();
    await prisma.$disconnect();
  });

  describe('POST /destinations', () => {
    test('should successfully add destination when payload is complete and token is valid', async () => {
      const name = `Tanah Lot ${generateId()}`;
      const response = await server.inject({
        method: 'POST',
        url: '/destinations',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          name,
          description: 'A beautiful sea temple in Bali.',
          img: 'https://example.com/tanahlot.jpg',
          location: 'Tabanan',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.message).toBe('Destination Created successfully');
      expect(body.data).toHaveProperty('id');
      expect(body.data.name).toBe(name);
      expect(body.data.description).toBe('A beautiful sea temple in Bali.');
      expect(body.data.img).toBe('https://example.com/tanahlot.jpg');
      expect(body.data.location).toBe('Tabanan');
    });

    test('should fail when any field is missing', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/destinations',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          name: 'Tanah Lot Missing',
          description: '',
          img: 'https://example.com/tanahlot.jpg',
          location: 'Tabanan',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Please fill all the fields');
    });

    test('should fail when name is duplicate', async () => {
      const name = `Tanah Lot ${generateId()}`;
      const destId = generateId();

      await prisma.destination.create({
        data: {
          dest_id: destId,
          name_dest: name,
          description: 'Original description',
          img: 'https://example.com/tanahlot.jpg',
          location: 'Tabanan',
        },
      });

      const response = await server.inject({
        method: 'POST',
        url: '/destinations',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          name,
          description: 'Another description',
          img: 'https://example.com/tanahlot2.jpg',
          location: 'Tabanan',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Destination Already Exist');
    });

    test('should fail without authorization token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/destinations',
        payload: {
          name: 'Tanah Lot Auth',
          description: 'A beautiful sea temple in Bali.',
          img: 'https://example.com/tanahlot.jpg',
          location: 'Tabanan',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('missing authentication token');
    });
  });

  describe('GET /destinations', () => {
    test('should successfully retrieve all destinations with avgRating', async () => {
      const destId = generateId();
      const rateId = generateId();

      await prisma.destination.create({
        data: {
          dest_id: destId,
          name_dest: `Uluwatu Temple ${generateId()}`,
          description: 'Temple on cliff',
          img: ' Uluwatu.jpg',
          location: 'Badung',
        },
      });

      await prisma.rating.create({
        data: {
          rating_id: rateId,
          rating: 5,
          user_id: userId,
          dest_id: destId,
        },
      });

      const response = await server.inject({
        method: 'GET',
        url: '/destinations',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data).toHaveProperty('destinations');
      expect(body.data.destinations.length).toBeGreaterThanOrEqual(1);
      const found = body.data.destinations.find((d) => d.id === destId);
      expect(found).toBeDefined();
      expect(found.avgRating).toBe(5);
    });

    test('should return empty destinations array when database is empty', async () => {
      // Clear specifically destination table to test empty return
      await prisma.rating.deleteMany({});
      await prisma.bookmark_detail.deleteMany({});
      await prisma.destination.deleteMany({});

      const response = await server.inject({
        method: 'GET',
        url: '/destinations',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.destinations).toEqual([]);
    });
  });

  describe('GET /destinations/{id}', () => {
    test('should retrieve destination by valid ID with avgRating', async () => {
      const destId = generateId();

      await prisma.destination.create({
        data: {
          dest_id: destId,
          name_dest: `Uluwatu Temple ${generateId()}`,
          description: 'Temple on cliff',
          img: ' Uluwatu.jpg',
          location: 'Badung',
        },
      });

      const response = await server.inject({
        method: 'GET',
        url: `/destinations/${destId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(destId);
      expect(body.data.avgRating).toBe(0);
    });

    test('should return 404 when ID does not exist', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/destinations/nonexistent-id',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Destination not found');
    });
  });

  describe('DELETE /destinations/{id}', () => {
    test('should successfully delete destination when authenticated and ID exists', async () => {
      const destId = generateId();

      await prisma.destination.create({
        data: {
          dest_id: destId,
          name_dest: `Uluwatu Temple ${generateId()}`,
          description: 'Temple on cliff',
          img: ' Uluwatu.jpg',
          location: 'Badung',
        },
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/destinations/${destId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(destId);

      const count = await prisma.destination.count({
        where: { dest_id: destId },
      });
      expect(count).toBe(0);
    });

    test('should fail when deleting nonexistent destination', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/destinations/nonexistent-id',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Destination not found');
    });

    test('should fail when deleting without token', async () => {
      const destId = generateId();

      await prisma.destination.create({
        data: {
          dest_id: destId,
          name_dest: `Uluwatu Temple ${generateId()}`,
          description: 'Temple on cliff',
          img: ' Uluwatu.jpg',
          location: 'Badung',
        },
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/destinations/${destId}`,
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('missing authentication token');
    });
  });
});
