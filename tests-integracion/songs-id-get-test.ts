import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import '../config.test';

import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
  TEST_SONGS,
} from '../server/db.test';
import app from '../server/app';
import { compareSong } from './tests-functions';

describe('GET /songs/:id', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Case 1: Success - Retrieve song by ID successfully (200)', () => {
    it('should return a song when it exists in the database', async () => {
      await setupCompleteTestDatabase();

      const response = await app.request(`/songs/1`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('data');
      const song = responseBody.data;
      compareSong(song, TEST_SONGS.SONG_1);
    });
  });

  describe("Case 2: Not Found - Song doesn't exist (404)", () => {
    it("should return 404 when song with given ID doesn't exist", async () => {
      await setupCompleteTestDatabase();
      const songId = 999;

      const response = await app.request(`/songs/${songId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Song Not Found',
        status: 404,
        detail: `The Song with ID ${songId} was not found`,
        instance: '/songs/999',
      });
    });
  });

  describe('Case 5: Parameter validation - Invalid ID parameter', () => {
    it('should return 400 when ID is not a number', async () => {
      const response = await app.request('/songs/abc', {
        method: 'GET',
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Validation Error',
        status: 400,
        detail: 'id: Invalid song ID, must be a number',
        instance: '/songs/abc',
      });
    });

    it('should return 404 when ID is negative', async () => {
      const response = await app.request('/songs/-1', {
        method: 'GET',
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Song Not Found',
        status: 404,
        detail: `The Song with ID -1 was not found`,
        instance: '/songs/-1',
      });
    });

    it('should return 404 when ID is a decimal number', async () => {
      const response = await app.request('/songs/1.5', {
        method: 'GET',
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Song Not Found',
        status: 404,
        detail: `The Song with ID 1.5 was not found`,
        instance: '/songs/1.5',
      });
    });
  });
});
