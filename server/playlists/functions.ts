import { ResultSetHeader, FieldPacket } from "mysql2/promise";
import { db } from "../db";
import logger from "../logger";
import { createNotFoundError } from "../../schemas/error";
import {
  PlaylistDataSchema,
  PlaylistDataSchemaType,
  PlaylistSchema,
  PlaylistSchemaType,
  PlaylistSongSchema,
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
    throw createNotFoundError("Playlist", id, `/playlists/${id}`);
  }
  return dataPlaylist;
}

export async function getPlaylistById(id: number): Promise<PlaylistSchemaType> {
  let response: PlaylistSchemaType;
  const dataPlaylist = await getPlaylistDataById(id);

  const [songs]: [any[], FieldPacket[]] = await db.query(
    "SELECT * FROM playlist_songs WHERE playlist_id = ?",
    [id]
  );
  if (songs.length === 0) {
    response = { ...dataPlaylist, songs: [] };
    return response;
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
  response = { ...dataPlaylist, songs: songsResult };
  return response;
}
