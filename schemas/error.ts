import { z } from "zod";
// ErrorResponse:
//       type: object
//       properties:
//         type:
//           type: string
//         title:
//           type: string
//         status:
//           type: integer
//         detail:
//           type: string
//         instance:
//           type: string

/**
 * Zod schema for error response validation
 *
 * Defines the structure for error responses following RFC 7807 (Problem Details for HTTP APIs).
 * All error responses in the API must conform to this schema.
 *
 * @remarks
 * Properties:
 * - type: URI reference that identifies the problem type
 * - title: Short, human-readable summary of the problem
 * - status: HTTP status code for this occurrence of the problem
 * - detail: Human-readable explanation specific to this occurrence
 * - instance: URI reference that identifies the specific occurrence of the problem
 *
 * @example
 * ```typescript
 * const errorResponse = {
 *   type: "about:blank",
 *   title: "Playlist Not Found",
 *   status: 404,
 *   detail: "The playlist with ID 123 was not found",
 *   instance: "/playlists/123"
 * };
 *
 * const validated = ErrorResponseSchema.parse(errorResponse);
 * ```
 */
export const ErrorResponseSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  instance: z.string(),
});

export type ErrorResponseSchemaType = z.infer<typeof ErrorResponseSchema>;

/**
 * Custom error class for 404 Not Found errors
 *
 * Extends the standard Error class to include additional properties
 * required for RFC 7807 compliant error responses.
 *
 * @remarks
 * Properties:
 * - status: HTTP status code (always 404)
 * - type: Problem type URI (always "about:blank")
 * - title: Human-readable problem summary
 * - detail: Detailed error message
 * - instance: URI reference to the specific occurrence
 *
 * @example
 * ```typescript
 * throw new NotFoundError(
 *   "The playlist with ID 123 was not found",
 *   "/playlists/123",
 *   "Playlist Not Found"
 * );
 * ```
 */
export class NotFoundError extends Error {
  public status: number;
  public type: string;
  public title: string;
  public detail: string;
  public instance: string;

  constructor(message: string, instance: string, title: string) {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
    this.type = "about:blank";
    this.title = title;
    this.detail = message;
    this.instance = instance;
  }
}

/**
 * Helper function to create standardized NotFoundError instances
 *
 * @param resource - The type of resource that was not found (e.g., "Playlist", "Song")
 * @param id - The ID that was searched for
 * @param path - The API endpoint path where the error occurred
 * @returns NotFoundError - A properly formatted 404 error
 *
 * @remarks
 * This function standardizes the creation of 404 errors across the application.
 * It automatically formats the error message and title based on the resource type.
 *
 * @example
 * ```typescript
 * // For playlists
 * throw createNotFoundError("Playlist", "550e8400-e29b-41d4-a716-446655440001", "/playlists/550e8400-e29b-41d4-a716-446655440001");
 *
 * // For songs
 * throw createNotFoundError("Song", 123, "/songs/123");
 * ```
 */
export function createNotFoundError(
  resource: string,
  id: string | number,
  path: string
): NotFoundError {
  const error = new NotFoundError(
    `The ${resource} with ID ${id} was not found`,
    path,
    `${resource} Not Found`
  );
  return error;
}
