import { ResultSetHeader, FieldPacket } from "mysql2/promise";
import { PlaylistSchemaType } from "../../schemas/playlists";
import { getPlaylistById, getPlaylistDataById } from "../playlists/functions";
import { db } from "../db.config";
import { getSongById } from "../songs-id/functions";

export async function addSongToPlaylist(
  playlistId: number,
  songId: number
): Promise<PlaylistSchemaType> {
  // First, verify that both playlist and song exist
  await getPlaylistDataById(playlistId, `/playlists/${playlistId}/songs`);
  await getSongById(songId, `/playlists/${playlistId}/songs`);

  // Now insert the song into the playlist
  const [result]: [ResultSetHeader[], FieldPacket[]] = await db.query(
    "INSERT INTO playlists_songs (playlist_id, song_id) VALUES (?, ?)",
    [playlistId, songId]
  );

  if (result[0].affectedRows === 0) {
    throw new Error("Failed to add song to playlist");
  }

  const response = await getPlaylistById(playlistId);
  return response;
}
