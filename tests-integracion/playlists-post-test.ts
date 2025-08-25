import { describe, it, expect, beforeEach, afterEach } from "vitest";

import "../config.test";

import app from "../server/app";
import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
} from "../server/db.test";
import { comparePlaylistsData } from "./tests-functions";

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
      expect(createdPlaylist.songs).toHaveLength(0);
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
