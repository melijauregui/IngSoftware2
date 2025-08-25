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
import { comparePlaylistsData, comparePlaylistSongs } from "./tests-functions";

describe("GET /playlists/:id", () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe("Case 1: Success - Retrieve playlist successfully (200)", () => {
    it("should return playlist with songs when it exists", async () => {
      await setupCompleteTestDatabase();

      const response = await app.request("/playlists/1", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("data");

      const playlist = body.data;
      comparePlaylistsData(playlist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const playlistSongs = playlist.songs;
      const playlistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.song_id,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.song_id,
      ];
      comparePlaylistSongs(playlistSongs, playlistExpectedSongIds);
    });

    it("should return playlist without songs when it exists", async () => {
      await setupTestJustOnePlaylistDatabase();

      const response = await app.request("/playlists/1", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("data");

      const playlist = responseBody.data;
      comparePlaylistsData(playlist, TEST_PLAYLISTS.PLAYLIST_1, true);
      expect(playlist.songs).toHaveLength(0);
    });

    describe("Case 2: Validation error - Invalid ID (400)", () => {
      it("should return 400 when ID is not a number", async () => {
        const response = await app.request("/playlists/abc", {
          method: "GET",
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: "id: Expected integer",
          instance: "/playlists/abc",
        });
      });

      it("should return 400 when ID is negative", async () => {
        const response = await app.request("/playlists/-1", {
          method: "GET",
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: "id: Number must be greater than or equal to 0",
          instance: "/playlists/-1",
        });
      });

      it("should return 400 when ID is a decimal number", async () => {
        const response = await app.request("/playlists/1.5", {
          method: "GET",
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: "id: Expected integer",
          instance: "/playlists/1.5",
        });
      });
    });
  });

  describe("Case 3: Not found - Playlist not found (404)", () => {
    it("should return 404 when playlist does not exist", async () => {
      await setupCompleteTestDatabase();
      const response = await app.request("/playlists/999", {
        method: "GET",
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "Playlist not found with id: 999",
        instance: "/playlists/999",
      });
    });
  });
});
