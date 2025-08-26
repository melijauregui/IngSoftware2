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

describe("GET /playlists", () => {
  // Mock Prisma functions for testing
  const mockFindMany = vi.fn();
  const mockFindManyPlaylistsSongs = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma playlist.findMany function
    vi.spyOn(db.playlist, "findMany").mockImplementation(mockFindMany);
    // Mock the Prisma playlistsSongs.findMany function
    vi.spyOn(db.playlistsSongs, "findMany").mockImplementation(
      mockFindManyPlaylistsSongs
    );
  });

  beforeEach(() => {
    // Clear mocks between tests
    mockFindMany.mockClear();
    mockFindManyPlaylistsSongs.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe("Case 1: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error during playlist query", async () => {
      // Simular un error real de conexión a la base de datos
      const dbError = new Error("Connection lost to database");
      mockFindMany.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists", {
        method: "GET",
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

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        orderBy: [
          { isPublished: "desc" }, // Siempre true primero, false después
          { publishedAt: "desc" }, // Luego ordena por fecha
        ],
      });
    });

    it("should return 500 when there is a database error during songs query", async () => {
      const mockPlaylists = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "My Playlist",
          description: "A".repeat(50),
          isPublished: true,
          publishedAt: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      const dbError = new Error("Table 'playlists_songs' doesn't exist");

      // First call for playlists succeeds, second call for songs fails
      mockFindMany.mockResolvedValueOnce(mockPlaylists); // First call for playlists succeeds
      mockFindManyPlaylistsSongs.mockRejectedValueOnce(dbError); // Second call for songs fails

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Table 'playlists_songs' doesn't exist",
        instance: "/playlists",
      });
    });
  });

  describe("Case 2: Edge cases", () => {
    it("should handle playlist with invalid song data gracefully", async () => {
      const mockPlaylists = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Test Playlist",
          description: "A".repeat(50),
          isPublished: true,
          publishedAt: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      const mockPlaylistSongs = [
        {
          playlistId: "550e8400-e29b-41d4-a716-446655440001",
          songId: 1,
          addedAt: new Date("2024-01-02T00:00:00.000Z"),
          song: {
            id: 1,
            title: "Valid Song",
            artist: "Valid Artist",
          },
        },
        {
          playlistId: "550e8400-e29b-41d4-a716-446655440001",
          songId: 2,
          addedAt: new Date("2024-01-03T00:00:00.000Z"),
          song: {
            id: 2,
            title: "", // Invalid title
            artist: "Invalid Artist",
          },
        },
        {
          playlistId: "550e8400-e29b-41d4-a716-446655440001",
          songId: 3,
          addedAt: new Date("2024-01-04T00:00:00.000Z"),
          song: {
            id: 3,
            title: "Another Valid Song",
            artist: "Another Valid Artist",
          },
        },
      ];

      // Mock para obtener playlists
      mockFindMany.mockResolvedValueOnce(mockPlaylists);
      // Mock para obtener canciones de la playlist (incluyendo una inválida)
      mockFindManyPlaylistsSongs.mockResolvedValueOnce(mockPlaylistSongs);

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      // Verificar que la playlist tiene canciones
      expect(responseBody.data[0].songs).toHaveLength(2); // Solo canciones válidas
      expect(responseBody.data[0].songs[0].title).toBe("Valid Song");
      expect(responseBody.data[0].songs[1].title).toBe("Another Valid Song");

      // Verificar que se filtraron las canciones inválidas
      const invalidSong = responseBody.data[0].songs.find(
        (song) => song.title === null
      );
      expect(invalidSong).toBeUndefined();
    });
  });
});
