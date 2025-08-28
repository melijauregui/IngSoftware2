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

describe('GET /playlists', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Case 1: Default behavior - published=true, sort=desc', () => {
    it('should return only published playlists ordered by publishedAt desc (default)', async () => {
      await setupCompleteTestDatabase();
      const response = await app.request('/playlists', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);

      // Should only return published playlists (2 out of 3)
      expect(body.data.length).toBe(2);

      // Should be ordered by publishedAt desc (most recent first)
      const firstPlaylist = body.data[0];
      comparePlaylistsData(firstPlaylist, TEST_PLAYLISTS.PLAYLIST_2, true);
      const firstPlaylistSongs = firstPlaylist.songs;
      const firstPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_2_SONG_3.songId,
      ];
      compareSongs(firstPlaylistSongs, firstPlaylistExpectedSongIds);

      const secondPlaylist = body.data[1];
      comparePlaylistsData(secondPlaylist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const secondPlaylistSongs = secondPlaylist.songs;
      const secondPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
      ];
      compareSongs(secondPlaylistSongs, secondPlaylistExpectedSongIds);
    });

    it('should return empty array when no playlists exist', async () => {
      const response = await app.request('/playlists', {
        method: 'GET',
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(0);
    });
  });

  describe('Case 2: Explicit published=true', () => {
    it('should return only published playlists when published=true', async () => {
      await setupCompleteTestDatabase();
      const response = await app.request('/playlists?published=true', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(2);

      // Should only return published playlists (2 out of 3) and ordered by publishedAt desc (most recent first)
      const firstPlaylist = body.data[0];
      comparePlaylistsData(firstPlaylist, TEST_PLAYLISTS.PLAYLIST_2, true);
      const firstPlaylistSongs = firstPlaylist.songs;
      const firstPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_2_SONG_3.songId,
      ];
      compareSongs(firstPlaylistSongs, firstPlaylistExpectedSongIds);

      const secondPlaylist = body.data[1];
      comparePlaylistsData(secondPlaylist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const secondPlaylistSongs = secondPlaylist.songs;
      const secondPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
      ];
      compareSongs(secondPlaylistSongs, secondPlaylistExpectedSongIds);
    });
  });

  describe('Case 3: published=false - all playlists', () => {
    it('should return all playlists when published=false', async () => {
      await setupCompleteTestDatabase();
      const url = '/playlists?published=false';
      const response = await app.request(url, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(3);

      // Should be ordered by publishedAt desc (most recent first) and unpublished at end

      const firstPlaylist = body.data[0];
      comparePlaylistsData(firstPlaylist, TEST_PLAYLISTS.PLAYLIST_2, false);
      const firstPlaylistSongs = firstPlaylist.songs;
      const firstPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_2_SONG_3.songId,
      ];
      compareSongs(firstPlaylistSongs, firstPlaylistExpectedSongIds);

      const secondPlaylist = body.data[1];
      comparePlaylistsData(secondPlaylist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const secondPlaylistSongs = secondPlaylist.songs;
      const secondPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
      ];
      compareSongs(secondPlaylistSongs, secondPlaylistExpectedSongIds);

      const thirdPlaylist = body.data[2];
      comparePlaylistsData(thirdPlaylist, TEST_PLAYLISTS.PLAYLIST_3, true);
      const thirdPlaylistSongs = thirdPlaylist.songs;
      const thirdPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_3_SONG_1.songId,
      ];
      compareSongs(thirdPlaylistSongs, thirdPlaylistExpectedSongIds);
    });
  });

  describe('Case 4: sort parameter', () => {
    it('should order by publishedAt asc when sort=asc', async () => {
      await setupCompleteTestDatabase();
      const response = await app.request('/playlists?sort=asc', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      const playlists = body.data;

      // Should only return published playlists (default published=true)
      expect(playlists.length).toBe(2);

      // Should be ordered by publishedAt asc (oldest first)
      const firstPlaylist = body.data[0];
      comparePlaylistsData(firstPlaylist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const firstPlaylistSongs = firstPlaylist.songs;
      const firstPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
      ];
      compareSongs(firstPlaylistSongs, firstPlaylistExpectedSongIds);

      const secondPlaylist = body.data[1];
      comparePlaylistsData(secondPlaylist, TEST_PLAYLISTS.PLAYLIST_2, true);
      const secondPlaylistSongs = secondPlaylist.songs;
      const secondPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_2_SONG_3.songId,
      ];
      compareSongs(secondPlaylistSongs, secondPlaylistExpectedSongIds);
    });

    it('should order by publishedAt desc when sort=desc', async () => {
      await setupCompleteTestDatabase();
      const response = await app.request('/playlists?sort=desc', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      const playlists = body.data;

      // Should only return published playlists (default published=true)
      expect(playlists.length).toBe(2);

      // Should be ordered by publishedAt desc (newest first)
      const firstPlaylist = body.data[0];
      comparePlaylistsData(firstPlaylist, TEST_PLAYLISTS.PLAYLIST_2, true);
      const firstPlaylistSongs = firstPlaylist.songs;
      const firstPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_2_SONG_3.songId,
      ];
      compareSongs(firstPlaylistSongs, firstPlaylistExpectedSongIds);

      const secondPlaylist = body.data[1];
      comparePlaylistsData(secondPlaylist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const secondPlaylistSongs = secondPlaylist.songs;
      const secondPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
      ];
      compareSongs(secondPlaylistSongs, secondPlaylistExpectedSongIds);
    });

    it('should order all playlists by publishedAt asc with unpublished at beginning', async () => {
      await setupCompleteTestDatabase();
      const response = await app.request(
        '/playlists?published=false&sort=asc',
        {
          method: 'GET',
        }
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      const playlists = body.data;

      // Should return all playlists
      expect(playlists.length).toBe(3);

      // Should be ordered by publishedAt asc with unpublished at beginning
      const firstPlaylist = body.data[0];
      comparePlaylistsData(firstPlaylist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const firstPlaylistSongs = firstPlaylist.songs;
      const firstPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
      ];
      compareSongs(firstPlaylistSongs, firstPlaylistExpectedSongIds);

      const secondPlaylist = body.data[1];
      comparePlaylistsData(secondPlaylist, TEST_PLAYLISTS.PLAYLIST_2, true);
      const secondPlaylistSongs = secondPlaylist.songs;
      const secondPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_2_SONG_3.songId,
      ];
      compareSongs(secondPlaylistSongs, secondPlaylistExpectedSongIds);

      const thirdPlaylist = body.data[2];
      comparePlaylistsData(thirdPlaylist, TEST_PLAYLISTS.PLAYLIST_3, true);
      const thirdPlaylistSongs = thirdPlaylist.songs;
      const thirdPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_3_SONG_1.songId,
      ];
      compareSongs(thirdPlaylistSongs, thirdPlaylistExpectedSongIds);
    });
  });

  describe('Case 5: Parameter combinations', () => {
    it('should handle published=false&sort=desc', async () => {
      await setupCompleteTestDatabase();
      const response = await app.request(
        '/playlists?published=false&sort=desc',
        {
          method: 'GET',
        }
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      const playlists = body.data;

      expect(playlists.length).toBe(3);
      // Should be ordered by publishedAt desc with unpublished at end
      const firstPlaylist = body.data[0];
      comparePlaylistsData(firstPlaylist, TEST_PLAYLISTS.PLAYLIST_2, true);
      const firstPlaylistSongs = firstPlaylist.songs;
      const firstPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_2_SONG_3.songId,
      ];
      compareSongs(firstPlaylistSongs, firstPlaylistExpectedSongIds);

      const secondPlaylist = body.data[1];
      comparePlaylistsData(secondPlaylist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const secondPlaylistSongs = secondPlaylist.songs;
      const secondPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
      ];
      compareSongs(secondPlaylistSongs, secondPlaylistExpectedSongIds);

      const thirdPlaylist = body.data[2];
      comparePlaylistsData(thirdPlaylist, TEST_PLAYLISTS.PLAYLIST_3, true);
      const thirdPlaylistSongs = thirdPlaylist.songs;
      const thirdPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_3_SONG_1.songId,
      ];
      compareSongs(thirdPlaylistSongs, thirdPlaylistExpectedSongIds);
    });

    it('should handle published=true&sort=asc', async () => {
      await setupCompleteTestDatabase();
      const response = await app.request('/playlists?published=true&sort=asc', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      const playlists = body.data;

      expect(playlists.length).toBe(2);
      const firstPlaylist = body.data[0];
      comparePlaylistsData(firstPlaylist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const firstPlaylistSongs = firstPlaylist.songs;
      const firstPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
      ];
      compareSongs(firstPlaylistSongs, firstPlaylistExpectedSongIds);

      const secondPlaylist = body.data[1];
      comparePlaylistsData(secondPlaylist, TEST_PLAYLISTS.PLAYLIST_2, true);
      const secondPlaylistSongs = secondPlaylist.songs;
      const secondPlaylistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_2_SONG_3.songId,
      ];
      compareSongs(secondPlaylistSongs, secondPlaylistExpectedSongIds);
    });
  });

  describe('Case 6: Edge cases', () => {
    it('should handle single playlist without songs', async () => {
      await setupTestJustOnePlaylistDatabase();
      const response = await app.request('/playlists', {
        method: 'GET',
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);

      const playlist = body.data[0];
      comparePlaylistsData(playlist, TEST_PLAYLISTS.PLAYLIST_1, true);
      expect(playlist.songs).toHaveLength(0);
    });
  });

  describe('Case 7: Invalid query parameters', () => {
    it('should return 400 for invalid published parameter', async () => {
      const response = await app.request('/playlists?published=invalid', {
        method: 'GET',
      });
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Validation Error',
        status: 400,
        detail:
          "published: Invalid enum value. Expected 'true' | 'false', received 'invalid'",
        instance: '/playlists',
      });
    });
    it('should return 400 for invalid sort parameter', async () => {
      const response = await app.request('/playlists?sort=invalid', {
        method: 'GET',
      });
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: 'about:blank',
        title: 'Validation Error',
        status: 400,
        detail:
          "sort: Invalid enum value. Expected 'asc' | 'desc', received 'invalid'",
        instance: '/playlists',
      });
    });
  });
});
