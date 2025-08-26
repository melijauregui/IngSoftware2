import { expect, describe, it } from "vitest";
import { TEST_SONGS } from "../server/db.test";

// UUID v4 validation regex
// ref: https://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUIDv4(uuid: string): boolean {
  return UUID_V4_REGEX.test(uuid);
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

  if (fullComparison) {
    expect(playlistResponse.id).toBe(testPlaylist.id);
    if (testPlaylist.isPublished) {
      expect(playlistResponse.isPublished).toBe(true);
      expect(playlistResponse.publishedAt).toBe(
        testPlaylist.publishedAt.toISOString()
      );
    } else {
      expect(playlistResponse.isPublished).toBe(false);
      expect(playlistResponse.publishedAt).toBeNull();
    }
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
