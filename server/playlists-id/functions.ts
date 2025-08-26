import { db } from "../db.config";
import { PlaylistSchemaType } from "../../schemas/playlists";
import {
  getPlaylistDataById,
  getPlaylistSongsById,
} from "../playlists/functions";

export async function getPlaylistById(id: string): Promise<PlaylistSchemaType> {
  let response: PlaylistSchemaType;
  const dataPlaylist = await getPlaylistDataById(id, `/playlists/${id}`);
  const songsResult = await getPlaylistSongsById(id);
  response = { ...dataPlaylist, ...songsResult };
  return response;
}

export async function deletePlaylist(id: string): Promise<void> {
  await db.playlist.delete({
    where: { id },
  });
}
