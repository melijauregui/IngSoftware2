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

describe("DELETE /songs/:id", () => {
  // Mock Prisma functions for testing
  const mockDelete = vi.fn();

  beforeAll(async () => {
    // Mock the Prisma song.delete function
    vi.spyOn(db.song, "delete").mockImplementation(mockDelete);
  });

  beforeEach(() => {
    // Clear mock between tests
    mockDelete.mockClear();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe("Case 1: Database error - Internal server error (500)", () => {
    it("should return 500 when there is a database connection error", async () => {
      const songId = 1;
      const dbError = new Error("Connection lost to database");
      mockDelete.mockRejectedValueOnce(dbError);

      const response = await app.request(`/songs/${songId}`, {
        method: "DELETE",
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
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: songId },
      });
    });
  });
});
