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

describe("PUT /songs/:id", () => {
  // Mock Prisma functions for testing
  const mockUpdate = vi.fn();
  const mockFindUnique = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma song.update function
    vi.spyOn(db.song, "update").mockImplementation(mockUpdate);
    // Mock the Prisma song.findUnique function (used by getSongById)
    vi.spyOn(db.song, "findUnique").mockImplementation(mockFindUnique);
  });

  beforeEach(() => {
    // Clear mocks between tests
    mockUpdate.mockClear();
    mockFindUnique.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe("Case 1: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database connection error", async () => {
      const songId = 1;
      const updateData = {
        title: "Updated Title",
        artist: "Updated Artist",
      };
      const dbError = new Error("Connection lost to database");
      mockUpdate.mockRejectedValueOnce(dbError);

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
        detail: "Connection lost to database",
        instance: `/songs/${songId}`,
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: songId },
        data: updateData,
      });
    });
  });
});
