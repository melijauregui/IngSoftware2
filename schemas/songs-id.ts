import { z } from "zod";
import { SongRequestSchema } from "./songs";

export const SongIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

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
      .max(50, "Title is too long")
      .optional(),
    artist: z
      .string()
      .trim()
      .min(1, "Artist is required")
      .max(50, "Artist is too long")
      .optional(),
  })
  .refine((data) => data.title !== undefined || data.artist !== undefined, {
    message: "At least one field (title or artist) must be provided",
    path: [], // This will apply to the whole object
  });

export type UpdateSongRequestSchemaType = z.infer<
  typeof UpdateSongRequestSchema
>;
