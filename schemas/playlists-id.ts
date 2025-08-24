import { z } from "zod";

export const PlaylistIdSchema = z.object({
  id: z.coerce.number({ message: "Expected integer" }).int().min(0),
});

export type PlaylistIdSchemaType = z.infer<typeof PlaylistIdSchema>;
