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

describe("GET /songs/:id", () => {
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

  describe("Case 1: Success - Retrieve song by ID successfully (200)", () => {
    it("should return a song when it exists in the database", async () => {
      // Arrange
      const songId = 1;
      const mockSong = {
        id: 1,
        title: "Bohemian Rhapsody",
        artist: "Queen",
      };

      mockQuery.mockResolvedValueOnce([[mockSong], []]);

      // Act
      const response = await app.request(`/songs/${songId}`, {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 1,
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
    });
  });

  describe("Case 2: Not Found - Song doesn't exist (404)", () => {
    it("should return 404 when song with given ID doesn't exist", async () => {
      // Arrange
      const songId = 999;
      mockQuery.mockResolvedValueOnce([[], []]);

      // Act
      const response = await app.request(`/songs/${songId}`, {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "Song not found with id: 999",
        instance: "/songs/999",
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
    });
  });

  describe("Case 3: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database connection error", async () => {
      // Arrange
      const songId = 1;
      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      // Act
      const response = await app.request(`/songs/${songId}`, {
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
        instance: `/songs/${songId}`,
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
    });

    it("should return 500 with a generic message when the error is not a database error", async () => {
      // Arrange
      const songId = 1;
      const dbError = new Error("Internal Server Error");
      mockQuery.mockRejectedValueOnce(dbError);

      // Act
      const response = await app.request(`/songs/${songId}`, {
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
        instance: `/songs/${songId}`,
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
    });
  });

  describe("Case 4: Data validation - Schema validation errors", () => {
    it("should return 404 when song data is invalid (missing required fields)", async () => {
      // Arrange
      const songId = 1;
      const invalidSong = {
        id: 1,
        title: "Bohemian Rhapsody",
        // Missing artist field
      };

      mockQuery.mockResolvedValueOnce([[invalidSong], []]);

      // Act
      const response = await app.request(`/songs/${songId}`, {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "Song not found with id: 1",
        instance: "/songs/1",
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
    });
  });

  describe("Case 5: Parameter validation - Invalid ID parameter", () => {
    it("should return 400 when ID is not a number", async () => {
      // Act
      const response = await app.request("/songs/abc", {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when ID is zero", async () => {
      // Act
      const response = await app.request("/songs/0", {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when ID is negative", async () => {
      // Act
      const response = await app.request("/songs/-1", {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when ID is a decimal number", async () => {
      // Act
      const response = await app.request("/songs/1.5", {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });
  });
});
