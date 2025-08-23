# IngSoftware2
Tp0 Individual

El repositorio debe incluir un archivo README.md (en español) con:
+ Una tabla de contenido.
+ Una introducción con no más de un párrafo pequeño y conciso sobre la solución planteada.
+ Una sección sobre qué fue lo más desafiante del proyecto.
+ Un apartado de pre-requisitos listando lo necesario para levantar el entorno de desarrollo, especificando los lenguajes y versiones de los manejadores de paquetes necesarios.
+ Link al "user-guide" de la libreria que se uso para testear, o en su defecto link al repo. e.g: Junit, gin-gonic
+ Comandos para construir la imagen de Docker.
+ Comandos para correr la base de datos.
+ Comandos para correr la imagen del servicio.
+ Fecha máxima de entrega: 28-08-2025

npx ts-node server/index.ts

## Endpoints y Comandos curl

### 1. Crear una nueva canción (POST /songs)
```bash
curl -X POST http://localhost:3000/songs \
  -H "Content-Type: application/json" \
  -d '{"title": "I Want To Break Free", "artist": "Queen"}' | jq
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": 1,
    "title": "I Want To Break Free",
    "artist": "Queen"
  }
}
```

### 2. Obtener todas las canciones (GET /songs)
```bash
curl -X GET http://localhost:3000/songs | jq
```

**Respuesta esperada:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "I Want To Break Free",
      "artist": "Queen"
    }
  ]
}
```

### 3. Obtener una canción por ID (GET /songs/:id)
```bash
curl -X GET http://localhost:3000/songs/1 | jq
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": 1,
    "title": "I Want To Break Free",
    "artist": "Queen"
  }
}
```

### 4. Actualizar una canción por ID (PUT /songs/:id)
```bash
# Actualizar título y artista
curl -X PUT http://localhost:3000/songs/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Bohemian Rhapsody", "artist": "Queen 1975"}' | jq
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": 1,
    "title": "Bohemian Rhapsody",
    "artist": "Queen 1975"
  }
}
```

```bash
# Actualizar solo el título
curl -X PUT http://localhost:3000/songs/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Another One Bites The Dust"}' | jq
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": 1,
    "title": "Another One Bites The Dust",
    "artist": "Queen 1975"
  }
}
```

```bash
# Actualizar solo el artista
curl -X PUT http://localhost:3000/songs/1 \
  -H "Content-Type: application/json" \
  -d '{"artist": "Queen & David Bowie"}' | jq
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": 1,
    "title": "Another One Bites The Dust",
    "artist": "Queen & David Bowie"
  }
}
```

### 5. Eliminar una canción por ID (DELETE /songs/:id)
```bash
curl -X DELETE http://localhost:3000/songs/1
```

**Respuesta esperada:**
```
(No content - Status 204)
```

## Endpoints de Playlists

### 1. Crear una nueva playlist (POST /playlists)
```bash
curl -X POST http://localhost:3000/playlists \
  -H "Content-Type: application/json" \
  -d '{"name": "Mis Canciones Favoritas", "description": "Una colección de mis canciones favoritas que me encantan escuchar en cualquier momento del día"}' | jq
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": 1,
    "name": "Mis Canciones Favoritas",
    "description": "Una colección de mis canciones favoritas que me encantan escuchar en cualquier momento del día",
    "isPublished": true,
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "songs": []
  }
}
```

### 2. Obtener todas las playlists (GET /playlists)
```bash
curl -X GET http://localhost:3000/playlists | jq
```

**Respuesta esperada:**
```json
{
  "data": [
    {
      "id": 2,
      "name": "Nueva Playlist",
      "description": "Una playlist más reciente creada después de la primera con algunas canciones geniales",
      "isPublished": true,
      "publishedAt": "2024-01-02T00:00:00.000Z",
      "songs": [
        {
          "id": 3,
          "title": "Nueva Canción",
          "artist": "Nuevo Artista",
          "addedAt": "2024-01-04T00:00:00.000Z"
        }
      ]
    },
    {
      "id": 1,
      "name": "Mis Canciones Favoritas",
      "description": "Una colección de mis canciones favoritas que me encantan escuchar en cualquier momento del día",
      "isPublished": true,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "songs": []
    }
  ]
}
```


### Notas importantes:
- Todos los endpoints devuelven JSON
- El parámetro `id` debe ser un número entero positivo
- Para las actualizaciones (PUT), al menos uno de los campos (`title` o `artist`) debe ser proporcionado
- Los campos `title` y `artist` tienen un límite máximo de 50 caracteres
- **Para playlists:**
  - El campo `name` debe tener entre 1 y 50 caracteres
  - El campo `description` debe tener entre 50 y 255 caracteres
  - Las playlists se crean automáticamente como publicadas (`isPublished: true`)
  - El campo `songs` siempre se inicializa como un array vacío
- El comando `jq` al final es opcional, pero ayuda a formatear la salida JSON de manera legible




//TODO AGREGAR TESTS CON BDD TESTING ESPECIALMENTE GET /playlists

