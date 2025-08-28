import { expect, describe, it } from 'vitest';
import { TEST_SONGS } from '../server/db.test';

// UUID v4 validation regex
// ref: https://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4 format
 *
 * @param uuid - The string to validate as UUID v4
 * @returns boolean - True if the string is a valid UUID v4, false otherwise
 *
 * @remarks
 * Uses a regex pattern to validate UUID v4 format:
 * - 8 hexadecimal characters
 * - 4 hexadecimal characters
 * - 4 hexadecimal characters (version 4)
 * - 4 hexadecimal characters (variant)
 * - 12 hexadecimal characters
 *
 * @example
 * ```typescript
 * isValidUUIDv4("550e8400-e29b-41d4-a716-446655440001"); // true
 * isValidUUIDv4("invalid-uuid"); // false
 * isValidUUIDv4("12345678-1234-1234-1234-123456789012"); // false (not v4)
 * ```
 */
export function isValidUUIDv4(uuid: string): boolean {
  return UUID_V4_REGEX.test(uuid);
}

/**
 * Compares playlist response data with expected test data
 *
 * @param playlistResponse - The playlist response object from the API
 * @param testPlaylist - The expected test playlist data
 * @param fullComparison - Whether to perform full comparison including ID and publication status
 *
 * @remarks
 * This function validates:
 * - Required properties exist (id, name, description, publishedAt, songs)
 * - ID is a valid UUID v4 format
 * - Songs array is properly structured
 * - If fullComparison is true: validates ID matches and publication status
 * - Name and description always match expected values
 *
 * @example
 * ```typescript
 * comparePlaylistsData(apiResponse, TEST_PLAYLISTS.PLAYLIST_1, true);
 * // Validates all properties including ID and publication status
 *
 * comparePlaylistsData(apiResponse, { name: "Test", description: "..." }, false);
 * // Validates basic properties but not ID or publication status
 * ```
 */
export function comparePlaylistsData(
  playlistResponse: any,
  testPlaylist: any,
  fullComparison: boolean
) {
  expect(playlistResponse).toHaveProperty('id');
  expect(playlistResponse).toHaveProperty('name');
  expect(playlistResponse).toHaveProperty('description');
  expect(playlistResponse).toHaveProperty('publishedAt');
  expect(playlistResponse).toHaveProperty('songs');
  expect(Array.isArray(playlistResponse.songs)).toBe(true);

  // Validate that the ID is a valid UUID v4 and 128 bits
  expect(playlistResponse.id).toBeTypeOf('string');
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

/**
 * Compares playlist songs response with expected song IDs
 *
 * @param playlistSongsResponse - The songs array from playlist response
 * @param expectedSongIds - Array of expected song IDs in order
 *
 * @remarks
 * This function validates:
 * - Number of songs matches expected count
 * - Each song matches the corresponding TEST_SONGS entry
 * - Song properties (id, title, artist) match expected values
 * - addedAt is a valid date
 *
 * @example
 * ```typescript
 * compareSongs(playlistResponse.songs, [1, 2, 3]);
 * // Validates that playlist has exactly 3 songs with IDs 1, 2, 3
 * // and each song matches TEST_SONGS.SONG_1, SONG_2, SONG_3
 * ```
 */
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
    expect(new Date(song.addedAt)).toBeInstanceOf(Date);
  });
}

/**
 * Compares a single song response with expected test song data
 *
 * @param songResponse - The song response object from the API
 * @param testSong - The expected test song data
 *
 * @remarks
 * This function validates:
 * - Required properties exist (id, title, artist)
 * - Title and artist match expected values
 *
 * @example
 * ```typescript
 * compareSong(apiResponse, TEST_SONGS.SONG_1);
 * // Validates that song has correct title and artist
 * ```
 */
export function compareSong(songResponse: any, testSong: any) {
  expect(songResponse).toHaveProperty('id');
  expect(songResponse).toHaveProperty('title');
  expect(songResponse).toHaveProperty('artist');

  expect(songResponse.title).toBe(testSong.title);
  expect(songResponse.artist).toBe(testSong.artist);
}
