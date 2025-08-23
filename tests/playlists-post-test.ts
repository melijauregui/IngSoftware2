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

describe("POST /playlists", () => {
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

  describe("Case 1: Success - Create playlist successfully (201)", () => {
    it("should create a playlist successfully and return 201", async () => {
      const playlistData = {
        name: "My Favorite Songs",
        description:
          "A collection of my all-time favorite songs that I love to listen to on repeat",
      };

      const mockInsertResult = {
        insertId: 1,
        affectedRows: 1,
        changedRows: 0,
      };

      const mockPlaylistData = [
        {
          id: 1,
          name: "My Favorite Songs",
          description:
            "A collection of my all-time favorite songs that I love to listen to on repeat",
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockInsertResult, []]) // First call for INSERT
        .mockResolvedValueOnce([mockPlaylistData, []]); // Second call for SELECT

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 1,
          name: "My Favorite Songs",
          description:
            "A collection of my all-time favorite songs that I love to listen to on repeat",
          isPublished: true,
          publishedAt: "2024-01-01T00:00:00.000Z",
          songs: [],
        },
      });
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        "INSERT INTO playlists (name, description) VALUES (?, ?)",
        [
          "My Favorite Songs",
          "A collection of my all-time favorite songs that I love to listen to on repeat",
        ]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        "SELECT * FROM playlists WHERE id = ?",
        [1]
      );
    });

    it("should handle minimum valid description length", async () => {
      const playlistData = {
        name: "Short Playlist",
        description: "A".repeat(50), // Exactly 50 characters
      };

      const mockInsertResult = {
        insertId: 2,
        affectedRows: 1,
        changedRows: 0,
      };

      const mockPlaylistData = [
        {
          id: 2,
          name: "Short Playlist",
          description: "A".repeat(50),
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockInsertResult, []])
        .mockResolvedValueOnce([mockPlaylistData, []]);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody.data.description).toHaveLength(50);
    });

    it("should handle maximum valid description length", async () => {
      const playlistData = {
        name: "Long Playlist",
        description: "A".repeat(255), // Exactly 255 characters
      };

      const mockInsertResult = {
        insertId: 3,
        affectedRows: 1,
        changedRows: 0,
      };

      const mockPlaylistData = [
        {
          id: 3,
          name: "Long Playlist",
          description: "A".repeat(255),
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockInsertResult, []])
        .mockResolvedValueOnce([mockPlaylistData, []]);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody.data.description).toHaveLength(255);
    });
  });

  describe("Case 2: Validation error - Invalid data (400)", () => {
    it("should return 400 when the name is empty", async () => {
      const playlistData = {
        name: "",
        description:
          "A collection of my all-time favorite songs that I love to listen to on repeat",
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "name: Name is required",
        instance: "/playlists",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when the description is too short", async () => {
      const playlistData = {
        name: "My Playlist",
        description: "Short", // Less than 50 characters
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "description: Description of 50 characters is required",
        instance: "/playlists",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when the description is too long", async () => {
      const playlistData = {
        name: "My Playlist",
        description: "A".repeat(256), // 256 characters, exceeds max of 255
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "description: Description of 255 characters is too long",
        instance: "/playlists",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when both fields are invalid", async () => {
      const playlistData = {
        name: "",
        description: "Short",
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail:
          "name: Name is required, description: Description of 50 characters is required",
        instance: "/playlists",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when the name only has spaces", async () => {
      const playlistData = {
        name: "   ",
        description:
          "A collection of my all-time favorite songs that I love to listen to on repeat",
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "name: Name is required",
        instance: "/playlists",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when the description only has spaces", async () => {
      const playlistData = {
        name: "My Playlist",
        description: "   ",
      };

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "description: Description of 50 characters is required",
        instance: "/playlists",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  describe("Case 3: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error during insert", async () => {
      const playlistData = {
        name: "My Favorite Songs",
        description:
          "A collection of my all-time favorite songs that I love to listen to on repeat",
      };

      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Database Error",
        status: 500,
        detail: "ER_CONNECTION_LOST: Connection lost to database",
        instance: "/playlists",
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "INSERT INTO playlists (name, description) VALUES (?, ?)",
        [
          "My Favorite Songs",
          "A collection of my all-time favorite songs that I love to listen to on repeat",
        ]
      );
    });

    it("should return 500 with a generic message when the error is not an instance of Error", async () => {
      const playlistData = {
        name: "My Favorite Songs",
        description:
          "A collection of my all-time favorite songs that I love to listen to on repeat",
      };

      const dbError = new Error("Unknown database error");
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Unknown database error",
        instance: "/playlists",
      });
    });
  });

  describe("Additional validation cases", () => {
    it("should handle special characters correctly", async () => {
      const playlistData = {
        name: "¿Qué tal?",
        description:
          "Una colección de canciones con caracteres especiales & símbolos únicos que me encantan escuchar",
      };

      const mockInsertResult = {
        insertId: 4,
        affectedRows: 1,
        changedRows: 0,
      };

      const mockPlaylistData = [
        {
          id: 4,
          name: "¿Qué tal?",
          description:
            "Una colección de canciones con caracteres especiales & símbolos únicos que me encantan escuchar",
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockInsertResult, []])
        .mockResolvedValueOnce([mockPlaylistData, []]);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 4,
          name: "¿Qué tal?",
          description:
            "Una colección de canciones con caracteres especiales & símbolos únicos que me encantan escuchar",
          isPublished: true,
          publishedAt: "2024-01-01T00:00:00.000Z",
          songs: [],
        },
      });
    });

    it("should handle numbers in name and description", async () => {
      const playlistData = {
        name: "Playlist 2024",
        description:
          "My top 50 songs from the year 2024 that I've listened to over 1000 times",
      };

      const mockInsertResult = {
        insertId: 5,
        affectedRows: 1,
        changedRows: 0,
      };

      const mockPlaylistData = [
        {
          id: 5,
          name: "Playlist 2024",
          description:
            "My top 50 songs from the year 2024 that I've listened to over 1000 times",
          is_published: 1,
          published_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];

      mockQuery
        .mockResolvedValueOnce([mockInsertResult, []])
        .mockResolvedValueOnce([mockPlaylistData, []]);

      const response = await app.request("/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody.data.name).toBe("Playlist 2024");
      expect(responseBody.data.description).toContain("2024");
      expect(responseBody.data.description).toContain("1000");
    });
  });
});
