import {
  AllSongsResponseSchemaType,
  CreateSongResponseSchemaType,
  SongSchema,
  SongSchemaType,
} from "../../schemas/songs";
import { db } from "../db.config";
import logger from "../logger";
import { createNotFoundError } from "../../schemas/error";

export async function getSongById(
  id: number,
  instance: string
): Promise<SongSchemaType> {
  const song = await db.song.findUnique({
    where: { id },
  });

  if (!song) {
    throw createNotFoundError("Song", id, instance);
  }

  const { success, data, error } = SongSchema.safeParse(song);
  if (!success) {
    logger.error(
      `Invalid song data for song id ${id}: ${JSON.stringify(error)}`
    );
    throw createNotFoundError("Song", id, instance);
  }
  logger.info(`Song found: ${JSON.stringify(data)}`);
  return data;
}

export async function updateSongById(
  id: number,
  title?: string,
  artist?: string
): Promise<SongSchemaType> {
  // Build dynamic update data based on provided fields
  const updateData: any = {};

  if (title !== undefined) {
    updateData.title = title;
  }

  if (artist !== undefined) {
    updateData.artist = artist;
  }

  // This should never happen due to schema validation, but keeping as safety check
  if (Object.keys(updateData).length === 0) {
    throw new Error(
      "At least one field (title or artist) must be provided for update"
    );
  }

  const song = await db.song.update({
    where: { id },
    data: updateData,
  });

  if (!song) {
    throw createNotFoundError("Song", id, `/songs/${id}`);
  }

  return getSongById(id, `/songs/${id}`);
}

export async function deleteSongById(id: number): Promise<void> {
  await db.song.delete({
    where: { id },
  });
}
