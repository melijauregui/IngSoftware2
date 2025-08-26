import { describe, it, expect, beforeEach, afterEach } from "vitest";

import "../config.test";

import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
} from "../server/db.test";
import app from "../server/app";

describe("GET /songs/:id", () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe("Case 1: Success - Delete song by ID successfully (204)", () => {
    it("should delete a song when it exists in the database", async () => {
      await setupCompleteTestDatabase();
      const response = await app.request(`/songs/1`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);
      expect(response.body).toBe(null);
    });

    it("should return 404 when song already deleted", async () => {
      await setupCompleteTestDatabase();
      const songId = 1;

      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);
      expect(response.body).toBe(null);

      const response2 = await app.request(`/songs/${songId}`, {
        method: "DELETE",
      });

      expect(response2.status).toBe(404);
      const responseBody = await response2.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Song Not Found",
        status: 404,
        detail: `The Song with ID ${songId} was not found`,
        instance: "/songs/1",
      });
    });
  });

  describe("Case 2: Not Found - Song doesn't exist (404)", () => {
    it("should return 404 when song with given ID doesn't exist", async () => {
      await setupCompleteTestDatabase();
      const songId = 999;

      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Song Not Found",
        status: 404,
        detail: `The Song with ID ${songId} was not found`,
        instance: "/songs/999",
      });
    });
  });

  describe("Case 3: Parameter validation - Invalid ID parameter (400)", () => {
    it("should return 400 when ID is not a number", async () => {
      const invalidId = "abc";

      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
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
      const invalidId = -1;

      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
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

    it("should return 400 when ID is a decimal number", async () => {
      const invalidId = 1.5;

      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Invalid song ID, must be an integer",
        instance: "/songs/1.5",
      });
    });
  });

  describe("Case 5: HTTP method validation", () => {
    it("should return 404 for POST request to /songs/:id endpoint", async () => {
      const response = await app.request("/songs/1", {
        method: "POST",
      });

      expect(response.status).toBe(404);
    });
  });
});
