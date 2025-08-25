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

  describe("Case 1: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database connection error", async () => {
      const songId = 1;
      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request(`/songs/${songId}`, {
        method: "GET",
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
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
    });

    it("should return 500 with a generic message when the error is not a database error", async () => {
      const songId = 1;
      const dbError = new Error("Internal Server Error");
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request(`/songs/${songId}`, {
        method: "GET",
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
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
    });
  });

  describe("Case 2: Data validation - Schema validation errors", () => {
    it("should return 404 when song data is invalid (missing required fields)", async () => {
      const songId = 1;
      const invalidSong = {
        id: 1,
        title: "Bohemian Rhapsody",
        // Missing artist field
      };

      mockQuery.mockResolvedValueOnce([[invalidSong], []]);

      const response = await app.request(`/songs/${songId}`, {
        method: "GET",
      });

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
});
