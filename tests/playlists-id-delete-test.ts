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

describe("DELETE /playlists/:id", () => {
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

  describe("Case 1: Success - Delete playlist successfully (204)", () => {
    it("should delete a playlist successfully and return 204", async () => {
      const mockResult = [
        {
          affectedRows: 1,
          insertId: 0,
          changedRows: 0,
        },
      ];

      mockQuery.mockResolvedValueOnce([mockResult, []]);

      const response = await app.request("/playlists/1", {
        method: "DELETE",
      });

      expect(response.status).toBe(204);
      const responseBody = await response.text();
      expect(responseBody).toBe("");
      expect(mockQuery).toHaveBeenCalledWith(
        "DELETE FROM playlists WHERE id = ?",
        [1]
      );
    });
  });

  describe("Case 2: Validation error - Invalid ID (400)", () => {
    it("should return 400 when ID is not a number", async () => {
      const response = await app.request("/playlists/abc", {
        method: "DELETE",
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
        method: "DELETE",
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
        method: "DELETE",
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
      const mockResult = [
        {
          affectedRows: 0,
          insertId: 0,
          changedRows: 0,
        },
      ];

      mockQuery.mockResolvedValueOnce([mockResult, []]);

      const response = await app.request("/playlists/999", {
        method: "DELETE",
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
        "DELETE FROM playlists WHERE id = ?",
        [999]
      );
    });
  });

  describe("Case 4: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error", async () => {
      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists/1", {
        method: "DELETE",
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
        "DELETE FROM playlists WHERE id = ?",
        [1]
      );
    });

    it("should return 500 when there is a table not found error", async () => {
      const dbError = new Error(
        "ER_NO_SUCH_TABLE: Table 'playlists' doesn't exist"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists/1", {
        method: "DELETE",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Database Error",
        status: 500,
        detail: "ER_NO_SUCH_TABLE: Table 'playlists' doesn't exist",
        instance: "/playlists/1",
      });
    });

    it("should return 500 with a generic message when the error is not an instance of Error", async () => {
      const dbError = new Error("Unknown database error");
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists/1", {
        method: "DELETE",
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
});
