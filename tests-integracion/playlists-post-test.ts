import { describe, it, expect, beforeEach, afterEach } from "vitest";

import "../config.test";

import app from "../server/app";
import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
} from "../server/db.test";
import { comparePlaylistsData, isValidUUIDv4 } from "./tests-functions";

describe("POST /playlists", () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe("POST /playlists", () => {
    it("should create a playlist successfully and return 201", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "Integration Test Playlist",
        description: "A".repeat(50),
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("data");

      const createdPlaylist = body.data;
      comparePlaylistsData(createdPlaylist, newPlaylist, false);
      expect(createdPlaylist.songs).toHaveLength(0);
    });

    it("should handle maximum valid description length", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "Integration Test Playlist",
        description: "A".repeat(255),
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("data");

      const createdPlaylist = body.data;
      comparePlaylistsData(createdPlaylist, newPlaylist, false);
      expect(createdPlaylist.isPublished).toBe(false);
      expect(createdPlaylist.publishedAt).toBe(null);
      expect(createdPlaylist.songs).toHaveLength(0);
    });
  });

  describe("UUID v4 validation", () => {
    it("should generate a valid UUID v4 for each playlist", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "UUID Test Playlist",
        description: "A".repeat(50),
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("data");

      const createdPlaylist = body.data;

      // Verify UUID v4 format
      expect(createdPlaylist.id).toBeTypeOf("string");
      expect(isValidUUIDv4(createdPlaylist.id)).toBe(true);

      // Verify other properties
      comparePlaylistsData(createdPlaylist, newPlaylist, false);
      expect(createdPlaylist.songs).toHaveLength(0);
    });

    it("should generate unique UUIDs for different playlists", async () => {
      await setupCompleteTestDatabase();
      const playlist1 = {
        name: "First Playlist",
        description: "A".repeat(50),
      };
      const playlist2 = {
        name: "Second Playlist",
        description: "A".repeat(50),
      };

      // Create first playlist
      const response1 = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlist1),
      });

      expect(response1.status).toBe(201);
      const body1 = await response1.json();
      const createdPlaylist1 = body1.data;

      // Create second playlist
      const response2 = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlist2),
      });

      expect(response2.status).toBe(201);
      const body2 = await response2.json();
      const createdPlaylist2 = body2.data;

      // Verify both are valid UUIDs and 128 bits
      expect(isValidUUIDv4(createdPlaylist1.id)).toBe(true);
      expect(isValidUUIDv4(createdPlaylist2.id)).toBe(true);

      // Verify they are different
      expect(createdPlaylist1.id).not.toBe(createdPlaylist2.id);
    });
  });

  describe("Case 2: Validation error - Invalid data (400)", () => {
    it("should return 400 when the name is empty", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "",
        description: "A".repeat(50),
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "name: Name is required",
        instance: "/playlists",
      });
    });

    it("should return 400 when the description is too short", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "Integration Test Playlist",
        description: "Short",
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "description: Description of 50 characters is required",
        instance: "/playlists",
      });
    });

    it("should return 400 when the description is too long", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "Integration Test Playlist",
        description: "A".repeat(256),
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "description: Description of 255 characters is too long",
        instance: "/playlists",
      });
    });

    it("should return 400 when both fields are invalid", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "",
        description: "Short",
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail:
          "name: Name is required, description: Description of 50 characters is required",
        instance: "/playlists",
      });
    });

    it("should return 400 when the name only has spaces", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "   ",
        description:
          "A collection of my all-time favorite songs that I love to listen to on repeat",
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "name: Name is required",
        instance: "/playlists",
      });
    });

    it("should return 400 when the description only has spaces", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "My Playlist",
        description: "   ",
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "description: Description of 50 characters is required",
        instance: "/playlists",
      });
    });
  });

  describe("Additional validation cases", () => {
    it("should handle special characters correctly", async () => {
      await setupCompleteTestDatabase();
      const newPlaylist = {
        name: "¿Qué tal?",
        description:
          "Una colección de canciones con caracteres especiales & símbolos únicos que me encantan escuchar",
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("data");

      const createdPlaylist = body.data;
      comparePlaylistsData(createdPlaylist, newPlaylist, false);
      expect(createdPlaylist.songs).toHaveLength(0);
    });
  });
});
