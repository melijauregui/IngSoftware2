import {
  AllSongsResponseSchemaType,
  CreateSongResponseSchemaType,
  SongSchema,
  SongSchemaType,
} from "../../schemas/songs";
import { ResultSetHeader, FieldPacket } from "mysql2/promise";
import { db } from "../db";
import logger from "../logger";
import { createNotFoundError } from "../../schemas/error";

export async function getSongById(id: number): Promise<SongSchemaType> {
  const [result]: [ResultSetHeader[], FieldPacket[]] = await db.query(
    "SELECT * FROM songs WHERE id = ?",
    [id]
  );
  // Convert the result to the correct type
  if (result.length === 0) {
    throw createNotFoundError("Song", id, `/songs/${id}`);
  }
  const song = result[0];
  const { success, data, error } = SongSchema.safeParse(song);
  if (!success) {
    logger.error(`Invalid song data: ${JSON.stringify(error)}`);
    throw createNotFoundError("Song", id, `/songs/${id}`);
  }
  logger.info(`Song found: ${JSON.stringify(data)}`);
  return data;
}
