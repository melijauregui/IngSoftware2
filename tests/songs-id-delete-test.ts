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

describe("DELETE /songs/:id", () => {
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

  describe("Case 1: Success - Delete song by ID successfully (204)", () => {
    it("should delete a song when it exists in the database", async () => {
      // Arrange
      const songId = 1;

      // Mock the DELETE query - one row affected
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      // Act
      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
      });

      // Assert
      expect(response.status).toBe(204);
      expect(response.body).toBe(null);
      expect(mockQuery).toHaveBeenCalledWith("DELETE FROM songs WHERE id = ?", [
        songId,
      ]);
    });
  });

  describe("Case 2: Not Found - Song doesn't exist (404)", () => {
    it("should return 404 when song with given ID doesn't exist", async () => {
      // Arrange
      const songId = 999;

      // Mock the DELETE query - no rows affected
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }, []]);

      // Act
      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
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
      expect(mockQuery).toHaveBeenCalledWith("DELETE FROM songs WHERE id = ?", [
        songId,
      ]);
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
        method: "DELETE",
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
    });

    it("should return 500 with a generic message when the error is not a database error", async () => {
      // Arrange
      const songId = 1;
      const dbError = new Error("Internal Server Error");
      mockQuery.mockRejectedValueOnce(dbError);

      // Act
      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
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
    });
  });

  describe("Case 4: Parameter validation - Invalid ID parameter (400)", () => {
    it("should return 400 when ID is not a number", async () => {
      // Arrange
      const invalidId = "abc";

      // Act
      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
      });

      // Assert
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when ID is zero", async () => {
      // Arrange
      const invalidId = 0;

      // Act
      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
      });

      // Assert
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when ID is negative", async () => {
      // Arrange
      const invalidId = -1;

      // Act
      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
      });

      // Assert
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when ID is a decimal number", async () => {
      // Arrange
      const invalidId = 1.5;

      // Act
      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
      });

      // Assert
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });
  });

  describe("Case 5: HTTP method validation", () => {
    it("should return 404 for POST request to /songs/:id endpoint", async () => {
      // Act
      const response = await app.request("/songs/1", {
        method: "POST",
      });

      // Assert
      expect(response.status).toBe(404);
    });
  });
});
