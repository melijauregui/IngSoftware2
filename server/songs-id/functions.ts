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
    logger.error(
      `Invalid song data for song id ${id}: ${JSON.stringify(error)}`
    );
    throw createNotFoundError("Song", id, `/songs/${id}`);
  }
  logger.info(`Song found: ${JSON.stringify(data)}`);
  return data;
}

export async function updateSongById(
  id: number,
  title?: string,
  artist?: string
): Promise<SongSchemaType> {
  // Build dynamic UPDATE query based on provided fields
  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (title !== undefined) {
    updateFields.push("title = ?");
    updateValues.push(title);
  }

  if (artist !== undefined) {
    updateFields.push("artist = ?");
    updateValues.push(artist);
  }

  // This should never happen due to schema validation, but keeping as safety check
  if (updateFields.length === 0) {
    throw new Error(
      "At least one field (title or artist) must be provided for update"
    );
  }

  updateValues.push(id);
  const query = `UPDATE songs SET ${updateFields.join(", ")} WHERE id = ?`;

  const [result]: [ResultSetHeader, FieldPacket[]] = await db.query(
    query,
    updateValues
  );
  if (result.affectedRows === 0) {
    throw createNotFoundError("Song", id, `/songs/${id}`);
  }
  return getSongById(id);
}

export async function deleteSongById(id: number): Promise<void> {
  const [result]: [ResultSetHeader, FieldPacket[]] = await db.query(
    "DELETE FROM songs WHERE id = ?",
    [id]
  );
  if (result.affectedRows === 0) {
    throw createNotFoundError("Song", id, `/songs/${id}`);
  }
}
