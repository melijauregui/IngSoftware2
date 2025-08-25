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

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Database Error",
        status: 500,
        detail: "ER_CONNECTION_LOST: Connection lost to database",
        instance: "/playlists",
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM playlists ORDER BY published_at DESC"
      );
    });

    it("should return 500 when there is a database error during songs query", async () => {
      const mockPlaylists = [
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
        .mockResolvedValueOnce([mockPlaylists, []]) // First call for playlists succeeds
        .mockRejectedValueOnce(dbError); // Second call for songs fails

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Database Error",
        status: 500,
        detail: "ER_NO_SUCH_TABLE: Table 'playlists_songs' doesn't exist",
        instance: "/playlists",
      });
    });

    it("should return 500 with a generic message when the error is not an instance of Error", async () => {
      const dbError = new Error("Unknown database error");
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists", {
        method: "GET",
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

  describe("Case 2: Edge cases", () => {
    it("should handle playlist with invalid song data gracefully", async () => {
      const mockPlaylists = [
        {
          id: 1,
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
        .mockResolvedValueOnce([mockPlaylists, []])
        .mockResolvedValueOnce([mockSongs, []]);

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.data[0].songs).toHaveLength(2); // Only valid songs
      expect(responseBody.data[0].songs[0].title).toBe("Valid Song");
      expect(responseBody.data[0].songs[1].title).toBe("Another Valid Song");
    });
  });
});
