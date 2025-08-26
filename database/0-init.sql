-- This script will be executed in the database specified in the environment
-- The database name is set via POSTGRES_DB environment variable

-- Create tables in the current database (which should be melodia_db_test for testing)

CREATE TABLE IF NOT EXISTS "Song" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Playlist" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "isPublished" BOOLEAN DEFAULT TRUE,
    "publishedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PlaylistsSongs" (
    "playlistId" UUID NOT NULL,
    "songId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("playlistId", "songId"),
    FOREIGN KEY ("playlistId") REFERENCES "Playlist"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("songId") REFERENCES "Song"(id) ON DELETE CASCADE ON UPDATE CASCADE
);