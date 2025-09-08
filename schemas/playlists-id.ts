import { z } from 'zod';

export const PlaylistIdSchema = z
  .object({
    id: z.string().uuid({ message: 'Expected valid UUID v4' }),
  })
  .strict();

export const IdSchema = z
  .object({
    id: z.string(),
  })
  .strict();

export type PlaylistIdSchemaType = z.infer<typeof PlaylistIdSchema>;
