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

describe("POST /playlists/{id}/songs", () => {
  // Mock Prisma functions for testing
  const mockFindUniquePlaylist = vi.fn();
  const mockFindUniqueSong = vi.fn();
  const mockCreate = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma playlist.findUnique function
    vi.spyOn(db.playlist, "findUnique").mockImplementation(
      mockFindUniquePlaylist
    );
    // Mock the Prisma song.findUnique function
    vi.spyOn(db.song, "findUnique").mockImplementation(mockFindUniqueSong);
    // Mock the Prisma playlistsSongs.create function
    vi.spyOn(db.playlistsSongs, "create").mockImplementation(mockCreate);
  });

  beforeEach(() => {
    // Clear mocks between tests
    mockFindUniquePlaylist.mockClear();
    mockFindUniqueSong.mockClear();
    mockCreate.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe("Case 1: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error", async () => {
      const playlistId = "550e8400-e29b-41d4-a716-446655440001";
      const songId = 5;
      const requestBody = { songId };

      const dbError = new Error("Connection lost to database");
      mockFindUniquePlaylist.mockRejectedValueOnce(dbError);

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Connection lost to database",
        instance: `/playlists/${playlistId}/songs`,
      });

      expect(mockFindUniquePlaylist).toHaveBeenCalledWith({
        where: { id: playlistId },
      });
    });

    it("should return 500 with a generic message when the error is not an instance of Error", async () => {
      const playlistId = "550e8400-e29b-41d4-a716-446655440001";
      const songId = 5;
      const requestBody = { songId };

      const dbError = new Error("Unknown database error");
      mockFindUniquePlaylist.mockRejectedValueOnce(dbError);

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Unknown database error",
        instance: `/playlists/${playlistId}/songs`,
      });
    });
  });
});
