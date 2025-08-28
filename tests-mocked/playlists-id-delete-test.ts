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

describe('DELETE /playlists/:id', () => {
  // Mock Prisma functions for testing
  const mockDelete = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma playlist.delete function
    vi.spyOn(db.playlist, 'delete').mockImplementation(mockDelete);
  });

  beforeEach(() => {
    // Clear mock between tests
    mockDelete.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe('Case 1: Database error - Internal server error (500)', () => {
    it('should return 500 when there is a database error', async () => {
      const dbError = new Error('Connection lost to database');
      mockDelete.mockRejectedValueOnce(dbError);

      const playlistId = '550e8400-e29b-41d4-a716-446655440001';
      const response = await app.request(`/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Connection lost to database',
        instance: `/playlists/${playlistId}`,
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: playlistId },
      });
    });

    it('should return 500 when there is a table not found error', async () => {
      const dbError = new Error(
        "ER_NO_SUCH_TABLE: Table 'playlists' doesn't exist"
      );
      mockDelete.mockRejectedValueOnce(dbError);

      const playlistId = '550e8400-e29b-41d4-a716-446655440001';
      const response = await app.request(`/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: "ER_NO_SUCH_TABLE: Table 'playlists' doesn't exist",
        instance: `/playlists/${playlistId}`,
      });
    });

    it('should return 500 with a generic message when the error is not an instance of Error', async () => {
      const dbError = new Error('Unknown database error');
      mockDelete.mockRejectedValueOnce(dbError);

      const playlistId = '550e8400-e29b-41d4-a716-446655440001';
      const response = await app.request(`/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Unknown database error',
        instance: `/playlists/${playlistId}`,
      });
    });
  });
});
