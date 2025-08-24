import { z } from "zod";

// CreateSongRequest:
//       type: object
//       required:
//         - title
//         - artist
//       properties:
//         title:
//           type: string
//         artist:
//           type: string

export const SongRequestSchema = z.object({
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
});

export type CreateSongRequestSchemaType = z.infer<typeof SongRequestSchema>;

// Song:
// type: object
// properties:
//   id:
//     type: integer
//   title:
//     type: string
//   artist:
//     type: string

export const SongSchema = z.object({
  id: z.number().int().min(0),
  ...SongRequestSchema.shape,
});

export type SongSchemaType = z.infer<typeof SongSchema>;

// CreateSongResponse:
// type: object
// properties:
//   data:
//     $ref: '#/components/schemas/Song'

export const SongResponseSchema = z.object({
  data: SongSchema,
});

export type CreateSongResponseSchemaType = z.infer<typeof SongResponseSchema>;

export const SongsResponseSchema = z.array(SongSchema);

export type SongsResponseSchemaType = z.infer<typeof SongsResponseSchema>;

// AllSongsResponse:
// data:
//    type: array
//    items:
//      $ref: '#/components/schemas/Song'
export const AllSongsResponseSchema = z.object({
  data: SongsResponseSchema,
});

export type AllSongsResponseSchemaType = z.infer<typeof AllSongsResponseSchema>;
