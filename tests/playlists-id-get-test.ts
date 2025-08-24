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
import { db } from "../server/db";

describe("GET /playlists/:id", () => {
  // Mock database for testing
  const mockQuery = vi.fn();

  beforeAll(async () => {
    // Mock the database query method
    vi.spyOn(db, "query").mockImplementation(mockQuery);
  });

  beforeEach(() => {
    // Clear mock between tests
    mockQuery.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe("Case 1: Success - Retrieve playlist successfully (200)", () => {
    it("should return playlist without songs when it exists", async () => {
      const mockPlaylist = [
        {
          id: 1,
          name: "My Favorite Songs",
          description:
            "A collection of my all-time favorite songs that I love to listen to on repeat",
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      const mockSongs = []; // No songs

      mockQuery
        .mockResolvedValueOnce([mockPlaylist, []]) // First call for playlist
        .mockResolvedValueOnce([mockSongs, []]); // Second call for songs

      const response = await app.request("/playlists/1", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 1,
          name: "My Favorite Songs",
          description:
            "A collection of my all-time favorite songs that I love to listen to on repeat",
          isPublished: true,
          publishedAt: "2024-01-01T00:00:00.000Z",
          songs: [],
        },
      });
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        "SELECT * FROM playlists WHERE id = ?",
        [1]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        "SELECT * FROM playlist_songs WHERE playlist_id = ?",
        [1]
      );
    });

    it("should return playlist with songs when it exists", async () => {
      const mockPlaylist = [
        {
          id: 2,
          name: "Rock Classics",
          description:
            "The best rock songs from the 70s and 80s that defined a generation",
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      const mockSongs = [
        {
          id: 1,
          title: "Bohemian Rhapsody",
          artist: "Queen",
          added_at: new Date("2024-01-02T00:00:00.000Z"),
        },
        {
          id: 2,
          title: "Stairway to Heaven",
          artist: "Led Zeppelin",
          added_at: new Date("2024-01-03T00:00:00.000Z"),
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockPlaylist, []]) // First call for playlist
        .mockResolvedValueOnce([mockSongs, []]); // Second call for songs

      const response = await app.request("/playlists/2", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 2,
          name: "Rock Classics",
          description:
            "The best rock songs from the 70s and 80s that defined a generation",
          isPublished: true,
          publishedAt: "2024-01-01T00:00:00.000Z",
          songs: [
            {
              id: 1,
              title: "Bohemian Rhapsody",
              artist: "Queen",
              addedAt: "2024-01-02T00:00:00.000Z",
            },
            {
              id: 2,
              title: "Stairway to Heaven",
              artist: "Led Zeppelin",
              addedAt: "2024-01-03T00:00:00.000Z",
            },
          ],
        },
      });
    });
  });

  describe("Case 2: Validation error - Invalid ID (400)", () => {
    it("should return 400 when ID is not a number", async () => {
      const response = await app.request("/playlists/abc", {
        method: "GET",
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
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when ID is negative", async () => {
      const response = await app.request("/playlists/-1", {
        method: "GET",
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
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when ID is a decimal number", async () => {
      const response = await app.request("/playlists/1.5", {
        method: "GET",
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
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  describe("Case 3: Not found - Playlist not found (404)", () => {
    it("should return 404 when playlist does not exist", async () => {
      // Mock empty result for playlist query
      mockQuery.mockResolvedValueOnce([[], []]);

      const response = await app.request("/playlists/999", {
        method: "GET",
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
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM playlists WHERE id = ?",
        [999]
      );
    });
  });

  describe("Case 4: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error during playlist query", async () => {
      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists/1", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Database Error",
        status: 500,
        detail: "ER_CONNECTION_LOST: Connection lost to database",
        instance: "/playlists/1",
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM playlists WHERE id = ?",
        [1]
      );
    });

    it("should return 500 when there is a database error during songs query", async () => {
      const mockPlaylist = [
        {
          id: 1,
          name: "My Playlist",
          description: "A".repeat(50),
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      const dbError = new Error(
        "ER_NO_SUCH_TABLE: Table 'playlist_songs' doesn't exist"
      );

      mockQuery
        .mockResolvedValueOnce([mockPlaylist, []]) // First call for playlist succeeds
        .mockRejectedValueOnce(dbError); // Second call for songs fails

      const response = await app.request("/playlists/1", {
        method: "GET",
      });

      // The error should be handled as a database error (500)
      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Database Error",
        status: 500,
        detail: "ER_NO_SUCH_TABLE: Table 'playlist_songs' doesn't exist",
        instance: "/playlists/1",
      });
    });

    it("should return 500 with a generic message when the error is not an instance of Error", async () => {
      const dbError = new Error("Unknown database error");
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists/1", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Unknown database error",
        instance: "/playlists/1",
      });
    });
  });

  describe("Case 5: Edge cases", () => {
    it("should handle playlist with invalid playlist data gracefully", async () => {
      const mockPlaylist = [
        {
          id: 7,
          name: "Test Playlist",
          description: "A".repeat(20), // 20 characters is too short
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      mockQuery.mockResolvedValueOnce([mockPlaylist, []]);

      const response = await app.request("/playlists/7", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Failed to get playlist data",
        instance: "/playlists/7",
      });
    });
    it("should handle playlist with invalid song data gracefully", async () => {
      const mockPlaylist = [
        {
          id: 7,
          name: "Test Playlist",
          description: "A".repeat(50),
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      const mockSongs = [
        {
          id: 1,
          title: "Valid Song",
          artist: "Valid Artist",
          added_at: new Date("2024-01-02T00:00:00.000Z"),
        },
        {
          id: 2,
          title: null, // Invalid: missing title
          artist: "Invalid Artist",
          added_at: new Date("2024-01-03T00:00:00.000Z"),
        },
        {
          id: 3,
          title: "Another Valid Song",
          artist: "Another Valid Artist",
          added_at: new Date("2024-01-04T00:00:00.000Z"),
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockPlaylist, []])
        .mockResolvedValueOnce([mockSongs, []]);

      const response = await app.request("/playlists/7", {
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
