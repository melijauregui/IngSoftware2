import { describe, it, expect, beforeEach, afterEach } from "vitest";

import "../config.test";

import app from "../server/app";
import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
} from "../server/db.test";

describe("DELETE /playlists/:id", () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe("Case 1: Success - Delete playlist successfully (204)", () => {
    it("should delete a playlist successfully and return 204", async () => {
      await setupCompleteTestDatabase();

      const response = await app.request("/playlists/1", {
        method: "DELETE",
      });

      expect(response.status).toBe(204);
      const responseBody = await response.text();
      expect(responseBody).toBe("");
    });
  });

  describe("Case 2: Validation error - Invalid ID (400)", () => {
    it("should return 400 when ID is not a number", async () => {
      const response = await app.request("/playlists/abc", {
        method: "DELETE",
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
        method: "DELETE",
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
        method: "DELETE",
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

  describe("Case 3: Not found - Playlist not found (404)", () => {
    it("should return 404 when playlist does not exist", async () => {
      await setupCompleteTestDatabase();

      const response = await app.request("/playlists/999", {
        method: "DELETE",
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
