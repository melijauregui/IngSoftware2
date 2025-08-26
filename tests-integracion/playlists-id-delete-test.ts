import { describe, it, expect, beforeEach, afterEach } from "vitest";

import "../config.test";

import app from "../server/app";
import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
  TEST_PLAYLISTS,
} from "../server/db.test";

describe("DELETE /playlists/:id", () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe("Case 1: Success - Delete playlist successfully (204)", () => {
    it("should delete a playlist successfully and return 204", async () => {
      await setupCompleteTestDatabase();

      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;
      const response = await app.request(`/playlists/${playlistId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);
      const responseBody = await response.text();
      expect(responseBody).toBe("");
    });
  });

  describe("Case 2: Validation error - Invalid ID (400)", () => {
    it("should return 400 when ID is not a valid UUID", async () => {
      const playlistId = 1;
      const response = await app.request(`/playlists/${playlistId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Expected valid UUID v4",
        instance: `/playlists/${playlistId}`,
      });
    });

    it("should return 400 when ID is negative", async () => {
      const playlistId = -1;
      const response = await app.request(`/playlists/${playlistId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Expected valid UUID v4",
        instance: `/playlists/${playlistId}`,
      });
    });

    it("should return 400 when ID is a decimal number", async () => {
      const playlistId = 1.5;
      const response = await app.request(`/playlists/${playlistId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Expected valid UUID v4",
        instance: `/playlists/${playlistId}`,
      });
    });
  });

  describe("Case 3: Not found - Playlist not found (404)", () => {
    it("should return 404 when playlist does not exist", async () => {
      await setupCompleteTestDatabase();

      //valid uuid v4 but not exists
      const playlistId = "550e8400-e29b-41d4-a716-446655440004";
      const response = await app.request(`/playlists/${playlistId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Playlist Not Found",
        status: 404,
        detail: `The Playlist with ID ${playlistId} was not found`,
        instance: `/playlists/${playlistId}`,
      });
    });
  });
});
