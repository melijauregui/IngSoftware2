import { z } from "zod";
import { SongSchema } from "./songs";

// CreatePlaylistRequest:
// type: object
// required:
//   - name
//   - description
// properties:
//   name:
//     type: string
//   description:
//     type: string

export const CreatePlaylistRequestSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(50, "Name is too long"),
    description: z
      .string()
      .trim()
      .min(50, "Description of 50 characters is required")
      .max(255, "Description of 255 characters is too long"),
  })
  .strict();

export type CreatePlaylistRequestSchemaType = z.infer<
  typeof CreatePlaylistRequestSchema
>;

// PlaylistSong:
// type: object
// properties:
//   id:
//     type: integer
//   title:
//     type: string
//   artist:
//     type: string
//   addedAt:
//     type: string
//     format: date-time
//     description: Timestamp when the song was added to the playlist

export const PlaylistSongSchema = z
  .object({
    ...SongSchema.shape,
    addedAt: z
      .string()
      .datetime()
      .describe("Timestamp when the song was added to the playlist"),
  })
  .strict();

export const PlaylistDataSchema = z
  .object({
    id: z.string().uuid({ message: "Expected valid UUID v4" }),
    ...CreatePlaylistRequestSchema.shape,
    isPublished: z
      .boolean()
      .default(true)
      .describe(
        "Playlist visibility flag. In the base spec, playlists are created as published."
      ),
    publishedAt: z
      .string()
      .datetime()
      .describe(
        "Timestamp when the playlist became published. In the base spec, equals creation time."
      ),
  })
  .strict();

export type PlaylistDataSchemaType = z.infer<typeof PlaylistDataSchema>;

export const PlaylistSongsSchema = z
  .object({
    songs: z
      .array(PlaylistSongSchema)
      .describe("Songs ordered by addition date (most recent first)"),
  })
  .strict();

export type PlaylistSongsSchemaType = z.infer<typeof PlaylistSongsSchema>;

//Playlist:
//type: object
//properties:
//  id:
//    type: integer
//  name:
//    type: string
//  description:
//    type: string
//  isPublished:
//    type: boolean
//    description: Playlist visibility flag. In the base spec, playlists are created as published.
//  publishedAt:
//    type: string
//    format: date-time
//    description: Timestamp when the playlist became published. In the base spec, equals creation time.
//  songs:
//    type: array
//    items:
//      $ref: '#/components/schemas/PlaylistSong'
//    description: Songs ordered by addition date (most recent first)
export const PlaylistSchema = z.object({
  ...PlaylistDataSchema.shape,
  ...PlaylistSongsSchema.shape,
});

export type PlaylistSchemaType = z.infer<typeof PlaylistSchema>;

// schema:
//           type: object
//           properties:
//             data:
//               $ref: '#/components/schemas/Playlist'
export const PlaylistResponseSchema = z.object({
  data: PlaylistSchema,
});

export type PlaylistResponseSchemaType = z.infer<typeof PlaylistResponseSchema>;

// data:
//     type: array
//     items:
//       $ref: '#/components/schemas/Playlist'
export const PlaylistResponseArraySchema = z.object({
  data: z.array(PlaylistSchema),
});

export type PlaylistResponseArraySchemaType = z.infer<
  typeof PlaylistResponseArraySchema
>;
