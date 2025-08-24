import { z } from "zod";

// AddSongToPlaylistRequest:
// type: object
// required:
//   - songId
// properties:
//   songId:
//     type: integer
export const AddSongToPlaylistRequestSchema = z.object({
  songId: z.number().int().min(0),
});

export type AddSongToPlaylistRequestSchemaType = z.infer<
  typeof AddSongToPlaylistRequestSchema
>;
