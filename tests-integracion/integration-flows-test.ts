import { describe, it, expect, beforeEach } from 'vitest';

import '../config.test';

import app from '../server/app';
import {
  cleanupTestDatabase,
  setupCompleteTestDatabase,
  TEST_PLAYLISTS,
  TEST_SONGS,
} from '../server/db.test';

describe('Integration Flows - Multiple Endpoints', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Flow 1: Playlist Publication Flow', () => {
    it("should create unpublished playlist, verify it's hidden, publish it, and verify it's visible", async () => {
      await setupCompleteTestDatabase();

      // Step 1: Create a new playlist (should be unpublished by default)
      const newPlaylist = {
        name: 'My New Playlist',
        description: 'A'.repeat(50),
      };

      const createResponse = await app.request('/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(createResponse.status).toBe(201);
      const createBody = await createResponse.json();
      const createdPlaylist = createBody.data;

      // Verify it's unpublished
      expect(createdPlaylist.isPublished).toBe(false);
      expect(createdPlaylist.publishedAt).toBe(null);

      // Step 2: Get published playlists (should not include the new one)
      const getPublishedResponse = await app.request('/playlists', {
        method: 'GET',
      });

      expect(getPublishedResponse.status).toBe(200);
      const getPublishedBody = await getPublishedResponse.json();
      const publishedPlaylists = getPublishedBody.data;

      // Verify the new playlist is not in published list
      const foundInPublished = publishedPlaylists.find(
        (p: any) => p.id === createdPlaylist.id
      );
      expect(foundInPublished).toBeUndefined();

      // Step 3: Get all playlists (should include the new one)
      const getAllResponse = await app.request('/playlists?published=false', {
        method: 'GET',
      });

      expect(getAllResponse.status).toBe(200);
      const getAllBody = await getAllResponse.json();
      const allPlaylists = getAllBody.data;

      // Verify the new playlist is in all playlists list
      const foundInAll = allPlaylists.find(
        (p: any) => p.id === createdPlaylist.id
      );
      expect(foundInAll).toBeDefined();
      expect(foundInAll.isPublished).toBe(false);
      expect(foundInAll.publishedAt).toBe(null);

      // Step 4: Publish the playlist
      const publishResponse = await app.request(
        `/playlists/${createdPlaylist.id}/publish`,
        {
          method: 'POST',
        }
      );

      expect(publishResponse.status).toBe(200);
      const publishBody = await publishResponse.json();
      const publishedPlaylist = publishBody.data;

      // Verify it's now published
      expect(publishedPlaylist.isPublished).toBe(true);
      expect(publishedPlaylist.publishedAt).not.toBe(null);

      // Step 5: Get published playlists again (should now include the published one)
      const getPublishedAfterResponse = await app.request(
        '/playlists?published=true',
        {
          method: 'GET',
        }
      );

      expect(getPublishedAfterResponse.status).toBe(200);
      const getPublishedAfterBody = await getPublishedAfterResponse.json();
      const publishedPlaylistsAfter = getPublishedAfterBody.data;

      // Verify the playlist is now in published list
      const foundInPublishedAfter = publishedPlaylistsAfter.find(
        (p: any) => p.id === createdPlaylist.id
      );
      expect(foundInPublishedAfter).toBeDefined();
      expect(foundInPublishedAfter.isPublished).toBe(true);
      expect(foundInPublishedAfter.publishedAt).not.toBe(null);
    });
  });

  describe('Flow 2: Playlist Deletion Flow', () => {
    it("should get playlist, delete it, and verify it's gone", async () => {
      await setupCompleteTestDatabase();

      // Step 1: Get a specific playlist
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;

      const getResponse = await app.request(`/playlists/${playlistId}`, {
        method: 'GET',
      });

      expect(getResponse.status).toBe(200);
      const getBody = await getResponse.json();
      const playlist = getBody.data;

      expect(playlist.id).toBe(playlistId);
      expect(playlist.name).toBe('Test Playlist 1');

      // Step 2: Delete the playlist
      const deleteResponse = await app.request(`/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(204);

      // Step 3: Try to get the deleted playlist (should return 404)
      const getDeletedResponse = await app.request(`/playlists/${playlistId}`, {
        method: 'GET',
      });

      expect(getDeletedResponse.status).toBe(404);

      // Step 4: Get all playlists and verify the deleted one is not there
      const getAllResponse = await app.request('/playlists?published=false', {
        method: 'GET',
      });

      expect(getAllResponse.status).toBe(200);
      const getAllBody = await getAllResponse.json();
      const allPlaylists = getAllBody.data;

      const foundDeleted = allPlaylists.find((p: any) => p.id === playlistId);
      expect(foundDeleted).toBeUndefined();
    });
  });

  describe('Flow 3: Song Management Flow', () => {
    it("should create song, add to playlist, verify it's there, and remove it", async () => {
      await setupCompleteTestDatabase();

      // Step 1: Create a new song
      const newSong = {
        title: 'Integration Test Song',
        artist: 'Integration Test Artist',
      };

      const createSongResponse = await app.request('/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSong),
      });

      expect(createSongResponse.status).toBe(201);
      const createSongBody = await createSongResponse.json();
      const createdSong = createSongBody.data;

      expect(createdSong.title).toBe(newSong.title);
      expect(createdSong.artist).toBe(newSong.artist);

      // Step 2: Get a playlist to add the song to
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;

      const getPlaylistResponse = await app.request(
        `/playlists/${playlistId}`,
        {
          method: 'GET',
        }
      );

      expect(getPlaylistResponse.status).toBe(200);
      const getPlaylistBody = await getPlaylistResponse.json();
      const playlist = getPlaylistBody.data;

      const initialSongCount = playlist.songs.length;
      //verificar que el playlist no tiene el song creado
      const foundSong = playlist.songs.find(
        (s: any) => s.id === createdSong.id
      );
      expect(foundSong).toBeUndefined();

      // Step 3: Add the song to the playlist
      const addSongResponse = await app.request(
        `/playlists/${playlistId}/songs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ songId: createdSong.id }),
        }
      );

      expect(addSongResponse.status).toBe(200);

      // Step 4: Get the playlist again and verify the song was added
      const getPlaylistAfterResponse = await app.request(
        `/playlists/${playlistId}`,
        {
          method: 'GET',
        }
      );

      expect(getPlaylistAfterResponse.status).toBe(200);
      const getPlaylistAfterBody = await getPlaylistAfterResponse.json();
      const playlistAfter = getPlaylistAfterBody.data;

      expect(playlistAfter.songs.length).toBe(initialSongCount + 1);

      const addedSong = playlistAfter.songs.find(
        (s: any) => s.id === createdSong.id
      );
      expect(addedSong).toBeDefined();
      expect(addedSong.title).toBe(newSong.title);
      expect(addedSong.artist).toBe(newSong.artist);
    });
  });

  describe('Flow 4: Song Update and Deletion Flow', () => {
    it('should get song, update it, verify changes, and delete it', async () => {
      await setupCompleteTestDatabase();

      // Step 1: Get a specific song
      const songId = TEST_SONGS.SONG_1.id;

      const getResponse = await app.request(`/songs/${songId}`, {
        method: 'GET',
      });

      expect(getResponse.status).toBe(200);
      const getBody = await getResponse.json();
      const song = getBody.data;

      expect(song.id).toBe(songId);
      expect(song.title).toBe(TEST_SONGS.SONG_1.title);
      expect(song.artist).toBe(TEST_SONGS.SONG_1.artist);

      // Step 2: Update the song
      const updatedSong = {
        title: 'Updated Integration Song',
        artist: 'Updated Integration Artist',
      };

      const updateResponse = await app.request(`/songs/${songId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSong),
      });

      expect(updateResponse.status).toBe(200);
      const updateBody = await updateResponse.json();
      const updatedSongData = updateBody.data;

      expect(updatedSongData.title).toBe(updatedSong.title);
      expect(updatedSongData.artist).toBe(updatedSong.artist);
      expect(updatedSongData.title).not.toBe(TEST_SONGS.SONG_1.title);
      expect(updatedSongData.artist).not.toBe(TEST_SONGS.SONG_1.artist);

      // Step 3: Get the song again and verify the changes persisted
      const getAfterResponse = await app.request(`/songs/${songId}`, {
        method: 'GET',
      });

      expect(getAfterResponse.status).toBe(200);
      const getAfterBody = await getAfterResponse.json();
      const songAfter = getAfterBody.data;

      expect(songAfter.title).toBe(updatedSong.title);
      expect(songAfter.artist).toBe(updatedSong.artist);

      // Step 4: Delete the song
      const deleteResponse = await app.request(`/songs/${songId}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(204);

      // Step 5: Try to get the deleted song (should return 404)
      const getDeletedResponse = await app.request(`/songs/${songId}`, {
        method: 'GET',
      });

      expect(getDeletedResponse.status).toBe(404);
    });
  });

  describe('Flow 5: Complex Playlist Management Flow', () => {
    it('should create playlist, add songs, publish, verify in listings, then delete', async () => {
      await setupCompleteTestDatabase();

      // Step 1: Create a new playlist
      const newPlaylist = {
        name: 'Complex Test Playlist',
        description: 'A'.repeat(50),
      };

      const createPlaylistResponse = await app.request('/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlaylist),
      });

      expect(createPlaylistResponse.status).toBe(201);
      const createPlaylistBody = await createPlaylistResponse.json();
      const createdPlaylist = createPlaylistBody.data;

      // Step 2: Create a new song
      const newSong = {
        title: 'Complex Test Song',
        artist: 'Complex Test Artist',
      };

      const createSongResponse = await app.request('/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSong),
      });

      expect(createSongResponse.status).toBe(201);
      const createSongBody = await createSongResponse.json();
      const createdSong = createSongBody.data;

      // Step 3: Add song to playlist
      const addSongResponse = await app.request(
        `/playlists/${createdPlaylist.id}/songs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ songId: createdSong.id }),
        }
      );

      expect(addSongResponse.status).toBe(200);

      // Step 4: Verify playlist has the song but is not published
      const getPlaylistResponse = await app.request(
        `/playlists/${createdPlaylist.id}`,
        {
          method: 'GET',
        }
      );

      expect(getPlaylistResponse.status).toBe(200);
      const getPlaylistBody = await getPlaylistResponse.json();
      const playlist = getPlaylistBody.data;

      expect(playlist.isPublished).toBe(false);
      expect(playlist.songs.length).toBe(1);
      expect(playlist.songs[0].id).toBe(createdSong.id);

      // Step 5: Verify it's not in published playlists
      const getPublishedResponse = await app.request('/playlists', {
        method: 'GET',
      });

      expect(getPublishedResponse.status).toBe(200);
      const getPublishedBody = await getPublishedResponse.json();
      const publishedPlaylists = getPublishedBody.data;

      const foundInPublished = publishedPlaylists.find(
        (p: any) => p.id === createdPlaylist.id
      );
      expect(foundInPublished).toBeUndefined();

      // Step 6: Publish the playlist
      const publishResponse = await app.request(
        `/playlists/${createdPlaylist.id}/publish`,
        {
          method: 'POST',
        }
      );

      expect(publishResponse.status).toBe(200);

      // Step 7: Verify it's now in published playlists
      const getPublishedAfterResponse = await app.request('/playlists', {
        method: 'GET',
      });

      expect(getPublishedAfterResponse.status).toBe(200);
      const getPublishedAfterBody = await getPublishedAfterResponse.json();
      const publishedPlaylistsAfter = getPublishedAfterBody.data;

      const foundInPublishedAfter = publishedPlaylistsAfter.find(
        (p: any) => p.id === createdPlaylist.id
      );
      expect(foundInPublishedAfter).toBeDefined();
      expect(foundInPublishedAfter.isPublished).toBe(true);

      // Step 8: Delete the playlist
      const deleteResponse = await app.request(
        `/playlists/${createdPlaylist.id}`,
        {
          method: 'DELETE',
        }
      );

      expect(deleteResponse.status).toBe(204);

      // Step 9: Verify it's gone from all listings
      const getDeletedResponse = await app.request(
        `/playlists/${createdPlaylist.id}`,
        {
          method: 'GET',
        }
      );

      expect(getDeletedResponse.status).toBe(404);

      const getAllResponse = await app.request('/playlists?published=false', {
        method: 'GET',
      });

      expect(getAllResponse.status).toBe(200);
      const getAllBody = await getAllResponse.json();
      const allPlaylists = getAllBody.data;

      const foundDeleted = allPlaylists.find(
        (p: any) => p.id === createdPlaylist.id
      );
      expect(foundDeleted).toBeUndefined();

      //verifico que si exista el song en el listado de songs
      const getSongResponse = await app.request(`/songs/${createdSong.id}`, {
        method: 'GET',
      });

      expect(getSongResponse.status).toBe(200);
      const getSongBody = await getSongResponse.json();
      const song = getSongBody.data;

      expect(song.id).toBe(createdSong.id);
      expect(song.title).toBe(newSong.title);
      expect(song.artist).toBe(newSong.artist);
    });
  });

  describe('Flow 6: Song Deletion from System Flow', () => {
    it("should delete a song and verify it's removed from all playlists", async () => {
      await setupCompleteTestDatabase();

      // Step 1: Get a playlist that has songs
      const playlistId = TEST_PLAYLISTS.PLAYLIST_1.id;

      const getPlaylistResponse = await app.request(
        `/playlists/${playlistId}`,
        {
          method: 'GET',
        }
      );

      expect(getPlaylistResponse.status).toBe(200);
      const getPlaylistBody = await getPlaylistResponse.json();
      const playlist = getPlaylistBody.data;

      const initialSongCount = playlist.songs.length;
      expect(initialSongCount).toBe(2);

      // Get the first song to delete
      const songToDelete = playlist.songs[0];
      console.log('songToDelete', songToDelete);
      expect(songToDelete).toBeDefined();

      // Step 2: Delete the song from the system
      const deleteSongResponse = await app.request(
        `/songs/${songToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      expect(deleteSongResponse.status).toBe(204);

      // Step 3: Get the playlist again and verify the song was removed
      const getPlaylistAfterResponse = await app.request(
        `/playlists/${playlistId}`,
        {
          method: 'GET',
        }
      );

      expect(getPlaylistAfterResponse.status).toBe(200);
      const getPlaylistAfterBody = await getPlaylistAfterResponse.json();
      const playlistAfter = getPlaylistAfterBody.data;

      // Verify playlist still exists
      expect(playlistAfter.id).toBe(playlistId);
      expect(playlistAfter.name).toBe(playlist.name);
      expect(playlistAfter.description).toBe(playlist.description);

      // Verify song count decreased
      expect(playlistAfter.songs.length).toBe(1);

      // Verify the specific song is no longer in the playlist
      const foundDeletedSong = playlistAfter.songs.find(
        (s: any) => s.id === songToDelete.id
      );
      expect(foundDeletedSong).toBeUndefined();

      // Step 4: Verify this is reflected in the playlists listing
      const getPlaylistsResponse = await app.request('/playlists', {
        method: 'GET',
      });

      expect(getPlaylistsResponse.status).toBe(200);
      const getPlaylistsBody = await getPlaylistsResponse.json();
      const playlists = getPlaylistsBody.data;

      // Find our playlist in the listing
      const playlistInListing = playlists.find((p: any) => p.id === playlistId);
      expect(playlistInListing).toBeDefined();

      // Verify the playlist in the listing also has the song removed
      expect(playlistInListing.songs.length).toBe(1);

      const foundDeletedSongInListing = playlistInListing.songs.find(
        (s: any) => s.id === songToDelete.id
      );
      expect(foundDeletedSongInListing).toBeUndefined();

      // Step 5: Verify the song no longer exists independently
      const getSongResponse = await app.request(`/songs/${songToDelete.id}`, {
        method: 'GET',
      });

      expect(getSongResponse.status).toBe(404);
    });

    it("should delete a song that exists in multiple playlists and verify it's removed from all", async () => {
      await setupCompleteTestDatabase();

      const songToDelete = TEST_SONGS.SONG_1;
      // Step 2: Delete the song
      const deleteSongResponse = await app.request(
        `/songs/${songToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      expect(deleteSongResponse.status).toBe(204);
      const playlistsWithSong = [
        TEST_PLAYLISTS.PLAYLIST_1,
        TEST_PLAYLISTS.PLAYLIST_3,
      ];

      // Step 3: Verify the song is removed from all playlists
      for (const playlist of playlistsWithSong) {
        const getPlaylistResponse = await app.request(
          `/playlists/${playlist.id}`,
          {
            method: 'GET',
          }
        );

        expect(getPlaylistResponse.status).toBe(200);
        const getPlaylistBody = await getPlaylistResponse.json();
        const updatedPlaylist = getPlaylistBody.data;

        // Verify the song is no longer in this playlist
        const foundDeletedSong = updatedPlaylist.songs.find(
          (s: any) => s.id === songToDelete.id
        );
        expect(foundDeletedSong).toBeUndefined();
      }

      // Step 4: Verify the song no longer exists
      const getSongResponse = await app.request(`/songs/${songToDelete.id}`, {
        method: 'GET',
      });

      expect(getSongResponse.status).toBe(404);
    });
  });
});
