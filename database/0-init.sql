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

