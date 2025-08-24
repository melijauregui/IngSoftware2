import { ResultSetHeader, FieldPacket } from "mysql2/promise";
import { db } from "../db";
import logger from "../logger";
import { createNotFoundError } from "../../schemas/error";
import {
  PlaylistDataSchema,
  PlaylistDataSchemaType,
  PlaylistSchemaType,
  PlaylistSongSchema,
  PlaylistSongsSchemaType,
} from "../../schemas/playlists";

export async function createPlaylist(
  name: string,
  description: string
): Promise<PlaylistSchemaType> {
  let response: PlaylistSchemaType;
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO playlists (name, description) VALUES (?, ?)",
    [name, description]
  );

  const dataPlaylist = await getPlaylistDataById(result.insertId);
  logger.info(`Playlist created: ${JSON.stringify(dataPlaylist)}`);
  response = { ...dataPlaylist, songs: [] };
  return response;
}

export async function getPlaylistDataById(
  id: number
): Promise<PlaylistDataSchemaType> {
  let response: PlaylistDataSchemaType;
  const [result]: [any[], FieldPacket[]] = await db.query(
    "SELECT * FROM playlists WHERE id = ?",
    [id]
  );
  if (result.length === 0) {
    throw createNotFoundError("Playlist", id, `/playlists/${id}`);
  }

  const playlist = result[0];

  const playlistData = {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    isPublished: Boolean(playlist.is_published),
    publishedAt: playlist.published_at.toISOString(),
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

export async function getPlaylistById(id: number): Promise<PlaylistSchemaType> {
  let response: PlaylistSchemaType;
  const dataPlaylist = await getPlaylistDataById(id);
  const songsResult = await getPlaylistSongsById(id);
  response = { ...dataPlaylist, ...songsResult };
  return response;
}

export async function getPlaylistSongsById(
  id: number
): Promise<PlaylistSongsSchemaType> {
  const [songs]: [any[], FieldPacket[]] = await db.query(
    "SELECT * FROM playlist_songs WHERE playlist_id = ?",
    [id]
  );
  if (songs.length === 0) {
    return { songs: [] };
  }

  const songsResult = songs
    .map((song) => {
      const songData = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        addedAt: song.added_at.toISOString(),
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
    .filter((song) => song !== null);
  logger.info(
    `Songs found for playlist id ${id}: ${JSON.stringify(songsResult)}`
  );
  return { songs: songsResult };
}

export async function getPlaylists(): Promise<PlaylistSchemaType[]> {
  let response: PlaylistSchemaType[];
  const [playlists]: [any[], FieldPacket[]] = await db.query(
    "SELECT * FROM playlists ORDER BY published_at DESC"
  );
  const playlistsData = playlists
    .map((playlist) => {
      const playlistData = {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        isPublished: Boolean(playlist.is_published),
        publishedAt: playlist.published_at.toISOString(),
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
    .filter((playlist) => playlist !== null);

  const playlistsWithSongs = playlistsData.map(async (playlist) => {
    const songsResult = await getPlaylistSongsById(playlist.id);
    return { ...playlist, ...songsResult };
  });

  return await Promise.all(playlistsWithSongs);
}
