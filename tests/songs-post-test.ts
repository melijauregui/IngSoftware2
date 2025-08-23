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

describe("POST /songs", () => {
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

  describe("Case 1: Success - Create song successfully (201)", () => {
    it("should create a song successfully and return 201", async () => {
      const songData = {
        title: "Bohemian Rhapsody",
        artist: "Queen",
      };

      const mockResult = {
        insertId: 1,
        affectedRows: 1,
        changedRows: 0,
      };

      mockQuery.mockResolvedValueOnce([mockResult, []]);

      const response = await app.request("/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 1,
          title: "Bohemian Rhapsody",
          artist: "Queen",
        },
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "INSERT INTO songs (title, artist) VALUES (?, ?)",
        ["Bohemian Rhapsody", "Queen"]
      );
    });
  });

  describe("Case 2: Validation error - Invalid data (400)", () => {
    it("should return 400 when the title is empty", async () => {
      const songData = {
        title: "",
        artist: "Queen",
      };

      const response = await app.request("/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "title: Title is required",
        instance: "/songs",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when the artist is empty", async () => {
      const songData = {
        title: "Bohemian Rhapsody",
        artist: "",
      };

      const response = await app.request("/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "artist: Artist is required",
        instance: "/songs",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when both fields are empty", async () => {
      const songData = {
        title: "",
        artist: "",
      };

      const response = await app.request("/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "title: Title is required, artist: Artist is required",
        instance: "/songs",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 when the title only has spaces", async () => {
      const songData = {
        title: "   ",
        artist: "Queen",
      };

      const response = await app.request("/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "title: Title is required",
        instance: "/songs",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  describe("Case 3: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database error", async () => {
      const songData = {
        title: "Bohemian Rhapsody",
        artist: "Queen",
      };

      const dbError = new Error(
        "ER_CONNECTION_LOST: Connection lost to database"
      );
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Database Error",
        status: 500,
        detail: "ER_CONNECTION_LOST: Connection lost to database",
        instance: "/songs",
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "INSERT INTO songs (title, artist) VALUES (?, ?)",
        ["Bohemian Rhapsody", "Queen"]
      );
    });

    it("should return 500 with a generic message when the error is not an instance of Error", async () => {
      const songData = {
        title: "Bohemian Rhapsody",
        artist: "Queen",
      };

      const dbError = new Error("Internal Server Error");
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await app.request("/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: "Internal Server Error",
        instance: "/songs",
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "INSERT INTO songs (title, artist) VALUES (?, ?)",
        ["Bohemian Rhapsody", "Queen"]
      );
    });
  });

  describe("Additional validation cases", () => {
    it("should handle special characters correctly", async () => {
      const songData = {
        title: "¿Qué tal?",
        artist: "Artista & Co.",
      };

      const mockResult = {
        insertId: 3,
        affectedRows: 1,
        changedRows: 0,
      };

      mockQuery.mockResolvedValueOnce([mockResult, []]);

      const response = await app.request("/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        data: {
          id: 3,
          title: "¿Qué tal?",
          artist: "Artista & Co.",
        },
      });
    });
  });
});
