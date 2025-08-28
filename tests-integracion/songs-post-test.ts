import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import '../config.test';

import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
} from '../server/db.test';
import app from '../server/app';
import { compareSong } from './tests-functions';

describe('POST /songs', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Case 1: Success - Create song successfully (201)', () => {
    it('should create a song successfully and return 201', async () => {
      await setupCompleteTestDatabase();
      const songData = {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
      };

      const response = await app.request('/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('data');
      const song = responseBody.data;
      compareSong(song, songData);
    });
  });

  describe('Case 2: Validation error - Invalid data (400)', () => {
    it('should return 400 when the title is empty', async () => {
      const songData = {
        title: '',
        artist: 'Queen',
      };

      const response = await app.request('/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Validation Error',
        status: 400,
        detail: 'title: Title is required',
        instance: '/songs',
      });
    });

    it('should return 400 when the artist is empty', async () => {
      const songData = {
        title: 'Bohemian Rhapsody',
        artist: '',
      };

      const response = await app.request('/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Validation Error',
        status: 400,
        detail: 'artist: Artist is required',
        instance: '/songs',
      });
    });

    it('should return 400 when both fields are empty', async () => {
      const songData = {
        title: '',
        artist: '',
      };

      const response = await app.request('/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Validation Error',
        status: 400,
        detail: 'title: Title is required, artist: Artist is required',
        instance: '/songs',
      });
    });

    it('should return 400 when the title only has spaces', async () => {
      const songData = {
        title: '   ',
        artist: 'Queen',
      };

      const response = await app.request('/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Validation Error',
        status: 400,
        detail: 'title: Title is required',
        instance: '/songs',
      });
    });
  });

  describe('Additional validation cases', () => {
    it('should handle special characters correctly', async () => {
      const songData = {
        title: '¿Qué tal?',
        artist: 'Artista & Co.',
      };

      const response = await app.request('/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('data');
      const song = responseBody.data;
      compareSong(song, songData);
    });
  });
});
