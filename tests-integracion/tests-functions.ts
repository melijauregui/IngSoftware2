import { expect } from "vitest";
import { TEST_SONGS } from "../server/db.test";

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

  if (fullComparison) {
    expect(playlistResponse.id).toBe(testPlaylist.id);
    expect(playlistResponse.publishedAt).toBe(
      testPlaylist.published_at.toISOString()
    );
    expect(playlistResponse.isPublished).toBe(testPlaylist.is_published);
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
