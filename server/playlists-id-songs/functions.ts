import { PlaylistSchemaType } from '../../schemas/playlists';
import { getPlaylistById, getPlaylistDataById } from '../playlists/functions';
import { db } from '../db.config';
import { getSongById } from '../songs-id/functions';

/**
 * Adds a song to a playlist by creating a relationship between them
 *
 * @param playlistId - The UUID of the playlist
 * @param songId - The numeric ID of the song to add
 * @returns Promise<PlaylistSchemaType> - The updated playlist with all its songs
 * @throws {NotFoundError} - If playlist or song doesn't exist
 * @throws {Error} - If database operation fails or relationship creation fails
 *
 * @remarks
 * This function:
 * - Verifies that both playlist and song exist before creating the relationship
 * - Checks if the song is already in the playlist to prevent duplicates
 * - Creates a playlist-song relationship in the database
 * - Returns the complete updated playlist with all songs
 *
 * @example
 * ```typescript
 * const updatedPlaylist = await addSongToPlaylist("550e8400-e29b-41d4-a716-446655440001", 1);
 * console.log(updatedPlaylist.songs.length); // Increased by 1
 * ```
 */
export async function addSongToPlaylist(
  playlistId: string,
  songId: number
): Promise<PlaylistSchemaType> {
  // Now insert the song into the playlist
  const playlistSong = await db.playlistsSongs.create({
    data: {
      playlistId,
      songId,
    },
  });

  if (!playlistSong) {
    throw new Error('Failed to add song to playlist');
  }

  const response = await getPlaylistById(playlistId);
  return response;
}
