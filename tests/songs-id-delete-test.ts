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
      const songId = 1;

      // Mock the DELETE query - one row affected
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);
      expect(response.body).toBe(null);
      expect(mockQuery).toHaveBeenCalledWith("DELETE FROM songs WHERE id = ?", [
        songId,
      ]);
    });
  });

  describe("Case 2: Not Found - Song doesn't exist (404)", () => {
    it("should return 404 when song with given ID doesn't exist", async () => {
      const songId = 999;

      // Mock the DELETE query - no rows affected
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }, []]);

      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
      });

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
      const songId = 1;
      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
      });

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
      const songId = 1;
      const dbError = new Error("Internal Server Error");
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
      });

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
      const invalidId = "abc";

      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when ID is zero", async () => {
      const invalidId = 0;

      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when ID is negative", async () => {
      const invalidId = -1;

      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when ID is a decimal number", async () => {
      const invalidId = 1.5;

      const response = await app.request(`/songs/${invalidId}`, {
        method: "DELETE",
      });

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
      const response = await app.request("/songs/1", {
        method: "POST",
      });

      expect(response.status).toBe(404);
    });
  });
});
