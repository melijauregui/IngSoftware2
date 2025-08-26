import { z } from "zod";
import { SongRequestSchema } from "./songs";

export const SongIdSchema = z
  .object({
    id: z.coerce
      .number({
        invalid_type_error: "Invalid song ID, must be a number",
      })
      .int({
        message: "Invalid song ID, must be an integer",
      })
      .min(0, {
        message: "Invalid song ID, must be greater than 0",
      }),
  })
  .strict();

export type SongIdSchemaType = z.infer<typeof SongIdSchema>;

// UpdateSongRequest:
// type: object
// properties:
//   title:
//     type: string
//   artist:
//     type: string
export const UpdateSongRequestSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(50, "Title is too long"),
    artist: z
      .string()
      .trim()
      .min(1, "Artist is required")
      .max(50, "Artist is too long"),
  })
  .strict();

export type UpdateSongRequestSchemaType = z.infer<
  typeof UpdateSongRequestSchema
>;
