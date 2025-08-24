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

describe("POST /playlists/{id}/songs", () => {
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

  describe("Case 1: Success - Add song to playlist successfully (200)", () => {
    it("should add a song to a playlist successfully and return 200", async () => {
      const playlistId = 1;
      const songId = 5;
      const requestBody = { songId };

      // Mock the INSERT query result
      const mockInsertResult = [
        {
          affectedRows: 1,
          insertId: 1,
          changedRows: 0,
        },
      ];

      // Mock the playlist data returned by getPlaylistById
      const mockPlaylistData = [
        {
          id: playlistId,
          name: "My Favorite Songs",
          description: "A".repeat(50),
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      // Mock the songs data
      const mockSongsData = [
        {
          id: songId,
          title: "Bohemian Rhapsody",
          artist: "Queen",
          added_at: new Date("2024-01-15T10:30:00.000Z"),
        },
      ];

      // Mock song data for getSongById validation
      const mockSongData = [
        {
          id: songId,
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockPlaylistData, []]) // First call for getPlaylistDataById validation
        .mockResolvedValueOnce([mockSongData, []]) // Second call for getSongById validation
        .mockResolvedValueOnce([mockInsertResult, []]) // Third call for INSERT into playlists_songs
        .mockResolvedValueOnce([mockPlaylistData, []]) // Fourth call for SELECT playlist data (getPlaylistDataById)
        .mockResolvedValueOnce([mockSongsData, []]); // Fifth call for SELECT songs data (getPlaylistSongsById)

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: playlistId,
          name: "My Favorite Songs",
          description: "A".repeat(50),
          isPublished: true,
          publishedAt: "2024-01-01T00:00:00.000Z",
          songs: [
            {
              id: songId,
              title: "Bohemian Rhapsody",
              artist: "Queen",
              addedAt: "2024-01-15T10:30:00.000Z",
            },
          ],
        },
      });

      // Verify the database calls
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        "SELECT * FROM playlists WHERE id = ?",
        [playlistId]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        3,
        "INSERT INTO playlists_songs (playlist_id, song_id) VALUES (?, ?)",
        [playlistId, songId]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        4,
        "SELECT * FROM playlists WHERE id = ?",
        [playlistId]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        5,
        "SELECT * FROM playlist_songs WHERE playlist_id = ?",
        [playlistId]
      );
    });
  });

  describe("Case 2: Validation error - Invalid request body (400)", () => {
    it("should return 400 when songId is missing", async () => {
      const playlistId = 1;
      const requestBody = {};

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Required",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when songId is not a number", async () => {
      const playlistId = 1;
      const requestBody = { songId: "invalid" };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Expected number, received string",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when songId is a negative number", async () => {
      const playlistId = 1;
      const requestBody = { songId: -5 };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Number must be greater than or equal to 0",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when songId is a decimal number", async () => {
      const playlistId = 1;
      const requestBody = { songId: 5.5 };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Expected integer, received float",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when songId is null", async () => {
      const playlistId = 1;
      const requestBody = { songId: null };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Expected number, received null",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when request body is empty object", async () => {
      const playlistId = 1;

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{}",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "songId: Required",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when request body is empty", async () => {
      const playlistId = 1;

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "Malformed JSON in request body",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when request body is malformed JSON", async () => {
      const playlistId = 1;

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{ invalid json }",
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "Malformed JSON in request body",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  describe("Case 3: Validation error - Invalid playlist ID (400)", () => {
    it("should return 400 when playlist ID is not a number", async () => {
      const playlistId = "invalid";
      const requestBody = { songId: 5 };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Expected integer",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when playlist ID is a negative number", async () => {
      const playlistId = -1;
      const requestBody = { songId: 5 };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Number must be greater than or equal to 0",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when playlist ID is a decimal number", async () => {
      const playlistId = 1.5;
      const requestBody = { songId: 5 };

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "id: Expected integer",
        instance: `/playlists/${playlistId}/songs`,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  describe("Case 4: Not found error - Playlist or song not found (404)", () => {
    it("should return 404 when playlist does not exist", async () => {
      const playlistId = 999;
      const songId = 5;
      const requestBody = { songId };

      // Mock empty result for playlist validation
      mockQuery.mockResolvedValueOnce([[], []]);

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "Playlist not found with id: 999",
        instance: `/playlists/${playlistId}/songs`,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM playlists WHERE id = ?",
        [playlistId]
      );
    });

    it("should return 404 when song does not exist", async () => {
      const playlistId = 1;
      const songId = 999;
      const requestBody = { songId };

      const mockPlaylistData = [
        {
          id: playlistId,
          name: "My Playlist",
          description: "A".repeat(50),
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      // Mock playlist exists but song doesn't
      mockQuery
        .mockResolvedValueOnce([mockPlaylistData, []]) // Playlist validation succeeds
        .mockResolvedValueOnce([[], []]); // Song validation fails

      const response = await app.request(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "Song not found with id: 999",
        instance: `/playlists/${playlistId}/songs`,
      });

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        "SELECT * FROM playlists WHERE id = ?",
        [playlistId]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
    });
  });

  describe("Case 5: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error", async () => {
      const playlistId = 1;
      const songId = 5;
      const requestBody = { songId };

      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

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
        title: "Database Error",
        status: 500,
        detail: "ER_CONNECTION_LOST: Connection lost to database",
        instance: `/playlists/${playlistId}/songs`,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM playlists WHERE id = ?",
        [playlistId]
      );
    });

    it("should return 500 with a generic message when the error is not an instance of Error", async () => {
      const playlistId = 1;
      const songId = 5;
      const requestBody = { songId };

      const dbError = new Error("Unknown database error");
      mockQuery.mockRejectedValueOnce(dbError);

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
