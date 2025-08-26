import {
  AllSongsResponseSchemaType,
  CreateSongResponseSchemaType,
  SongSchema,
  SongSchemaType,
  SongsResponseSchemaType,
} from "../../schemas/songs";
import { db } from "../db.config";
import logger from "../logger";

export async function createSong(
  title: string,
  artist: string
): Promise<CreateSongResponseSchemaType> {
  let response: CreateSongResponseSchemaType;

  const song = await db.song.create({
    data: {
      title: title.trim(),
      artist: artist.trim(),
    },
  });

  logger.info(`Song created: ${title} by ${artist}`);

  response = {
    data: {
      id: song.id,
      title: song.title,
      artist: song.artist,
    },
  };

  return response;
}

export async function getAllSongs(): Promise<SongsResponseSchemaType> {
  const songs = await db.song.findMany();

  // Convert the result to the correct type
  const validatedSongs = songs
    .map((row: any) => {
      const { success, data, error } = SongSchema.safeParse(row);
      if (!success) {
        logger.error(
          `Invalid song data for song ${JSON.stringify(row)}: ${JSON.stringify(
            error
          )}`
        );
        return null;
      }
      return data;
    })
    .filter((song: any) => song !== null);

  logger.info(`Songs found: ${JSON.stringify(validatedSongs)}`);
  return validatedSongs;
}
