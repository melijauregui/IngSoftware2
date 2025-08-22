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

  describe("Case 1: Success - Retrieve all songs successfully (201)", () => {
    it("should return all songs when database has songs", async () => {
      // Arrange
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

      // Act
      const response = await app.request("/songs", {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(201);
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
      // Arrange
      const mockSongs: any[] = [];
      mockQuery.mockResolvedValueOnce([mockSongs, []]);

      // Act
      const response = await app.request("/songs", {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [],
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });

    it("should return single song when database has only one song", async () => {
      // Arrange
      const mockSongs = [
        {
          id: 1,
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
      ];

      mockQuery.mockResolvedValueOnce([mockSongs, []]);

      // Act
      const response = await app.request("/songs", {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(201);
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
      // Arrange
      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      // Act
      const response = await app.request("/songs", {
        method: "GET",
      });

      // Assert
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
      // Arrange
      const dbError = new Error("Internal Server Error");
      mockQuery.mockRejectedValueOnce(dbError);

      // Act
      const response = await app.request("/songs", {
        method: "GET",
      });

      // Assert
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
      // Arrange
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

      // Act
      const response = await app.request("/songs", {
        method: "GET",
      });

      // Assert
      // This should fail because the second song doesn't match the schema
      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: expect.stringContaining("artist"),
        instance: "/songs",
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });

    it("should handle songs with invalid data types", async () => {
      // Arrange
      const mockSongs = [
        {
          id: "invalid_id", // Should be number
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
      ];

      mockQuery.mockResolvedValueOnce([mockSongs, []]);

      // Act
      const response = await app.request("/songs", {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: expect.stringContaining("Expected number"),
        instance: "/songs",
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM songs");
    });
  });

  describe("Case 5: HTTP method validation", () => {
    it("should return 404 for PUT request to /songs endpoint", async () => {
      // Act
      const response = await app.request("/songs", {
        method: "PUT",
      });

      // Assert
      expect(response.status).toBe(404);
    });

    it("should return 404 for DELETE request to /songs endpoint", async () => {
      // Act
      const response = await app.request("/songs", {
        method: "DELETE",
      });

      // Assert
      expect(response.status).toBe(404);
    });
  });
});
