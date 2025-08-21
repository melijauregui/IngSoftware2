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

export const CreateSongRequestSchema = z.object({
  title: z.string(),
  artist: z.string(),
});

export type CreateSongRequestSchemaType = z.infer<
  typeof CreateSongRequestSchema
>;

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
  id: z.number().int(),
  title: z.string(),
  artist: z.string(),
});

export type SongSchemaType = z.infer<typeof SongSchema>;

// CreateSongResponse:
// type: object
// properties:
//   data:
//     $ref: '#/components/schemas/Song'

export const CreateSongResponseSchema = z.object({
  data: SongSchema,
});

export type CreateSongResponseSchemaType = z.infer<
  typeof CreateSongResponseSchema
>;
