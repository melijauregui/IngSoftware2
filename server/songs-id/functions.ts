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
  title: string,
  artist: string
): Promise<SongSchemaType> {
  const song = await db.song.update({
    where: { id },
    data: { title, artist },
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
