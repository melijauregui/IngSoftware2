import { CreateSongResponseSchemaType } from "../../schemas/songs";
import { ErrorResponseSchemaType } from "../../schemas/error";
import { ResultSetHeader, FieldPacket } from "mysql2/promise";
import { db } from "../db";
import { ContentfulStatusCode } from "hono/utils/http-status";

export async function createSong(
  title: string,
  artist: string
): Promise<{
  response: CreateSongResponseSchemaType | ErrorResponseSchemaType;
  status: ContentfulStatusCode;
}> {
  let response: CreateSongResponseSchemaType | ErrorResponseSchemaType;
  let status: ContentfulStatusCode;
  try {
    const [result]: [ResultSetHeader, FieldPacket[]] = await db.query(
      "INSERT INTO songs (title, artist) VALUES (?, ?)",
      [title, artist]
    );

    response = {
      data: {
        id: result.insertId,
        title,
        artist,
      },
    };
    status = 201;
  } catch (error) {
    console.error("Database error:", error);

    response = {
      type: "https://example.com/errors/database-error",
      title: "Database Error",
      status: 500 as ContentfulStatusCode,
      detail: error instanceof Error ? error.message : "Unknown database error",
      instance: "/songs",
    };
    status = 500;
  }

  return { response, status };
}
