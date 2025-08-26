import { PlaylistSchemaType } from "../../schemas/playlists";
import { getPlaylistById, getPlaylistDataById } from "../playlists/functions";
import { db } from "../db.config";
import { getSongById } from "../songs-id/functions";

export async function addSongToPlaylist(
  playlistId: string,
  songId: number
): Promise<PlaylistSchemaType> {
  // First, verify that both playlist and song exist
  await getPlaylistDataById(playlistId, `/playlists/${playlistId}/songs`);
  await getSongById(songId, `/playlists/${playlistId}/songs`);

  // Now insert the song into the playlist
  const playlistSong = await db.playlistsSongs.create({
    data: {
      playlistId,
      songId,
    },
  });

  if (!playlistSong) {
    throw new Error("Failed to add song to playlist");
  }

  const response = await getPlaylistById(playlistId);
  return response;
}
