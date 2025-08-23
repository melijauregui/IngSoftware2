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

describe("GET /songs", () => {
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

  describe("Case 1: Success - Retrieve all songs successfully (200)", () => {
    it("should return all songs when database has songs", async () => {
      const mockSongs = [
        {
          id: 1,
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
        {
          id: 2,
          title: "Hotel California",
          artist: "Eagles",
        },
        {
          id: 3,
          title: "Stairway to Heaven",
          artist: "Led Zeppelin",
        },
      ];

      mockQuery.mockResolvedValueOnce([mockSongs, []]);

      const response = await app.request("/songs", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [
          {
            id: 1,
            title: "Bohemian Rhapsody",
            artist: "Queen",
          },
          {
            id: 2,
            title: "Hotel California",
            artist: "Eagles",
          },
          {
            id: 3,
            title: "Stairway to Heaven",
            artist: "Led Zeppelin",
          },
        ],
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });

    it("should return empty array when database has no songs", async () => {
      const mockSongs: any[] = [];
      mockQuery.mockResolvedValueOnce([mockSongs, []]);

      const response = await app.request("/songs", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [],
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });

    it("should return single song when database has only one song", async () => {
      const mockSongs = [
        {
          id: 1,
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
      ];

      mockQuery.mockResolvedValueOnce([mockSongs, []]);

      const response = await app.request("/songs", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [
          {
            id: 1,
            title: "Bohemian Rhapsody",
            artist: "Queen",
          },
        ],
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });
  });

  describe("Case 2: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database connection error", async () => {
      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/songs", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Database Error",
        status: 500,
        detail: "ER_CONNECTION_LOST: Connection lost to database",
        instance: "/songs",
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });

    it("should return 500 with a generic message when the error is not a database error", async () => {
      const dbError = new Error("Internal Server Error");
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/songs", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Internal Server Error",
        instance: "/songs",
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });
  });

  describe("Case 3: Data validation - Schema validation errors", () => {
    it("should handle songs with missing required fields gracefully", async () => {
      const mockSongs = [
        {
          id: 1,
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
        {
          id: 2,
          title: "Hotel California",
          // Missing artist field
        },
      ];

      mockQuery.mockResolvedValueOnce([mockSongs, []]);

      const response = await app.request("/songs", {
        method: "GET",
      });

      // Should return 200 with only valid songs, invalid ones are filtered out
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [
          {
            id: 1,
            title: "Bohemian Rhapsody",
            artist: "Queen",
          },
        ],
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });

    it("should handle songs with invalid data types", async () => {
      const mockSongs = [
        {
          id: "invalid_id", // Should be number
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
      ];

      mockQuery.mockResolvedValueOnce([mockSongs, []]);

      const response = await app.request("/songs", {
        method: "GET",
      });

      // Should return 200 with empty data array since all songs are invalid
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [],
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });
  });

  describe("Case 5: HTTP method validation", () => {
    it("should return 404 for PUT request to /songs endpoint", async () => {
      const response = await app.request("/songs", {
        method: "PUT",
      });

      expect(response.status).toBe(404);
    });

    it("should return 404 for DELETE request to /songs endpoint", async () => {
      const response = await app.request("/songs", {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
    });
  });
});
