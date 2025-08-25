import { describe, it, expect, beforeEach, afterEach } from "vitest";

import "../config.test";

import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
  setupTestJustOnePlaylistDatabase,
  setupTestJustOneSongDatabase,
  TEST_SONGS,
} from "../server/db.test";
import app from "../server/app";
import { compareSongs } from "./tests-functions";

describe("GET /songs", () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe("Case 1: Success - Retrieve all songs successfully (200)", () => {
    it("should return all songs when database has songs", async () => {
      await setupCompleteTestDatabase();

      const response = await app.request("/songs", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("data");
      const songs = responseBody.data;
      expect(songs).toHaveLength(3);
      const expectedSongIds = [
        TEST_SONGS.SONG_1.id,
        TEST_SONGS.SONG_2.id,
        TEST_SONGS.SONG_3.id,
      ];
      compareSongs(songs, expectedSongIds);
    });

    it("should return empty array when database has no songs", async () => {
      await setupTestJustOnePlaylistDatabase();
      const response = await app.request("/songs", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [],
      });
    });

    it("should return single song when database has only one song", async () => {
      await setupTestJustOneSongDatabase();
      const response = await app.request("/songs", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("data");
      const songs = responseBody.data;
      expect(songs).toHaveLength(1);
      const expectedSongIds = [TEST_SONGS.SONG_1.id];
      compareSongs(songs, expectedSongIds);
    });
  });

  describe("Case 2: HTTP method validation", () => {
    it("should return 404 for PUT request to /songs endpoint", async () => {
      const response = await app.request("/songs", {
        method: "PUT",
      });

      expect(response.status).toBe(404);
    });

    it("should return 404 for DELETE request to /songs endpoint", async () => {
      const response = await app.request("/songs", {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
    });
  });
});
