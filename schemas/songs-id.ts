import { z } from "zod";

export const SongIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type SongIdSchemaType = z.infer<typeof SongIdSchema>;
