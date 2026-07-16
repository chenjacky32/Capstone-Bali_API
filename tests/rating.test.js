import { buildServer } from './helpers/server.js';
import { cleanDb } from './helpers/db.js';
import prisma from '../src/config/DatabaseConfig.js';
import { hashPassword } from '../src/utils/JwtToken.js';
import { generateId } from '../src/utils/IdGenerator.js';
import userService from '../src/services/UserService.js';
import destinationService from '../src/services/DestinationService.js';
import ratingService from '../src/services/RatingService.js';

describe('Rating API Tests', () => {
  let server;
  let token;
  let userId;
  let destId;

  beforeAll(async () => {
    server = await buildServer();
  });

  beforeEach(async () => {
    await cleanDb();

    const email = `user_${generateId()}@example.com`;

    // Create user and log in to get a token for authenticated requests
    const user = await userService.register({
      name: 'Regular User',
      email,
      password: 'password123',
    });
    userId = user.id;

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email,
        password: 'password123',
      },
    });
    token = JSON.parse(loginResponse.payload).data.accessToken;

    // Create a destination
    const dest = await destinationService.addDestination({
      name: 'Kuta Beach',
      description: 'A crowded beach with nice sunset.',
      img: 'https://example.com/kuta.jpg',
      location: 'Badung',
    });
    destId = dest.id;
  });

  afterAll(async () => {
    await server.stop();
    await prisma.$disconnect();
  });

  describe('POST /destinations/{dest_id}/ratings', () => {
    test('should successfully add a new rating', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/ratings`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.rating).toBe(5);
      expect(body.data.dest_id).toBe(destId);
      expect(body.data.user_id).toBe(userId);
    });

    test('should successfully update rating when rating again on the same destination', async () => {
      // 1. Give 5 rating first
      await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/ratings`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          rating: 5,
        },
      });

      // 2. Change rating to 3
      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/ratings`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          rating: 3,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.rating).toBe(3);

      // Verify in DB
      const dbRating = await ratingService.getRating(userId, destId);
      expect(dbRating.rating).toBe(3);
    });

    test('should fail when rating is out of range 1-5', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/ratings`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          rating: 6,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Rating must be between 1 until 5');
    });

    test('should fail when rating is not a number', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/ratings`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          rating: 'five',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Rating must be a number');
    });

    test('should fail when destination does not exist', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/destinations/nonexistent-dest-id/ratings',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          rating: 4,
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Destinations not found');
    });

    test('should fail without authorization token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/ratings`,
        payload: {
          rating: 4,
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('missing authentication token');
    });

    test('should update avgRating of destination accurately', async () => {
      // User 1 rates 5
      await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/ratings`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          rating: 5,
        },
      });

      // User 2 rates 3
      const email2 = `user2_${generateId()}@example.com`;

      await userService.register({
        name: 'Second User',
        email: email2,
        password: 'password123',
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: email2,
          password: 'password123',
        },
      });
      const token2 = JSON.parse(loginResponse.payload).data.accessToken;

      await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/ratings`,
        headers: {
          Authorization: `Bearer ${token2}`,
        },
        payload: {
          rating: 3,
        },
      });

      // Fetch the destination details and check avgRating
      const destResponse = await server.inject({
        method: 'GET',
        url: `/destinations/${destId}`,
      });

      expect(destResponse.statusCode).toBe(200);
      const body = JSON.parse(destResponse.payload);
      expect(body.data.avgRating).toBe(4); // (5 + 3) / 2 = 4
    });
  });
});
