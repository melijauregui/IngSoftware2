import {
  AllSongsResponseSchemaType,
  CreateSongResponseSchemaType,
  SongSchema,
  SongSchemaType,
} from '../../schemas/songs';
import { db } from '../db.config';
import logger from '../logger';
import { createNotFoundError } from '../../schemas/error';

/**
 * Retrieves a song by its ID
 *
 * @param id - The numeric ID of the song to retrieve
 * @param instance - The API endpoint instance for error reporting
 * @returns Promise<SongSchemaType> - The song data
 * @throws {NotFoundError} - If song with the given ID doesn't exist
 * @throws {Error} - If song data validation fails
 *
 * @remarks
 * - Validates the song data against SongSchema before returning
 * - Logs the found song for debugging purposes
 * - If validation fails, throws NotFoundError (treats invalid data as not found)
 *
 * @example
 * ```typescript
 * const song = await getSongById(1, "/songs/1");
 * console.log(song.title); // "Bohemian Rhapsody"
 * console.log(song.artist); // "Queen"
 * ```
 */
export async function getSongById(
  id: number,
  instance: string
): Promise<SongSchemaType> {
  const song = await db.song.findUnique({
    where: { id },
  });

  if (!song) {
    throw createNotFoundError('Song', id, instance);
  }

  const { success, data, error } = SongSchema.safeParse(song);
  if (!success) {
    logger.error(
      `Invalid song data for song id ${id}: ${JSON.stringify(error)}`
    );
    throw createNotFoundError('Song', id, instance);
  }
  logger.info(`Song found: ${JSON.stringify(data)}`);
  return data;
}

/**
 * Updates a song's title and artist
 *
 * @param id - The numeric ID of the song to update
 * @param title - The new title for the song (required, non-empty string)
 * @param artist - The new artist for the song (required, non-empty string)
 * @returns Promise<SongSchemaType> - The updated song data
 * @throws {NotFoundError} - If song with the given ID doesn't exist
 * @throws {Error} - If database operation fails
 *
 * @remarks
 * - Both title and artist are required fields
 * - Updates the song in the database
 * - Returns the updated song data by calling getSongById for validation
 * - If the song doesn't exist, throws NotFoundError
 *
 * @example
 * ```typescript
 * const updatedSong = await updateSongById(1, "New Title", "New Artist");
 * console.log(updatedSong.title); // "New Title"
 * console.log(updatedSong.artist); // "New Artist"
 * ```
 */
export async function updateSongById(
  id: number,
  title: string,
  artist: string
): Promise<SongSchemaType> {
  const song = await db.song.update({
    where: { id },
    data: { title, artist },
  });

  if (!song) {
    throw createNotFoundError('Song', id, `/songs/${id}`);
  }

  return getSongById(id, `/songs/${id}`);
}

/**
 * Deletes a song from the database
 *
 * @param id - The numeric ID of the song to delete
 * @returns Promise<void> - Resolves when deletion is complete
 * @throws {NotFoundError} - If song with the given ID doesn't exist
 * @throws {Error} - If database operation fails
 *
 * @remarks
 * This operation will:
 * - Delete the song record from the database
 * - Automatically delete all playlist-song relationships (cascade)
 * - If the song doesn't exist, throws NotFoundError
 *
 * @example
 * ```typescript
 * await deleteSongById(1);
 * // Song and all its playlist relationships have been deleted
 * ```
 */
export async function deleteSongById(id: number): Promise<void> {
  await db.song.delete({
    where: { id },
  });
}
