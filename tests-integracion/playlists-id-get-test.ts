import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import '../config.test';

import app from '../server/app';
import {
  cleanupTestDatabase,
  getAllTestPlaylists,
  setupCompleteTestDatabase,
  setupTestJustOnePlaylistDatabase,
  TEST_PLAYLISTS,
  TEST_PLAYLISTS_SONGS,
} from '../server/db.test';
import { comparePlaylistsData, compareSongs } from './tests-functions';

describe('GET /playlists/:id', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Case 1: Success - Retrieve playlist successfully (200)', () => {
    it('should return playlist with songs when it exists', async () => {
      await setupCompleteTestDatabase();

      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const response = await app.request(`/playlists/${playlistId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data');

      const playlist = body.data;
      comparePlaylistsData(playlist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const playlistSongs = playlist.songs;
      const playlistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
      ];
      compareSongs(playlistSongs, playlistExpectedSongIds);
    });

    it('should return playlist without songs when it exists', async () => {
      await setupTestJustOnePlaylistDatabase();

      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const response = await app.request(`/playlists/${playlistId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('data');

      const playlist = responseBody.data;
      comparePlaylistsData(playlist, TEST_PLAYLISTS.PLAYLIST_1, true);
      expect(playlist.songs).toHaveLength(0);
    });

    describe('Case 2: Validation error - Invalid ID (400)', () => {
      it('should return 400 when ID is not a number', async () => {
        const playlistId = 'abc';
        const response = await app.request(`/playlists/${playlistId}`, {
          method: 'GET',
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
          type: 'about:blank',
          title: 'Validation Error',
          status: 400,
          detail: 'id: Expected valid UUID v4',
          instance: `/playlists/${playlistId}`,
        });
      });

      it('should return 400 when ID is negative', async () => {
        const playlistId = -1;
        const response = await app.request(`/playlists/${playlistId}`, {
          method: 'GET',
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
          type: 'about:blank',
          title: 'Validation Error',
          status: 400,
          detail: 'id: Expected valid UUID v4',
          instance: `/playlists/${playlistId}`,
        });
      });

      it('should return 400 when ID is a decimal number', async () => {
        const playlistId = 1.5;
        const response = await app.request(`/playlists/${playlistId}`, {
          method: 'GET',
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
          type: 'about:blank',
          title: 'Validation Error',
          status: 400,
          detail: 'id: Expected valid UUID v4',
          instance: `/playlists/${playlistId}`,
        });
      });
    });
  });

  describe('Case 3: Not found - Playlist not found (404)', () => {
    it('should return 404 when playlist does not exist', async () => {
      await setupCompleteTestDatabase();
      //valid uuid v4 but not exists
      const playlistId = '550e8400-e29b-41d4-a716-446655440004';
      const response = await app.request(`/playlists/${playlistId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Playlist Not Found',
        status: 404,
        detail: `The Playlist with ID ${playlistId} was not found`,
        instance: `/playlists/${playlistId}`,
      });
    });
  });
});
