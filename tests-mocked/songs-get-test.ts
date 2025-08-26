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

describe("GET /songs", () => {
  // Mock Prisma functions for testing
  const mockFindMany = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma song.findMany function
    vi.spyOn(db.song, "findMany").mockImplementation(mockFindMany);
  });

  beforeEach(() => {
    // Clear mock between tests
    mockFindMany.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe("Case 1: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database connection error", async () => {
      const dbError = new Error("Connection lost to database");
      mockFindMany.mockRejectedValueOnce(dbError);

      const response = await app.request("/songs", {
        method: "GET",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Connection lost to database",
        instance: "/songs",
      });
      expect(mockFindMany).toHaveBeenCalledWith();
    });
  });

  describe("Case 2: Data validation - Schema validation errors", () => {
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
          artist: "",
        },
      ];

      mockFindMany.mockResolvedValueOnce(mockSongs);

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
      expect(mockFindMany).toHaveBeenCalledWith();
    });

    it("should handle songs with invalid data types", async () => {
      const mockSongs = [
        {
          id: "invalid_id",
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
      ];

      mockFindMany.mockResolvedValueOnce(mockSongs);

      const response = await app.request("/songs", {
        method: "GET",
      });

      // Should return 200 with empty data array since all songs are invalid
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: [],
      });
      expect(mockFindMany).toHaveBeenCalledWith();
    });
  });
});
