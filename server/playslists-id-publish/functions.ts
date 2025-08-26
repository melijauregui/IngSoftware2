import { PlaylistSchemaType } from "../../schemas/playlists";
import { getPlaylistById, getPlaylistDataById } from "../playlists/functions";
import { db } from "../db.config";
import { getSongById } from "../songs-id/functions";
import logger from "../logger";
import { createNotFoundError } from "../../schemas/error";

export async function publishPlaylist(id: string): Promise<PlaylistSchemaType> {
  const existing = await db.playlist.findUnique({ where: { id } });
  if (!existing) {
    throw createNotFoundError("Playlist", id, `/playlists/${id}/publish`);
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
