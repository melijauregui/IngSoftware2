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

describe('GET /songs/:id', () => {
  // Mock Prisma functions for testing
  const mockFindUnique = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma song.findUnique function
    vi.spyOn(db.song, 'findUnique').mockImplementation(mockFindUnique);
  });

  beforeEach(() => {
    // Clear mock between tests
    mockFindUnique.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe('Case 1: Database error - Internal server error (500)', () => {
    it('should return 500 when there is a database connection error', async () => {
      const songId = 1;
      const dbError = new Error('Connection lost to database');
      mockFindUnique.mockRejectedValueOnce(dbError);

      const response = await app.request(`/songs/${songId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Connection lost to database',
        instance: `/songs/${songId}`,
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: songId },
      });
    });
  });

  describe('Case 2: Data validation - Schema validation errors', () => {
    it('should return 404 when song data is invalid (missing required fields)', async () => {
      const songId = 1;
      const invalidSong = {
        id: 1,
        title: 'Bohemian Rhapsody',
        artist: '', // Invalid: empty artist field
      };

      mockFindUnique.mockResolvedValueOnce(invalidSong);

      const response = await app.request(`/songs/${songId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Song Not Found',
        status: 404,
        detail: 'The Song with ID 1 was not found',
        instance: '/songs/1',
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: songId },
      });
    });
  });
});
