import { describe, it, expect, beforeEach } from 'vitest';

import '../config.test';

import app from '../server/app';
import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
  TEST_PLAYLISTS,
} from '../server/db.test';

describe('POST /playlists/{id}/publish', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Case 1: Successful playlist publication', () => {
    it('should publish an unpublished playlist successfully', async () => {
      await setupCompleteTestDatabase();

      // Now publish it
      const publishResponse = await app.request(
        `/playlists/${TEST_PLAYLISTS.PLAYLIST_3.id}/publish`,
        {
          method: 'POST',
        }
      );

      expect(publishResponse.status).toBe(200);
      const publishBody = await publishResponse.json();
      const publishedPlaylist = publishBody.data;

      // Verify it's now published
      expect(publishedPlaylist.isPublished).toBe(true);
      expect(publishedPlaylist.publishedAt).not.toBe(null);
      expect(new Date(publishedPlaylist.publishedAt)).toBeInstanceOf(Date);

      // Verify other properties remain the same
      expect(publishedPlaylist.id).toBe(TEST_PLAYLISTS.PLAYLIST_3.id);
      expect(publishedPlaylist.name).toBe(TEST_PLAYLISTS.PLAYLIST_3.name);
      expect(publishedPlaylist.description).toBe(
        TEST_PLAYLISTS.PLAYLIST_3.description
      );
    });

    it('should be idempotent - calling publish twice should not change the publishedAt', async () => {
      await setupCompleteTestDatabase();
      // First publish
      const publishResponse1 = await app.request(
        `/playlists/${TEST_PLAYLISTS.PLAYLIST_3.id}/publish`,
        {
          method: 'POST',
        }
      );

      expect(publishResponse1.status).toBe(200);
      const publishBody1 = await publishResponse1.json();
      const publishedPlaylist1 = publishBody1.data;

      expect(publishedPlaylist1.isPublished).toBe(true);
      const firstPublishedAt = publishedPlaylist1.publishedAt;

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second publish (should be idempotent)
      const publishResponse2 = await app.request(
        `/playlists/${TEST_PLAYLISTS.PLAYLIST_3.id}/publish`,
        {
          method: 'POST',
        }
      );

      expect(publishResponse2.status).toBe(200);
      const publishBody2 = await publishResponse2.json();
      const publishedPlaylist2 = publishBody2.data;

      // Should still be published with the same timestamp
      expect(publishedPlaylist2.isPublished).toBe(true);
      expect(publishedPlaylist2.publishedAt).toBe(firstPublishedAt);
    });

    it('should publish an already published playlist without changing publishedAt', async () => {
      await setupCompleteTestDatabase();

      // Publish it again
      const publishResponse = await app.request(
        `/playlists/${TEST_PLAYLISTS.PLAYLIST_1.id}/publish`,
        {
          method: 'POST',
        }
      );

      expect(publishResponse.status).toBe(200);
      const publishBody = await publishResponse.json();
      const publishedPlaylist = publishBody.data;

      // Should still be published with the same timestamp
      expect(publishedPlaylist.isPublished).toBe(true);
      expect(publishedPlaylist.publishedAt).toBe(
        TEST_PLAYLISTS.PLAYLIST_1.publishedAt.toISOString()
      );
    });
  });

  describe('Case 2: Error handling', () => {
    it('should return 404 when playlist does not exist', async () => {
      await setupCompleteTestDatabase();

      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';

      const response = await app.request(
        `/playlists/${nonExistentId}/publish`,
        {
          method: 'POST',
        }
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Playlist Not Found',
        status: 404,
        detail:
          'The Playlist with ID 550e8400-e29b-41d4-a716-446655440999 was not found',
        instance: '/playlists/550e8400-e29b-41d4-a716-446655440999/publish',
      });
    });

    it('should return 400 for invalid UUID format', async () => {
      await setupCompleteTestDatabase();

      const invalidId = 'invalid-uuid';

      const response = await app.request(`/playlists/${invalidId}/publish`, {
        method: 'POST',
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Validation Error',
        status: 400,
        detail: 'id: Expected valid UUID v4',
        instance: '/playlists/invalid-uuid/publish',
      });
    });
  });
});
