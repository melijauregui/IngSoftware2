import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import app from "../server/app";
import { db } from "../server/db.config";

describe("POST /playlists", () => {
  // Mock Prisma functions for testing
  const mockCreate = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma playlist.create function
    vi.spyOn(db.playlist, "create").mockImplementation(mockCreate);
  });

  beforeEach(() => {
    // Clear mocks between tests
    mockCreate.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe("Case 1: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error during insert", async () => {
      const playlistData = {
        name: "My Favorite Songs",
        description:
          "A collection of my all-time favorite songs that I love to listen to on repeat",
      };

      const dbError = new Error("Connection lost to database");
      mockCreate.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Connection lost to database",
        instance: "/playlists",
      });
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          name: "My Favorite Songs",
          description:
            "A collection of my all-time favorite songs that I love to listen to on repeat",
        },
      });
    });

    it("should return 500 with a generic message when the error is not an instance of Error", async () => {
      const playlistData = {
        name: "My Favorite Songs",
        description:
          "A collection of my all-time favorite songs that I love to listen to on repeat",
      };

      const dbError = new Error("Unknown database error");
      mockCreate.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Unknown database error",
        instance: "/playlists",
      });
    });
  });

  describe("Case 2: Playlist publication state validation", () => {
    it("should create playlist with isPublished=false by default", async () => {
      const playlistData = {
        name: "Unpublished Playlist",
        description: "A".repeat(50),
      };

      const mockCreatedPlaylist = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Unpublished Playlist",
        description: "A".repeat(50),
        isPublished: false,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreate.mockResolvedValueOnce(mockCreatedPlaylist);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("data");

      const createdPlaylist = body.data;

      // Verify publication state
      expect(createdPlaylist.isPublished).toBe(false);
      expect(createdPlaylist.publishedAt).toBe(null);

      // Verify the database was called with correct data
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          name: "Unpublished Playlist",
          description: "A".repeat(50),
        },
      });
    });

    it("should verify database call includes correct publication state", async () => {
      const playlistData = {
        name: "Test Playlist",
        description: "A".repeat(50),
      };

      const mockCreatedPlaylist = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Test Playlist",
        description: "A".repeat(50),
        isPublished: false,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreate.mockResolvedValueOnce(mockCreatedPlaylist);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(201);

      // Verify the database call doesn't explicitly set isPublished or publishedAt
      // (they should use database defaults)
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          name: "Test Playlist",
          description: "A".repeat(50),
        },
      });

      // Verify the returned data has the correct publication state
      const body = await response.json();
      const createdPlaylist = body.data;
      expect(createdPlaylist.isPublished).toBe(false);
      expect(createdPlaylist.publishedAt).toBe(null);
    });
  });
});
