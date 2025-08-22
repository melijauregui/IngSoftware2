import {
  AllSongsResponseSchemaType,
  CreateSongResponseSchemaType,
  SongSchema,
  SongSchemaType,
  SongsResponseSchemaType,
} from "../../schemas/songs";
import { ResultSetHeader, FieldPacket } from "mysql2/promise";
import { db } from "../db";
import logger from "../logger";

export async function createSong(
  title: string,
  artist: string
): Promise<CreateSongResponseSchemaType> {
  let response: CreateSongResponseSchemaType;
  const [result]: [ResultSetHeader, FieldPacket[]] = await db.query(
    "INSERT INTO songs (title, artist) VALUES (?, ?)",
    [title, artist]
  );

  logger.info(`Song created: ${title} by ${artist}`);

  response = {
    data: {
      id: result.insertId,
      title: title.trim(),
      artist: artist.trim(),
    },
  };

  return response;
}

export async function getAllSongs(): Promise<SongsResponseSchemaType> {
  const [result]: [ResultSetHeader[], FieldPacket[]] = await db.query(
    "SELECT * FROM songs"
  );
  // Convert the result to the correct type
  const songs = result
    .map((row) => {
      const { success, data, error } = SongSchema.safeParse(row);
      if (!success) {
        logger.error(`Invalid song data: ${JSON.stringify(error)}`);
        return null;
      }
      return data;
    })
    .filter((song) => song !== null);
  logger.info(`Songs found: ${JSON.stringify(songs)}`);
  return songs;
}
