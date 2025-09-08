import { z } from 'zod';

// AddSongToPlaylistRequest:
// type: object
// required:
//   - songId
// properties:
//   songId:
//     type: integer
export const AddSongToPlaylistRequestSchema = z
  .object({
    songId: z.number(),
  })
  .strict();

export const AddSongToPlaylistRequestCompleteSchema = z
  .object({
    songId: z.number().int().min(1),
  })
  .strict();

export type AddSongToPlaylistRequestSchemaType = z.infer<
  typeof AddSongToPlaylistRequestSchema
>;
