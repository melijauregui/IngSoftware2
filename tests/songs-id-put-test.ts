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

describe("PUT /songs/:id", () => {
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

  describe("Case 1: Success - Update song by ID successfully (200)", () => {
    it("should update a song when it exists in the database", async () => {
      const songId = 1;
      const updateData = {
        title: "Updated Bohemian Rhapsody",
        artist: "Updated Queen",
      };
      const updatedSong = {
        id: 1,
        title: "Updated Bohemian Rhapsody",
        artist: "Updated Queen",
      };

      // Mock the UPDATE query
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      // Mock the SELECT query (from getSongById)
      mockQuery.mockResolvedValueOnce([[updatedSong], []]);

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 1,
          title: "Updated Bohemian Rhapsody",
          artist: "Updated Queen",
        },
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE songs SET title = ?, artist = ? WHERE id = ?",
        [updateData.title, updateData.artist, songId]
      );
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM songs WHERE id = ?",
        [songId]
      );
    });

    it("should update only title when only title is provided", async () => {
      const songId = 1;
      const updateData = {
        title: "Only Title Updated",
      };
      const updatedSong = {
        id: 1,
        title: "Only Title Updated",
        artist: "Queen", // Original artist unchanged
      };

      // Mock the UPDATE query
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      // Mock the SELECT query (from getSongById)
      mockQuery.mockResolvedValueOnce([[updatedSong], []]);

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 1,
          title: "Only Title Updated",
          artist: "Queen",
        },
      });
    });

    it("should update only artist when only artist is provided", async () => {
      const songId = 1;
      const updateData = {
        artist: "Only Artist Updated",
      };
      const updatedSong = {
        id: 1,
        title: "Bohemian Rhapsody", // Original title unchanged
        artist: "Only Artist Updated",
      };

      // Mock the UPDATE query
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      // Mock the SELECT query (from getSongById)
      mockQuery.mockResolvedValueOnce([[updatedSong], []]);

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 1,
          title: "Bohemian Rhapsody",
          artist: "Only Artist Updated",
        },
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE songs SET artist = ? WHERE id = ?",
        [updateData.artist, songId]
      );
    });

    it("should update only title when only title is provided", async () => {
      const songId = 1;
      const updateData = {
        title: "Only Title Updated",
      };
      const updatedSong = {
        id: 1,
        title: "Only Title Updated",
        artist: "Queen", // Original artist unchanged
      };

      // Mock the UPDATE query
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      // Mock the SELECT query (from getSongById)
      mockQuery.mockResolvedValueOnce([[updatedSong], []]);

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 1,
          title: "Only Title Updated",
          artist: "Queen",
        },
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE songs SET title = ? WHERE id = ?",
        [updateData.title, songId]
      );
    });
  });

  describe("Case 2: Not Found - Song doesn't exist (404)", () => {
    it("should return 404 when song with given ID doesn't exist", async () => {
      const songId = 999;
      const updateData = {
        title: "Updated Title",
        artist: "Updated Artist",
      };

      // Mock the UPDATE query - no rows affected
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }, []]);

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
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
      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE songs SET title = ?, artist = ? WHERE id = ?",
        [updateData.title, updateData.artist, songId]
      );
    });
  });

  describe("Case 3: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database connection error", async () => {
      const songId = 1;
      const updateData = {
        title: "Updated Title",
        artist: "Updated Artist",
      };
      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
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
      const updateData = {
        title: "Updated Title",
        artist: "Updated Artist",
      };
      const dbError = new Error("Internal Server Error");
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
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

  describe("Case 4: Validation errors - Invalid request body (400)", () => {
    it("should return 400 when both title and artist are missing", async () => {
      const songId = 1;
      const invalidData = {};

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody.detail).toContain(
        "At least one field (title or artist) must be provided"
      );
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when both title and artist are missing", async () => {
      const songId = 1;
      const invalidData = {};

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when title is empty string", async () => {
      const songId = 1;
      const invalidData = {
        title: "",
        artist: "Valid Artist",
      };

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("title", "Validation Error");
      expect(responseBody).toHaveProperty("status", 400);
      expect(responseBody).toHaveProperty("detail");
      expect(responseBody).toHaveProperty("instance");
    });

    it("should return 400 when artist is empty string", async () => {
      const songId = 1;
      const invalidData = {
        title: "Valid Title",
        artist: "",
      };

      const response = await app.request(`/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
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

  describe("Case 5: Parameter validation - Invalid ID parameter (400)", () => {
    it("should return 400 when ID is not a number", async () => {
      const invalidId = "abc";
      const updateData = {
        title: "Updated Title",
        artist: "Updated Artist",
      };

      const response = await app.request(`/songs/${invalidId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
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
      const updateData = {
        title: "Updated Title",
        artist: "Updated Artist",
      };

      const response = await app.request(`/songs/${invalidId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
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
});
