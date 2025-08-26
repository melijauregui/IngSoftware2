import { expect, describe, it } from "vitest";
import { TEST_SONGS } from "../server/db.test";

// UUID v4 validation regex
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUIDv4(uuid: string): boolean {
  return UUID_V4_REGEX.test(uuid);
}

export function isUUID128Bits(uuid: string): boolean {
  // Remove hyphens and convert to binary
  const hexString = uuid.replace(/-/g, "");

  // Each hex character is 4 bits, so 32 hex characters = 128 bits
  if (hexString.length !== 32) {
    return false;
  }

  // Verify it's valid hexadecimal
  return /^[0-9a-f]{32}$/i.test(hexString);
}

export function comparePlaylistsData(
  playlistResponse: any,
  testPlaylist: any,
  fullComparison: boolean
) {
  expect(playlistResponse).toHaveProperty("id");
  expect(playlistResponse).toHaveProperty("name");
  expect(playlistResponse).toHaveProperty("description");
  expect(playlistResponse).toHaveProperty("publishedAt");
  expect(playlistResponse).toHaveProperty("songs");
  expect(Array.isArray(playlistResponse.songs)).toBe(true);

  // Validate that the ID is a valid UUID v4 and 128 bits
  expect(playlistResponse.id).toBeTypeOf("string");
  expect(isValidUUIDv4(playlistResponse.id)).toBe(true);
  expect(isUUID128Bits(playlistResponse.id)).toBe(true);

  if (fullComparison) {
    expect(playlistResponse.id).toBe(testPlaylist.id);
    expect(playlistResponse.publishedAt).toBe(
      testPlaylist.publishedAt.toISOString()
    );
    expect(playlistResponse.isPublished).toBe(testPlaylist.isPublished);
  }
  expect(playlistResponse.name).toBe(testPlaylist.name);
  expect(playlistResponse.description).toBe(testPlaylist.description);
}

export function compareSongs(
  playlistSongsResponse: any,
  expectedSongIds: number[]
) {
  expect(playlistSongsResponse.length).toBe(expectedSongIds.length);

  // Verify each song in the playlist matches the corresponding TEST_SONGS
  playlistSongsResponse.forEach((song: any, index: number) => {
    const expectedSongId = expectedSongIds[index];
    const expectedSong =
      TEST_SONGS[`SONG_${expectedSongId}` as keyof typeof TEST_SONGS];

    expect(song.id).toBe(expectedSong.id);
    expect(song.title).toBe(expectedSong.title);
    expect(song.artist).toBe(expectedSong.artist);
  });
}

export function compareSong(songResponse: any, testSong: any) {
  expect(songResponse).toHaveProperty("id");
  expect(songResponse).toHaveProperty("title");
  expect(songResponse).toHaveProperty("artist");

  expect(songResponse.title).toBe(testSong.title);
  expect(songResponse.artist).toBe(testSong.artist);
}
