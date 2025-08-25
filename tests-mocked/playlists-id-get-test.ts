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

  describe("Case 1: Database error - Internal server error (500)", () => {
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
        "ER_NO_SUCH_TABLE: Table 'playlists_songs' doesn't exist"
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
        detail: "ER_NO_SUCH_TABLE: Table 'playlists_songs' doesn't exist",
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

  describe("Case 2: Edge cases", () => {
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
        },
        {
          id: 2,
          title: null, // Invalid: missing title
          artist: "Invalid Artist",
        },
        {
          id: 3,
          title: "Another Valid Song",
          artist: "Another Valid Artist",
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockPlaylist, []])
        .mockResolvedValueOnce([
          [
            { song_id: 1, added_at: new Date("2024-01-02T00:00:00.000Z") },
            { song_id: 2, added_at: new Date("2024-01-03T00:00:00.000Z") },
            { song_id: 3, added_at: new Date("2024-01-04T00:00:00.000Z") },
          ],
          [],
        ])
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
