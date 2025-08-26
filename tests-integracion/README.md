# Tests de Integración

Este directorio contiene los tests de integración que verifican el funcionamiento completo de la aplicación con una base de datos real.

## Configuración

### 1. Variables de Entorno

Los tests utilizan un archivo `.env.test` con las siguientes configuraciones:

```bash
MYSQL_ROOT_PASSWORD=test_root_password
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=melodia_db_test
DATABASE_PORT=3307
HOSTNAME=localhost
PORT=3001
DB_HOST="localhost"
ENVIRONMENT="test"
```

### 2. Base de Datos de Testing

Los tests de integración utilizan una base de datos MySQL separada que se ejecuta en Docker:

```bash
# Levantar la base de datos de testing
npm run test:db:up

# Bajar la base de datos de testing
npm run test:db:down

# Limpiar completamente (incluye volúmenes)
npm run test:db:clean
```

## Ejecutar Tests

### Paso 1: Verificar Estado de la Base de Datos

Antes de ejecutar los tests, es **obligatorio** verificar que la base de datos esté funcionando correctamente:

```bash
# Verificar el estado de la base de datos
npm run test:db:status

# Si la BD no está corriendo, levantarla:
npm run test:db:up

# Esperar unos segundos para que la BD se inicialice completamente
```

### Paso 2: Ejecutar los Tests

Una vez que la base de datos esté funcionando, puedes ejecutar los tests:

#### Tests de Integración Completos
```bash
npm run test:integration
```

#### Tests Específicos

Puedes ejecutar tests individuales o por categoría:

```bash
# Test específico de un archivo (sin extensión .ts)
npm run test:integration:file playlists-get-test

# Ejecutar todos los tests de playlists de una vez
npm run test:integration:playlists

# Ejecutar todos los tests de songs de una vez
npm run test:integration:songs

# Ejecutar tests individuales de playlists
npm run test:integration:file playlists-get-test
npm run test:integration:file playlists-post-test
npm run test:integration:file playlists-id-get-test
npm run test:integration:file playlists-id-delete-test
npm run test:integration:file playlists-id-songs-post-test

# Ejecutar tests individuales de songs
npm run test:integration:file songs-get-test
npm run test:integration:file songs-post-test
npm run test:integration:file songs-id-get-test
npm run test:integration:file songs-id-put-test
npm run test:integration:file songs-id-delete-test
```

### Archivos de Test Disponibles

Los siguientes archivos de test están disponibles para ejecución:

#### Tests de Playlists
- `playlists-get-test.ts` - Tests para GET /playlists (incluye filtros `published` y `sort`)
- `playlists-post-test.ts` - Tests para POST /playlists
- `playlists-id-get-test.ts` - Tests para GET /playlists/:id
- `playlists-id-delete-test.ts` - Tests para DELETE /playlists/:id
- `playlists-id-songs-post-test.ts` - Tests para POST /playlists/:id/songs
- `playlists-id-publish-test.ts` - Tests para POST /playlists/:id/publish
- `integration-flows-test.ts` - Tests de flujos completos usando múltiples endpoints

#### Tests de Songs
- `songs-get-test.ts` - Tests para GET /songs
- `songs-post-test.ts` - Tests para POST /songs
- `songs-id-get-test.ts` - Tests para GET /songs/:id
- `songs-id-put-test.ts` - Tests para PUT /songs/:id
- `songs-id-delete-test.ts` - Tests para DELETE /songs/:id

#### Archivos de Soporte
- `tests-functions.ts` - Funciones auxiliares para los tests


## Casos de Prueba

Cada endpoint se prueba en:

### Casos Felices (Happy Path)
- ✅ Respuestas exitosas (200, 201, 204)
- ✅ Estructura correcta de datos
- ✅ Verificación en base de datos
- ✅ Validación de datos retornados

### Casos de Error
- ❌ Datos faltantes (400)
- ❌ IDs inválidos (400)
- ❌ Recursos no encontrados (404)
- ❌ JSON inválido (400)

## Parámetros de Ordenamiento (GET /playlists)

El endpoint `GET /playlists` soporta los siguientes parámetros de consulta:

### Parámetro `published`
- **Valores**: `"true"` | `"false"`
- **Por defecto**: `"true"` (solo playlists publicadas)
- **Comportamiento**:
  - `published=true`: Retorna solo playlists con `isPublished: true`
  - `published=false`: Retorna todas las playlists (publicadas y no publicadas)

### Parámetro `sort`
- **Valores**: `"asc"` | `"desc"`
- **Por defecto**: `"desc"` (más recientes primero)
- **Comportamiento**:
  - `sort=desc`: Ordena por `publishedAt` descendente (más recientes primero)
  - `sort=asc`: Ordena por `publishedAt` ascendente (más antiguas primero)
  - **Playlists no publicadas**: Siempre aparecen al final, independientemente del valor de `sort`

### Ejemplos de Uso
```bash
# Obtener solo playlists publicadas, ordenadas por fecha descendente (por defecto)
GET /playlists

# Obtener solo playlists publicadas, ordenadas por fecha ascendente
GET /playlists?sort=asc

# Obtener todas las playlists (publicadas y no publicadas)
GET /playlists?published=false

# Obtener todas las playlists, ordenadas por fecha ascendente
GET /playlists?published=false&sort=asc
```

## Aislamiento de Tests

Cada test se ejecuta en aislamiento:

+ **AfterEach**: Se limpia la base de datos después de cada test
+ **En cada test, se popula la base de datos con el escenario adecuado para el test**

Esto garantiza que cada test comience con un estado conocido y no interfiera con otros tests.


### Variables de Entorno
- Si hay problemas con las variables de entorno, verificar que el archivo `.env.test` existe
- Los valores por defecto están en `config.test.ts`

