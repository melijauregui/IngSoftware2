import { describe, it, expect, beforeEach, afterEach } from "vitest";

import "../config.test";

import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
  TEST_SONGS,
} from "../server/db.test";
import app from "../server/app";
import { compareSong, compareSongs } from "./tests-functions";

describe("PUT /songs/:id", () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe("Case 1: Success - Update song by ID successfully (200)", () => {
    it("should update a song when it exists in the database", async () => {
      await setupCompleteTestDatabase();
      const songId = 1;
      const updateData = {
        title: "Updated Bohemian Rhapsody",
        artist: "Updated Queen",
      };
      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("data");
      const song = responseBody.data;
      compareSong(song, updateData);
    });

    it("should update only title when only title is provided", async () => {
      await setupCompleteTestDatabase();
      const updateData = {
        title: "Only Title Updated",
      };

      const response = await app.request(`/songs/1`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("data");
      const song = responseBody.data;
      const songUpdated = {
        ...TEST_SONGS.SONG_1,
        title: updateData.title,
      };
      compareSong(song, songUpdated);
    });

    it("should update only artist when only artist is provided", async () => {
      await setupCompleteTestDatabase();
      const songId = 1;
      const updateData = {
        artist: "Only Artist Updated",
      };

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("data");
      const song = responseBody.data;
      const songUpdated = {
        ...TEST_SONGS.SONG_1,
        artist: updateData.artist,
      };
      compareSong(song, songUpdated);
    });
  });

  describe("Case 2: Not Found - Song doesn't exist (404)", () => {
    it("should return 404 when song with given ID doesn't exist", async () => {
      const songId = 999;
      const updateData = {
        title: "Updated Title",
        artist: "Updated Artist",
      };

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "Song not found with id: 999",
        instance: "/songs/999",
      });
    });
  });

  describe("Case 3: Validation errors - Invalid request body (400)", () => {
    it("should return 400 when both title and artist are missing", async () => {
      const songId = 1;
      const invalidData = {};

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "At least one field (title or artist) must be provided",
        instance: "/songs/1",
      });
    });

    it("should return 400 when title is empty string", async () => {
      const songId = 1;
      const invalidData = {
        title: "",
        artist: "Valid Artist",
      };

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "title: Title is required",
        instance: "/songs/1",
      });
    });

    it("should return 400 when artist is empty string", async () => {
      const songId = 1;
      const invalidData = {
        title: "Valid Title",
        artist: "",
      };

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "artist: Artist is required",
        instance: "/songs/1",
      });
    });
  });

  describe("Case 4: Parameter validation - Invalid ID parameter (400)", () => {
    it("should return 400 when ID is not a number", async () => {
      const updateData = {
        title: "Updated Title",
        artist: "Updated Artist",
      };

      const response = await app.request(`/songs/abc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Invalid song ID, must be a number",
        instance: "/songs/abc",
      });
    });

    it("should return 400 when ID is negative", async () => {
      const updateData = {
        title: "Updated Title",
        artist: "Updated Artist",
      };

      const response = await app.request(`/songs/-1`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Invalid song ID, must be greater than 0",
        instance: "/songs/-1",
      });
    });
  });
});
