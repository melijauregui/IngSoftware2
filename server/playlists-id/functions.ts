import { ResultSetHeader, FieldPacket } from "mysql2/promise";
import { PlaylistSchemaType } from "../../schemas/playlists";
import {
  getPlaylistDataById,
  getPlaylistSongsById,
} from "../playlists/functions";
import { db } from "../db";
import { createNotFoundError } from "../../schemas/error";

export async function getPlaylistById(id: number): Promise<PlaylistSchemaType> {
  let response: PlaylistSchemaType;
  const dataPlaylist = await getPlaylistDataById(id, `/playlists/${id}`);
  const songsResult = await getPlaylistSongsById(id);
  response = { ...dataPlaylist, ...songsResult };
  return response;
}

export async function deletePlaylist(id: number): Promise<void> {
  const [result]: [ResultSetHeader[], FieldPacket[]] = await db.query(
    "DELETE FROM playlists WHERE id = ?",
    [id]
  );
  if (result[0].affectedRows === 0) {
    throw createNotFoundError("Playlist", id, `/playlists/${id}`);
  }
  return;
}
