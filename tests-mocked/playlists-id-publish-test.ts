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
import * as playlistsFunctions from "../server/playlists/functions";

describe("POST /playlists/{id}/publish", () => {
  // Mock Prisma functions for testing
  const mockFindUnique = vi.fn();
  const mockUpdate = vi.fn();
  const mockGetPlaylistById = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma playlist functions
    vi.spyOn(db.playlist, "findUnique").mockImplementation(mockFindUnique);
    vi.spyOn(db.playlist, "update").mockImplementation(mockUpdate);
    // Mock the getPlaylistById function
    vi.spyOn(playlistsFunctions, "getPlaylistById").mockImplementation(
      mockGetPlaylistById
    );
  });

  beforeEach(() => {
    // Clear mocks between tests
    mockFindUnique.mockClear();
    mockUpdate.mockClear();
    mockGetPlaylistById.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe("Case 1: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error during playlist lookup", async () => {
      const playlistId = "550e8400-e29b-41d4-a716-446655440001";
      const dbError = new Error("Connection lost to database");
      mockFindUnique.mockRejectedValueOnce(dbError);

      const response = await app.request(`/playlists/${playlistId}/publish`, {
        method: "POST",
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Connection lost to database",
        instance: `/playlists/${playlistId}/publish`,
      });
    });
  });

  it("should update playlist with null publishedAt even if isPublished is true", async () => {
    const playlistId = "550e8400-e29b-41d4-a716-446655440001";

    // Mock playlist with isPublished=true but publishedAt=null (inconsistent state)
    const mockInconsistentPlaylist = {
      id: playlistId,
      name: "Inconsistent Playlist",
      description: "A".repeat(50),
      isPublished: true,
      publishedAt: null,
    };

    // Mock updated playlist
    const mockUpdatedPlaylist = {
      id: playlistId,
      name: "Inconsistent Playlist",
      description: "A".repeat(50),
      isPublished: true,
      publishedAt: new Date("2024-01-01T12:00:00.000Z"),
    };

    // Mock the final playlist that getPlaylistById returns
    const mockFinalPlaylist = {
      id: playlistId,
      name: "Inconsistent Playlist",
      description: "A".repeat(50),
      isPublished: true,
      publishedAt: "2024-01-01T12:00:00.000Z",
      songs: [],
    };

    mockFindUnique.mockResolvedValueOnce(mockInconsistentPlaylist);
    mockUpdate.mockResolvedValueOnce(mockUpdatedPlaylist);
    mockGetPlaylistById.mockResolvedValueOnce(mockFinalPlaylist);

    const response = await app.request(`/playlists/${playlistId}/publish`, {
      method: "POST",
    });

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("data");

    const publishedPlaylist = responseBody.data;
    expect(publishedPlaylist.isPublished).toBe(true);
    expect(publishedPlaylist.publishedAt).not.toBe(null);

    // Verify database calls
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: playlistId } });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: playlistId },
      data: { isPublished: true, publishedAt: expect.any(Date) },
    });
    expect(mockGetPlaylistById).toHaveBeenCalledWith(playlistId);
  });
});
