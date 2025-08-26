import { describe, it, expect, beforeEach, afterEach } from "vitest";

import "../config.test";

import app from "../server/app";
import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
  TEST_PLAYLISTS,
  TEST_PLAYLISTS_SONGS,
  TEST_SONGS,
} from "../server/db.test";
import { comparePlaylistsData, compareSongs } from "./tests-functions";

describe("POST /playlists/:id/songs", () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe("Case 1: Success - Add song to playlist successfully (200)", () => {
    it("should add a song to a playlist successfully and return 200", async () => {
      await setupCompleteTestDatabase();
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const songId = TEST_SONGS.SONG_3.id;
      const requestBody = { songId };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("data");
      const playlist = responseBody.data;
      comparePlaylistsData(playlist, TEST_PLAYLISTS.PLAYLIST_1, true);
      const playlistSongs = playlist.songs;
      const playlistExpectedSongIds = [
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_1.songId,
        TEST_PLAYLISTS_SONGS.PLAYLIST_1_SONG_2.songId,
        songId,
      ];
      compareSongs(playlistSongs, playlistExpectedSongIds);
    });
  });

  describe("Case 2: Validation error - Invalid request body (400)", () => {
    it("should return 400 when songId is missing", async () => {
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const requestBody = {};

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Required",
        instance: `/playlists/${playlistId}/songs`,
      });
    });

    it("should return 400 when songId is not a number", async () => {
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const requestBody = { songId: "invalid" };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Expected number, received string",
        instance: `/playlists/${playlistId}/songs`,
      });
    });

    it("should return 400 when songId is a negative number", async () => {
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const requestBody = { songId: -5 };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Number must be greater than or equal to 0",
        instance: `/playlists/${playlistId}/songs`,
      });
    });

    it("should return 400 when songId is a decimal number", async () => {
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const requestBody = { songId: 5.5 };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Expected integer, received float",
        instance: `/playlists/${playlistId}/songs`,
      });
    });

    it("should return 400 when songId is null", async () => {
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const requestBody = { songId: null };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Expected number, received null",
        instance: `/playlists/${playlistId}/songs`,
      });
    });

    it("should return 400 when request body is empty object", async () => {
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{}",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Required",
        instance: `/playlists/${playlistId}/songs`,
      });
    });

    it("should return 400 when request body is empty", async () => {
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "Malformed JSON in request body",
        instance: `/playlists/${playlistId}/songs`,
      });
    });

    it("should return 400 when request body is malformed JSON", async () => {
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{ invalid json }",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "Malformed JSON in request body",
        instance: `/playlists/${playlistId}/songs`,
      });
    });
  });

  describe("Case 3: Validation error - Invalid playlist ID (400)", () => {
    it("should return 400 when playlist ID is not a valid UUID v4", async () => {
      const playlistId = "invalid";
      const requestBody = { songId: 5 };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Expected valid UUID v4",
        instance: `/playlists/${playlistId}/songs`,
      });
    });

    it("should return 400 when playlist ID is a decimal number", async () => {
      const playlistId = 1.5;
      const requestBody = { songId: 5 };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Expected valid UUID v4",
        instance: `/playlists/${playlistId}/songs`,
      });
    });
  });

  describe("Case 4: Not found error - Playlist or song not found (404)", () => {
    it("should return 404 when playlist does not exist", async () => {
      await setupCompleteTestDatabase();
      const playlistId = "550e8400-e29b-41d4-a716-446655440003";
      const songId = 5;
      const requestBody = { songId };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Playlist Not Found",
        status: 404,
        detail: `The Playlist with ID ${playlistId} was not found`,
        instance: `/playlists/${playlistId}/songs`,
      });
    });

    it("should return 404 when song does not exist", async () => {
      await setupCompleteTestDatabase();
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const songId = 999;
      const requestBody = { songId };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Song Not Found",
        status: 404,
        detail: `The Song with ID ${songId} was not found`,
        instance: `/playlists/${playlistId}/songs`,
      });
    });
  });
});
