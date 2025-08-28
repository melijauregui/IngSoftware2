// db.test.ts
import { testConfig } from '../config.test';
import { PrismaClient } from './generated/prisma';
import logger from './logger';

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testConfig.DATABASE_URL,
    },
  },
  log: ['error'],
});

testPrisma
  .$connect()
  .then(() => {
    logger.info('Test database connection established successfully');
  })
  .catch((error: Error) => {
    logger.error(`Test database connection failed: ${error.message}`);
  });

export const TEST_SONGS = {
  SONG_1: {
    id: 1,
    title: 'Test Song 1',
    artist: 'Test Artist 1',
  },
  SONG_2: {
    id: 2,
    title: 'Test Song 2',
    artist: 'Test Artist 2',
  },
  SONG_3: {
    id: 3,
    title: 'Test Song 3',
    artist: 'Test Artist 3',
  },
};

export const TEST_PLAYLISTS = {
  PLAYLIST_1: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Test Playlist 1',
    description: 'A'.repeat(50),
    publishedAt: new Date('2024-02-03'),
    isPublished: true,
  },
  PLAYLIST_2: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Test Playlist 2',
    description: 'B'.repeat(50),
    publishedAt: new Date('2025-02-03'),
    isPublished: true,
  },
  PLAYLIST_3: {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Unpublished Playlist',
    description: 'C'.repeat(50),
    publishedAt: null,
    isPublished: false,
  },
};

export const TEST_PLAYLISTS_SONGS = {
  PLAYLIST_1_SONG_1: {
    playlistId: '550e8400-e29b-41d4-a716-446655440001',
    songId: 1,
  },
  PLAYLIST_1_SONG_2: {
    playlistId: '550e8400-e29b-41d4-a716-446655440001',
    songId: 2,
  },
  PLAYLIST_2_SONG_3: {
    playlistId: '550e8400-e29b-41d4-a716-446655440002',
    songId: 3,
  },
  PLAYLIST_3_SONG_1: {
    playlistId: '550e8400-e29b-41d4-a716-446655440003',
    songId: 1,
  },
};

export const getAllTestSongs = () => Object.values(TEST_SONGS);
export const getAllTestPlaylists = () => Object.values(TEST_PLAYLISTS);
export const getAllTestPlaylistSongs = () =>
  Object.values(TEST_PLAYLISTS_SONGS);

export const cleanupTestDatabase = async () => {
  try {
    await testPrisma.playlistsSongs.deleteMany();
    await testPrisma.playlist.deleteMany();
    await testPrisma.song.deleteMany();
    console.log('Test database cleaned up');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
};

export const setupTestJustOnePlaylistDatabase = async () => {
  try {
    await cleanupTestDatabase();
    await testPrisma.playlist.create({
      data: {
        id: TEST_PLAYLISTS.PLAYLIST_1.id,
        name: TEST_PLAYLISTS.PLAYLIST_1.name,
        description: TEST_PLAYLISTS.PLAYLIST_1.description,
        publishedAt: TEST_PLAYLISTS.PLAYLIST_1.publishedAt,
        isPublished: TEST_PLAYLISTS.PLAYLIST_1.isPublished,
      },
    });
    console.log('Test database setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
  }
};

export const setupTestJustOneSongDatabase = async () => {
  try {
    await cleanupTestDatabase();
    await testPrisma.song.create({
      data: {
        id: TEST_SONGS.SONG_1.id,
        title: TEST_SONGS.SONG_1.title,
        artist: TEST_SONGS.SONG_1.artist,
      },
    });

    // Reset the sequence to the next available ID
    await testPrisma.$executeRaw`SELECT setval('"Song_id_seq"', (SELECT MAX(id) FROM "Song"))`;

    console.log('Test database setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
  }
};

export const setupCompleteTestDatabase = async () => {
  try {
    await cleanupTestDatabase();

    // Insert songs
    const songs = getAllTestSongs();
    for (const song of songs) {
      await testPrisma.song.create({
        data: {
          id: song.id,
          title: song.title,
          artist: song.artist,
        },
      });
    }

    // Reset the sequence to the next available ID
    await testPrisma.$executeRaw`SELECT setval('"Song_id_seq"', (SELECT MAX(id) FROM "Song"))`;

    // Insert playlists
    const playlists = getAllTestPlaylists();
    for (const playlist of playlists) {
      const createdPlaylist = await testPrisma.playlist.create({
        data: {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          publishedAt: playlist.publishedAt ?? undefined,
          isPublished: playlist.isPublished,
        },
      });
    }

    // Insert playlist songs
    const playlistSongs = getAllTestPlaylistSongs();
    for (const playlistSong of playlistSongs) {
      await testPrisma.playlistsSongs.create({
        data: {
          playlistId: playlistSong.playlistId,
          songId: playlistSong.songId,
        },
      });
    }

    console.log('Test database setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
  }
};

export { testPrisma };
export default testPrisma;
