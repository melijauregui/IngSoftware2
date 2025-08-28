import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';
import app from '../server/app';
import { db } from '../server/db.config';

describe('POST /songs', () => {
  // Mock Prisma functions for testing
  const mockCreate = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma song.create function
    vi.spyOn(db.song, 'create').mockImplementation(mockCreate);
  });

  beforeEach(() => {
    // Clear mock between tests
    mockCreate.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe('Case 1: Database error - Internal server error (500)', () => {
    it('should return 500 when there is a database error', async () => {
      const songData = {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
      };

      const dbError = new Error('Connection lost to database');
      mockCreate.mockRejectedValueOnce(dbError);

      const response = await app.request('/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Connection lost to database',
        instance: '/songs',
      });
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
        },
      });
    });
  });
});
