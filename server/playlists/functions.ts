import { db } from "../db.config";
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

  const playlist = await db.playlist.create({
    data: {
      name,
      description,
    },
  });

  const dataPlaylist = await getPlaylistDataById(playlist.id, `/playlists`);
  logger.info(`Playlist created: ${JSON.stringify(dataPlaylist)}`);
  response = { ...dataPlaylist, songs: [] };
  return response;
}

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
    publishedAt: playlist.publishedAt.toISOString(),
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

export async function getPlaylistById(id: string): Promise<PlaylistSchemaType> {
  let response: PlaylistSchemaType;
  const dataPlaylist = await getPlaylistDataById(id, `/playlists/${id}`);
  const songsResult = await getPlaylistSongsById(id);
  response = { ...dataPlaylist, ...songsResult };
  return response;
}

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
    .filter((song: any) => song !== null);

  logger.info(
    `Songs found for playlist id ${id}: ${JSON.stringify(songsResult)}`
  );
  return { songs: songsResult };
}

export async function getPlaylists(): Promise<PlaylistSchemaType[]> {
  let response: PlaylistSchemaType[];

  const playlists = await db.playlist.findMany({
    orderBy: {
      publishedAt: "desc",
    },
  });

  const playlistsData = playlists
    .map((playlist: any) => {
      const playlistData = {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        isPublished: playlist.isPublished,
        publishedAt: playlist.publishedAt.toISOString(),
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
