// db.test.ts
import mysql from "mysql2/promise";
import { testConfig } from "../config.test";
import logger from "./logger";

export const testDb = mysql.createPool({
  host: testConfig.DB_HOST,
  port: Number(testConfig.DATABASE_PORT),
  user: testConfig.DB_USER,
  password: testConfig.DB_PASSWORD,
  database: testConfig.DB_NAME,
  multipleStatements: true, // Allow multiple statements for setup/teardown
});

testDb
  .getConnection()
  .then((connection) => {
    logger.info("Database connection established successfully");
    connection.release();
  })
  .catch((error) => {
    logger.error(`Database connection failed: ${error.message}`);
  });

export const TEST_SONGS = {
  SONG_1: {
    id: 1,
    title: "Test Song 1",
    artist: "Test Artist 1",
  },
  SONG_2: {
    id: 2,
    title: "Test Song 2",
    artist: "Test Artist 2",
  },
  SONG_3: {
    id: 3,
    title: "Test Song 3",
    artist: "Test Artist 3",
  },
};

export const TEST_PLAYLISTS = {
  PLAYLIST_1: {
    id: 1,
    name: "Test Playlist 1",
    description: "A".repeat(50),
    published_at: new Date("2024-02-03"),
    is_published: true,
  },
  PLAYLIST_2: {
    id: 2,
    name: "Test Playlist 2",
    description: "B".repeat(50),
    published_at: new Date("2025-02-03"),
    is_published: true,
  },
};

export const TEST_PLAYLISTS_SONGS = {
  PLAYLIST_1_SONG_1: {
    playlist_id: 1,
    song_id: 1,
  },
  PLAYLIST_1_SONG_2: {
    playlist_id: 1,
    song_id: 2,
  },
  PLAYLIST_2_SONG_3: {
    playlist_id: 2,
    song_id: 3,
  },
};

export const getAllTestSongs = () => Object.values(TEST_SONGS);
export const getAllTestPlaylists = () => Object.values(TEST_PLAYLISTS);
export const getAllTestPlaylistSongs = () =>
  Object.values(TEST_PLAYLISTS_SONGS);

export const cleanupTestDatabase = async () => {
  try {
    await testDb.execute("DELETE FROM playlists_songs");
    await testDb.execute("DELETE FROM playlists");
    await testDb.execute("DELETE FROM songs");
    console.log("Test database cleaned up");
  } catch (error) {
    console.error("Error cleaning up test database:", error);
  }
};

export const setupTestJustOnePlaylistDatabase = async () => {
  try {
    await cleanupTestDatabase();
    await testDb.execute(
      "INSERT INTO playlists (id, name, description, published_at) VALUES (?, ?, ?, ?)",
      [
        TEST_PLAYLISTS.PLAYLIST_1.id,
        TEST_PLAYLISTS.PLAYLIST_1.name,
        TEST_PLAYLISTS.PLAYLIST_1.description,
        TEST_PLAYLISTS.PLAYLIST_1.published_at,
      ]
    );
    console.log("Test database setup completed");
  } catch (error) {
    console.error("Error setting up test database:", error);
  }
};

export const setupCompleteTestDatabase = async () => {
  try {
    await cleanupTestDatabase();
    const songs = getAllTestSongs();
    for (const song of songs) {
      await testDb.execute(
        "INSERT INTO songs (id, title, artist) VALUES (?, ?, ?)",
        [song.id, song.title, song.artist]
      );
    }
    const playlists = getAllTestPlaylists();
    for (const playlist of playlists) {
      await testDb.execute(
        "INSERT INTO playlists (id, name, description, published_at) VALUES (?, ?, ?, ?)",
        [
          playlist.id,
          playlist.name,
          playlist.description,
          playlist.published_at,
        ]
      );
    }

    const playlistSongs = getAllTestPlaylistSongs();
    for (const playlistSong of playlistSongs) {
      await testDb.execute(
        "INSERT INTO playlists_songs (playlist_id, song_id) VALUES (?, ?)",
        [playlistSong.playlist_id, playlistSong.song_id]
      );
    }

    console.log("Test database setup completed");
  } catch (error) {
    console.error("Error setting up test database:", error);
  }
};
