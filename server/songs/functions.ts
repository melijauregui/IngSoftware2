import { CreateSongResponseSchemaType } from "../../schemas/songs";
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
