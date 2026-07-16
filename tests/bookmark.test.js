import { buildServer } from './helpers/server.js';
import { cleanDb } from './helpers/db.js';
import prisma from '../src/config/DatabaseConfig.js';
import { hashPassword } from '../src/utils/JwtToken.js';
import { generateId } from '../src/utils/IdGenerator.js';

describe('Bookmark API Tests', () => {
  let server;
  let token;
  let userId;
  let destId;

  beforeAll(async () => {
    server = await buildServer();
  });

  beforeEach(async () => {
    await cleanDb();

    userId = generateId();
    destId = generateId();
    const email = `user_${generateId()}@example.com`;

    // Create user and log in to get a token for authenticated requests
    await prisma.users.create({
      data: {
        user_id: userId,
        name: 'Regular User',
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

    // Create a destination
    await prisma.destination.create({
      data: {
        dest_id: destId,
        name_dest: 'Sanur Beach',
        description: 'A quiet beach with beautiful sunrise.',
        img: 'https://example.com/sanur.jpg',
        location: 'Denpasar',
      },
    });
  });

  afterAll(async () => {
    await server.stop();
    await prisma.$disconnect();
  });

  describe('POST /destinations/{dest_id}/bookmarks', () => {
    test('should successfully bookmark a destination', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/bookmarks`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.isBookmark).toBe(true);
      expect(body.data.dest_id).toBe(destId);
      expect(body.data.user_id).toBe(userId);
    });

    test('should keep bookmark as true (idempotent) if bookmarked again', async () => {
      // 1. Bookmark first time
      await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/bookmarks`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 2. Bookmark second time
      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/bookmarks`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.isBookmark).toBe(true);

      const dbBookmark = await prisma.bookmark_detail.findFirst({
        where: { user_id: userId, dest_id: destId },
      });
      expect(dbBookmark.isBookmark).toBe(true);
    });

    test('should fail when destination does not exist', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/destinations/nonexistent-dest-id/bookmarks',
        headers: {
          Authorization: `Bearer ${token}`,
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
        url: `/destinations/${destId}/bookmarks`,
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('missing authentication token');
    });
  });

  describe('POST /destinations/{dest_id}/unbookmarked', () => {
    test('should successfully unbookmark a destination', async () => {
      // Bookmark it first
      await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/bookmarks`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/unbookmarked`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.isBookmark).toBe(false);
    });

    test('should fail when destination does not exist', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/destinations/nonexistent-dest-id/unbookmarked',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Destinations not found');
    });

    test('should fail when bookmark record does not exist', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/unbookmarked`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Bookmark not found');
    });

    test('should fail without authorization token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/unbookmarked`,
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('missing authentication token');
    });
  });

  describe('GET /destinations/bookmarks', () => {
    test('should retrieve active bookmarked destinations', async () => {
      // Bookmark it first
      await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/bookmarks`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await server.inject({
        method: 'GET',
        url: '/destinations/bookmarks',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.Bookmarks.length).toBe(1);
      expect(body.data.Bookmarks[0].isBookmark).toBe(true);
      expect(body.data.Bookmarks[0].dest_id).toBe(destId);
    });

    test('should return empty array if no active bookmarks', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/destinations/bookmarks',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.Bookmarks).toEqual([]);
    });

    test('should fail without authorization token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/destinations/bookmarks',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('missing authentication token');
    });
  });

  describe('GET /destinations/unbookmarked', () => {
    test('should retrieve unbookmarked destinations', async () => {
      // Bookmark it first
      await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/bookmarks`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Unbookmark it
      await server.inject({
        method: 'POST',
        url: `/destinations/${destId}/unbookmarked`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await server.inject({
        method: 'GET',
        url: '/destinations/unbookmarked',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.Unbookmarked.length).toBe(1);
      expect(body.data.Unbookmarked[0].isBookmark).toBe(false);
      expect(body.data.Unbookmarked[0].dest_id).toBe(destId);
    });

    test('should return empty array if no unbookmarked destinations', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/destinations/unbookmarked',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('success');
      expect(body.data.Unbookmarked).toEqual([]);
    });

    test('should fail without authorization token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/destinations/unbookmarked',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('missing authentication token');
    });
  });
});
