import { PlaylistSchemaType } from '../../schemas/playlists';
import { getPlaylistById, getPlaylistDataById } from '../playlists/functions';
import { db } from '../db.config';
import { getSongById } from '../songs-id/functions';
import logger from '../logger';
import { createNotFoundError } from '../../schemas/error';

/**
 * Publishes a playlist by setting isPublished to true and publishedAt to current timestamp
 *
 * @param id - The UUID of the playlist to publish
 * @returns Promise<PlaylistSchemaType> - The updated playlist with publication data
 * @throws {NotFoundError} - If playlist with the given ID doesn't exist
 * @throws {Error} - If database operation fails
 *
 * @remarks
 * This function is idempotent:
 * - If playlist is already published with a valid publishedAt, no changes are made
 * - If playlist is published but publishedAt is null (inconsistent state), it will be updated
 * - If playlist is not published, it will be published with current timestamp
 * - Logs an error if a playlist is marked as published but has no publishedAt timestamp
 *
 * @example
 * ```typescript
 * const publishedPlaylist = await publishPlaylist("550e8400-e29b-41d4-a716-446655440001");
 * console.log(publishedPlaylist.isPublished); // true
 * console.log(publishedPlaylist.publishedAt); // Current timestamp
 *
 * // Calling again won't change the publishedAt timestamp
 * const samePlaylist = await publishPlaylist("550e8400-e29b-41d4-a716-446655440001");
 * console.log(samePlaylist.publishedAt); // Same timestamp as before
 * ```
 */
export async function publishPlaylist(id: string): Promise<PlaylistSchemaType> {
  const existing = await db.playlist.findUnique({ where: { id } });
  if (!existing) {
    throw createNotFoundError('Playlist', id, `/playlists/${id}/publish`);
  }
  if (existing.isPublished && existing.publishedAt === null) {
    logger.error(
      `Playlist ${id} was published but had no publishedAt timestamp`
    );
  }

  if (!existing.isPublished || existing.publishedAt === null) {
    await db.playlist.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });
  }

  return await getPlaylistById(id);
}
