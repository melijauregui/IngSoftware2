CREATE DATABASE IF NOT EXISTS melodia_db;

USE melodia_db;

DROP USER IF EXISTS 'melodia' @'%';

CREATE USER 'melodia' @'%' IDENTIFIED BY 'password';

GRANT ALL PRIVILEGES ON melodia_db.* TO 'melodia' @'%';

FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS playlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INT NOT NULL,
    song_id INT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;