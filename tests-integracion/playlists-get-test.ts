import { describe, it, expect, beforeEach, afterEach } from "vitest";

import "../config.test";

import app from "../server/app";
import {
  cleanupTestDatabase,
  getAllTestPlaylists,
  setupCompleteTestDatabase,
  setupTestJustOnePlaylistDatabase,
  TEST_PLAYLISTS,
  TEST_PLAYLISTS_SONGS,
} from "../server/db.test";
import { comparePlaylistsData, compareSongs } from "./tests-functions";

describe("GET /playlists", () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe("Case 1: Success - Retrieve playlists successfully (200)", () => {
    it("should return all playlists successfully", async () => {
      await setupCompleteTestDatabase();
      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("data");
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(getAllTestPlaylists().length);

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

    it("should return empty array when no playlists exist", async () => {
      const response = await app.request("/playlists", {
        method: "GET",
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("data");
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(0);
    });
  });

  it("should return single playlist without songs", async () => {
    await setupTestJustOnePlaylistDatabase();
    const response = await app.request("/playlists", {
      method: "GET",
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);

    const playlist = body.data[0];
    comparePlaylistsData(playlist, TEST_PLAYLISTS.PLAYLIST_1, true);
    expect(playlist.songs).toHaveLength(0);
  });
});
