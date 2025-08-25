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

  describe("Case 1: Database error - Internal server error (500)", () => {
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
