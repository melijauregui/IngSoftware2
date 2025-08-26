import { db } from "../db.config";
import logger from "../logger";
import { createNotFoundError } from "../../schemas/error";
import {
  PlaylistDataSchema,
  PlaylistDataSchemaType,
  PlaylistSchemaType,
  PlaylistSongSchema,
  PlaylistSongSchemaType,
  PlaylistSongsSchemaType,
} from "../../schemas/playlists";

/**
 * Creates a new playlist in the database
 *
 * @param name - The name of the playlist (required, non-empty string)
 * @param description - The description of the playlist (required, 50-255 characters)
 * @returns Promise<PlaylistSchemaType> - The created playlist with default values (isPublished: false, publishedAt: null)
 * @throws {Error} - If database operation fails
 *
 * @example
 * ```typescript
 * const playlist = await createPlaylist("My Playlist", "A collection of my favorite songs");
 * console.log(playlist.isPublished); // false
 * console.log(playlist.publishedAt); // null
 * ```
 */
export async function createPlaylist(
  name: string,
  description: string
): Promise<PlaylistSchemaType> {
  let response: PlaylistSchemaType;

  const playlist = await db.playlist.create({
    data: {
      name,
      description,
    },
  });

  // const dataPlaylist = await getPlaylistDataById(playlist.id, `/playlists`);
  const playlistData = {
    ...playlist,
    publishedAt: playlist.publishedAt
      ? playlist.publishedAt.toISOString()
      : null,
  };
  const parsed = PlaylistDataSchema.parse(playlistData);

  logger.info(`Playlist created: ${JSON.stringify(parsed)}`);
  response = { ...parsed, songs: [] };
  return response;
}

/**
 * Retrieves playlist data by ID without songs
 *
 * @param id - The UUID of the playlist to retrieve
 * @param instance - The API endpoint instance for error reporting
 * @returns Promise<PlaylistDataSchemaType> - The playlist data (without songs)
 * @throws {NotFoundError} - If playlist with the given ID doesn't exist
 * @throws {Error} - If playlist data validation fails
 *
 * @example
 * ```typescript
 * const playlistData = await getPlaylistDataById("550e8400-e29b-41d4-a716-446655440001", "/playlists/550e8400-e29b-41d4-a716-446655440001");
 * console.log(playlistData.name); // "My Playlist"
 * console.log(playlistData.songs); // undefined (not included)
 * ```
 */
export async function getPlaylistDataById(
  id: string,
  instance: string
): Promise<PlaylistDataSchemaType> {
  let response: PlaylistDataSchemaType;

  const playlist = await db.playlist.findUnique({
    where: { id },
  });

  if (!playlist) {
    throw createNotFoundError("Playlist", id, instance);
  }

  const playlistData = {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    isPublished: playlist.isPublished,
    publishedAt: playlist.publishedAt
      ? playlist.publishedAt.toISOString()
      : null,
  };

  const {
    success,
    data: dataPlaylist,
    error,
  } = PlaylistDataSchema.safeParse(playlistData);
  if (!success) {
    logger.error(
      `Invalid playlist data for playlist id ${id}: ${JSON.stringify(error)}`
    );
    throw new Error("Failed to get playlist data");
  }
  return dataPlaylist;
}

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
 * Retrieves all songs for a specific playlist
 *
 * @param id - The UUID of the playlist
 * @returns Promise<PlaylistSongsSchemaType> - Object containing array of songs with their metadata
 * @throws {Error} - If database operation fails
 *
 * @example
 * ```typescript
 * const songsResult = await getPlaylistSongsById("550e8400-e29b-41d4-a716-446655440001");
 * console.log(songsResult.songs.length); // Number of songs
 * songsResult.songs.forEach(song => {
 *   console.log(`${song.title} by ${song.artist}`);
 * });
 * ```
 */
export async function getPlaylistSongsById(
  id: string
): Promise<PlaylistSongsSchemaType> {
  const playlistSongs = await db.playlistsSongs.findMany({
    where: { playlistId: id },
    include: {
      song: true,
    },
  });

  if (playlistSongs.length === 0) {
    logger.info(`No songs found for playlist id ${id}`);
    return { songs: [] };
  }

  const songsResult = playlistSongs
    .map((playlistSong: any) => {
      const songData = {
        id: playlistSong.song.id,
        title: playlistSong.song.title,
        artist: playlistSong.song.artist,
        addedAt: playlistSong.addedAt.toISOString(),
      };
      const { success, data, error } = PlaylistSongSchema.safeParse(songData);
      if (!success) {
        logger.error(
          `Invalid song data for song id ${songData.id}: ${JSON.stringify(
            error
          )}`
        );
        return null;
      }
      return data;
    })
    .filter((song: any) => song !== null) as PlaylistSongSchemaType[];

  logger.info(
    `Songs found for playlist id ${id}: ${JSON.stringify(songsResult)}`
  );
  return { songs: songsResult };
}

/**
 * Retrieves a list of playlists with optional filtering and sorting
 *
 * @param published - Filter by publication status (default: true - only published playlists)
 * @param sort - Sort order for publishedAt field (default: "desc" - most recent first)
 * @returns Promise<PlaylistSchemaType[]> - Array of playlists with their songs
 * @throws {Error} - If database operation fails
 *
 * @remarks
 * - When published=true: Only returns playlists with isPublished=true
 * - When published=false: Returns all playlists regardless of publication status
 * - Unpublished playlists (isPublished=false) always appear at the end of the list
 * - Sort order applies to publishedAt field, with null values (unpublished) always last
 *
 * @example
 * ```typescript
 * // Get only published playlists, most recent first
 * const publishedPlaylists = await getPlaylists(true, "desc");
 *
 * // Get all playlists, oldest first
 * const allPlaylists = await getPlaylists(false, "asc");
 *
 * // Get only published playlists, oldest first
 * const oldPublishedPlaylists = await getPlaylists(true, "asc");
 * ```
 */
export async function getPlaylists(
  published: boolean = true,
  sort: "asc" | "desc" = "desc"
): Promise<PlaylistSchemaType[]> {
  let response: PlaylistSchemaType[];

  const playlists = await db.playlist.findMany({
    where: published ? { isPublished: true } : {},
    orderBy: [
      { isPublished: "desc" }, // Siempre true primero, false después
      { publishedAt: sort }, // Luego ordena por fecha
    ],
  });

  const playlistsData = playlists
    .map((playlist: any) => {
      const playlistData = {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        isPublished: playlist.isPublished,
        publishedAt: playlist.publishedAt
          ? playlist.publishedAt.toISOString()
          : null,
      };
      const { success, data, error } =
        PlaylistDataSchema.safeParse(playlistData);
      if (!success) {
        logger.error(
          `Invalid playlist data for playlist id ${
            playlist.id
          }: ${JSON.stringify(error)}`
        );
        return null;
      }
      return data;
    })
    .filter((playlist: any) => playlist !== null);

  const playlistsWithSongs = playlistsData.map(async (playlist: any) => {
    const songsResult = await getPlaylistSongsById(playlist.id);
    return { ...playlist, ...songsResult };
  });

  return await Promise.all(playlistsWithSongs);
}
