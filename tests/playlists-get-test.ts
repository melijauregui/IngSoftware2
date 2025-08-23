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

  describe("Case 1: Success - Retrieve playlists successfully (200)", () => {
    it("should return empty array when no playlists exist", async () => {
      // Mock empty result
      mockQuery.mockResolvedValueOnce([[], []]); // No playlists

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [],
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM playlists ORDER BY published_at DESC"
      );
    });

    it("should return single playlist without songs", async () => {
      const mockPlaylists = [
        {
          id: 1,
          name: "My Favorite Songs",
          description:
            "A collection of my all-time favorite songs that I love to listen to on repeat",
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      const mockSongs = [];

      mockQuery
        .mockResolvedValueOnce([mockPlaylists, []]) // First call for playlists
        .mockResolvedValueOnce([mockSongs, []]); // Second call for songs

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [
          {
            id: 1,
            name: "My Favorite Songs",
            description:
              "A collection of my all-time favorite songs that I love to listen to on repeat",
            isPublished: true,
            publishedAt: "2024-01-01T00:00:00.000Z",
            songs: [],
          },
        ],
      });
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        "SELECT * FROM playlists ORDER BY published_at DESC"
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        "SELECT * FROM playlist_songs WHERE playlist_id = ?",
        [1]
      );
    });

    it("should return single playlist with songs", async () => {
      const mockPlaylists = [
        {
          id: 1,
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
        .mockResolvedValueOnce([mockPlaylists, []]) // First call for playlists
        .mockResolvedValueOnce([mockSongs, []]); // Second call for songs

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [
          {
            id: 1,
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
        ],
      });
    });

    it("should return multiple playlists ordered by publishedAt desc", async () => {
      const mockPlaylists = [
        {
          id: 2,
          name: "New Playlist",
          description:
            "A newer playlist created after the first one with some great songs",
          is_published: 1,
          published_at: new Date("2025-01-02T00:00:00.000Z"),
        },
        {
          id: 1,
          name: "Old Playlist",
          description:
            "An older playlist created before the second one with some classic songs",
          is_published: 1,
          published_at: new Date("2025-01-01T00:00:00.000Z"),
        },
      ];

      const mockSongs1 = [
        {
          id: 3,
          title: "New Song",
          artist: "New Artist",
          added_at: new Date("2025-01-04T00:00:00.000Z"),
        },
      ];

      const mockSongs2 = [
        {
          id: 1,
          title: "Old Song",
          artist: "Old Artist",
          added_at: new Date("2025-01-03T00:00:00.000Z"),
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockPlaylists, []]) // First call for playlists
        .mockResolvedValueOnce([mockSongs1, []]) // Second call for songs of playlist 2
        .mockResolvedValueOnce([mockSongs2, []]); // Third call for songs of playlist 1

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.data).toHaveLength(2);

      // Check order: newest first
      expect(responseBody.data[0].id).toBe(2);
      expect(responseBody.data[0].name).toBe("New Playlist");
      expect(responseBody.data[1].id).toBe(1);
      expect(responseBody.data[1].name).toBe("Old Playlist");
    });
  });

  describe("Case 2: Database error - Internal server error (500)", () => {
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
        "ER_NO_SUCH_TABLE: Table 'playlist_songs' doesn't exist"
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
        detail: "ER_NO_SUCH_TABLE: Table 'playlist_songs' doesn't exist",
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

  describe("Case 3: Edge cases", () => {
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

    it("should handle playlist with unpublished status", async () => {
      const mockPlaylists = [
        {
          id: 1,
          name: "Unpublished Playlist",
          description: "A".repeat(50),
          is_published: 0, // Unpublished
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      const mockSongs = [];

      mockQuery
        .mockResolvedValueOnce([mockPlaylists, []])
        .mockResolvedValueOnce([mockSongs, []]);

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.data[0].isPublished).toBe(false);
    });

    it("should handle very long playlist names and descriptions", async () => {
      const mockPlaylists = [
        {
          id: 1,
          name: "A".repeat(50), // Maximum length
          description: "A".repeat(255), // Maximum length
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      const mockSongs = [];

      mockQuery
        .mockResolvedValueOnce([mockPlaylists, []])
        .mockResolvedValueOnce([mockSongs, []]);

      const response = await app.request("/playlists", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.data[0].name).toHaveLength(50);
      expect(responseBody.data[0].description).toHaveLength(255);
    });
  });
});
