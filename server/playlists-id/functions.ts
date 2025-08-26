import { db } from "../db.config";
import { PlaylistSchemaType } from "../../schemas/playlists";
import {
  getPlaylistDataById,
  getPlaylistSongsById,
} from "../playlists/functions";

/**
 * Retrieves a complete playlist by ID including its songs
 *
 * @param id - The UUID of the playlist to retrieve
 * @returns Promise<PlaylistSchemaType> - The complete playlist with songs
 * @throws {NotFoundError} - If playlist with the given ID doesn't exist
 * @throws {Error} - If playlist data validation fails
 *
 * @example
 * ```typescript
 * const playlist = await getPlaylistById("550e8400-e29b-41d4-a716-446655440001");
 * console.log(playlist.name); // "My Playlist"
 * console.log(playlist.songs.length); // Number of songs in the playlist
 * ```
 */
export async function getPlaylistById(id: string): Promise<PlaylistSchemaType> {
  let response: PlaylistSchemaType;
  const dataPlaylist = await getPlaylistDataById(id, `/playlists/${id}`);
  const songsResult = await getPlaylistSongsById(id);
  response = { ...dataPlaylist, ...songsResult };
  return response;
}

/**
 * Deletes a playlist and all its associated song relationships
 *
 * @param id - The UUID of the playlist to delete
 * @returns Promise<void> - Resolves when deletion is complete
 * @throws {NotFoundError} - If playlist with the given ID doesn't exist
 * @throws {Error} - If database operation fails
 *
 * @remarks
 * This operation will:
 * - Delete the playlist record
 * - Automatically delete all playlist-song relationships (cascade)
 * - Songs themselves are not deleted, only the relationships
 *
 * @example
 * ```typescript
 * await deletePlaylist("550e8400-e29b-41d4-a716-446655440001");
 * // Playlist and its song relationships have been deleted
 * ```
 */
export async function deletePlaylist(id: string): Promise<void> {
  await db.playlist.delete({
    where: { id },
  });
}
