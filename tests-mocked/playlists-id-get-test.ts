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

describe("GET /playlists/:id", () => {
  // Mock Prisma functions for testing
  const mockFindUnique = vi.fn();
  const mockFindManyPlaylistsSongs = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma playlist.findUnique function
    vi.spyOn(db.playlist, "findUnique").mockImplementation(mockFindUnique);
    // Mock the Prisma playlistsSongs.findMany function
    vi.spyOn(db.playlistsSongs, "findMany").mockImplementation(
      mockFindManyPlaylistsSongs
    );
  });

  beforeEach(() => {
    // Clear mocks between tests
    mockFindUnique.mockClear();
    mockFindManyPlaylistsSongs.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe("Case 1: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error during playlist query", async () => {
      const dbError = new Error("Connection lost to database");
      mockFindUnique.mockRejectedValueOnce(dbError);

      const playlistId = "550e8400-e29b-41d4-a716-446655440001";
      const response = await app.request(`/playlists/${playlistId}`, {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Connection lost to database",
        instance: `/playlists/${playlistId}`,
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: playlistId },
      });
    });

    it("should return 500 when there is a database error during songs query", async () => {
      const mockPlaylist = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "My Playlist",
        description: "A".repeat(50),
        isPublished: true,
        publishedAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      const dbError = new Error("Table 'playlists_songs' doesn't exist");

      const playlistId = "550e8400-e29b-41d4-a716-446655440001";
      // First call for playlist succeeds, second call for songs fails
      mockFindUnique.mockResolvedValueOnce(mockPlaylist);
      mockFindManyPlaylistsSongs.mockRejectedValueOnce(dbError);

      const response = await app.request(`/playlists/${playlistId}`, {
        method: "GET",
      });

      // The error should be handled as a database error (500)
      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Table 'playlists_songs' doesn't exist",
        instance: `/playlists/${playlistId}`,
      });
    });
  });

  describe("Case 2: Edge cases", () => {
    it("should handle playlist with invalid playlist data gracefully", async () => {
      const mockPlaylist = {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Test Playlist",
        description: "A".repeat(20), // 20 characters is too short
        isPublished: true,
        publishedAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      mockFindUnique.mockResolvedValueOnce(mockPlaylist);

      const playlistId = "550e8400-e29b-41d4-a716-446655440002";
      const response = await app.request(`/playlists/${playlistId}`, {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Failed to get playlist data",
        instance: `/playlists/${playlistId}`,
      });
    });

    it("should handle playlist with invalid song data gracefully", async () => {
      const mockPlaylist = {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Test Playlist",
        description: "A".repeat(50),
        isPublished: true,
        publishedAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      const mockPlaylistSongs = [
        {
          playlistId: "550e8400-e29b-41d4-a716-446655440003",
          songId: 1,
          addedAt: new Date("2024-01-02T00:00:00.000Z"),
          song: {
            id: 1,
            title: "Valid Song",
            artist: "Valid Artist",
          },
        },
        {
          playlistId: "550e8400-e29b-41d4-a716-446655440003",
          songId: 2,
          addedAt: new Date("2024-01-03T00:00:00.000Z"),
          song: {
            id: 2,
            title: "", // Invalid title
            artist: "Invalid Artist",
          },
        },
        {
          playlistId: "550e8400-e29b-41d4-a716-446655440003",
          songId: 3,
          addedAt: new Date("2024-01-04T00:00:00.000Z"),
          song: {
            id: 3,
            title: "Another Valid Song",
            artist: "Another Valid Artist",
          },
        },
      ];

      const playlistId = "550e8400-e29b-41d4-a716-446655440003";
      // Mock para obtener playlist
      mockFindUnique.mockResolvedValueOnce(mockPlaylist);
      // Mock para obtener canciones de la playlist (incluyendo una inválida)
      mockFindManyPlaylistsSongs.mockResolvedValueOnce(mockPlaylistSongs);

      const response = await app.request(`/playlists/${playlistId}`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.data.songs).toHaveLength(2); // Only valid songs
      expect(responseBody.data.songs[0].title).toBe("Valid Song");
      expect(responseBody.data.songs[1].title).toBe("Another Valid Song");
    });
  });
});
