# IngSoftware2 - TP0 Individual

El repositorio debe incluir un archivo README.md (en español) con:
+ Un apartado de pre-requisitos listando lo necesario para levantar el entorno de desarrollo, especificando los lenguajes y versiones de los manejadores de paquetes necesarios.
+ Link al "user-guide" de la libreria que se uso para testear, o en su defecto link al repo. e.g: Junit, gin-gonic
+ Comandos para construir la imagen de Docker.
+ Comandos para correr la base de datos.
+ Comandos para correr la imagen del servicio.

## Tabla de Contenido

- [Introducción](#introducción)
- [Desafíos del Proyecto](#desafíos-del-proyecto)
- [Pre-requisitos](#pre-requisitos)
- [Instalación](#instalación)
- [Base de Datos](#base-de-datos)
- [Docker](#docker)
- [Testing](#testing)
- [Desafíos Opcionales](#desafíos-opcionales)
- [Estructura del Proyecto](#estructura-del-proyecto)

## Introducción

Este proyecto implementa una API REST para gestionar playlists y canciones utilizando Node.js con TypeScript, Hono como framework web, y Postgres como base de datos. La solución incluye un sistema completo de testing con dos enfoques: tests unitarios con mocks para validar lógica de errores y tests de integración con base de datos real para verificar el flujo completo de la aplicación.

## Desafíos del Proyecto

El mayor desafío fue implementar un sistema de testing robusto que cubriera tanto los casos de éxito como los escenarios de error. Esto requirió:

- **Diseño de mocks** para simular fallos de base de datos y validaciones
- **Configuración de tests de integración** con base de datos real en Docker
- **Aislamiento de tests** para garantizar que no interfieran entre sí
- **Documentación clara** de ambos tipos de tests para facilitar el mantenimiento

Gracias a que ya trabajé con creación de endpoints y manejo de base de datos relacionales en mi proyecto de tesis y trabajos prácticos de materias como arquitectura de software, en sí la implementación de los mismos no fue un gran desafio. 

## Pre-requisitos

### Lenguajes y Versiones
- **Node.js**: v18.0.0 o superior
- **TypeScript**: v5.3.2
- **MySQL**: v8.0 (via Docker)

### Manejadores de Paquetes
- **npm**: v9.0.0 o superior
- **Docker**: v20.0.0 o superior
- **Docker Compose**: v2.0.0 o superior

### Dependencias Principales
- **Hono**: v4.0.5 (Framework web)
- **Vitest**: v3.2.4 (Framework de testing)
- **Supertest**: v7.1.4 (Testing de APIs)
- **MySQL2**: v3.9.7 (Driver de MySQL)
- **Winston**: v3.17.0 (Logger)
- **Zod**: v3.22.4 (Validación de esquemas)

## Instalación

```bash
# Clonar el repositorio
git clone git@github.com:melijauregui/IngSoftware2.git
cd IngSoft2

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env_example .env
cp .env.test_example .env.test
```

## Base de Datos

### Levantar Base de Datos de Desarrollo
```bash
# Levantar MySQL con Docker Compose
docker compose up -d --build

# Verificar que la BD esté corriendo
docker ps | grep melodia-db
```

### Levantar Base de Datos de Testing
```bash
# Levantar BD de testing
npm run test:db:up

# Verificar estado de la BD
# Esperar unos segundos a que se levante bien la BD
npm run test:db:status

# Bajar BD de testing
npm run test:db:down
```

## Docker

### Comandos
```bash
# Construir imagen de la aplicación
npm run docker:build
# Ejecutar la aplicación en Docker (incluye levantar la BD)
npm run docker:run
# Parar servicios
npm run docker:down
# Ver logs
npm run docker:logs
```

### Ejecutar con Docker Compose
```bash
# Levantar aplicación completa (app + BD)
docker compose up -d

# Ver logs
docker compose logs -f

# Parar servicios
docker compose down
```

## Testing

### Framework de Testing
- **Vitest**: Framework principal para tests unitarios y de integración
- **Supertest**: Para testing de APIs HTTP
- **Referencia**: [Vitest User Guide](https://vitest.dev/guide/)

### Tests Unitarios con Mocks

Los tests unitarios utilizan mocks para simular errores y dependencias externas:

```bash
# Ejecutar todos los tests unitarios
npm run test:mocked

# Ejecutar tests específicos por categoría
npm run test:mocked:playlists
npm run test:mocked:songs

# Ejecutar test específico
npm run test:mocked:file playlists-get-test
```

### Tests de Integración

Los tests de integración utilizan una base de datos real:

```bash
# Verificar estado de BD antes de ejecutar tests
npm run test:db:status

# Ejecutar todos los tests de integración
npm run test:integration

# Ejecutar tests específicos por categoría
npm run test:integration:playlists
npm run test:integration:songs

# Ejecutar test específico
npm run test:integration:file playlists-get-test
```
### Documentación Adicional

Para información más detallada sobre los tests, consulta:

- **[README de Tests Mocked](tests-mocked/README.md)** - Documentación completa de tests unitarios con mocks
- **[README de Tests de Integración](tests-integracion/README.md)** - Documentación completa de tests de integración

## Desafíos Opcionales

### 1. Validación de Longitud de Descripción ✅

**Implementado**: Validación de longitud mínima (50 caracteres) y máxima (255 caracteres) para el campo `description` de las playlists.

**Schema de validación**: `CreatePlaylistRequestSchema` en `schemas/playlists.ts` utiliza Zod para validar:
- Mínimo: 50 caracteres
- Máximo: 255 caracteres
- Respuesta con código 400 si la validación falla

**Tests de verificación**: Ubicados en `tests-integracion/playlists-post-test.ts`:
- `"should create a playlist successfully and return 201"` - Test de descripción mínima válida (50 caracteres)
- `"should handle maximum valid description length"` - Test de descripción máxima válida (255 caracteres)
- `"should return 400 when the description is too short"` - Test de descripción muy corta (código 400)
- `"should return 400 when the description is too long"` - Test de descripción muy larga (código 400)
- `"should return 400 when the description only has spaces"` - Test de descripción con solo espacios (código 400)

### 2. UUID v4 para Playlists ✅

**Implementado**: Sistema completo de UUID v4 para playlists con verificación de 128 bits.

**Características**:
- **Generación automática**: PostgreSQL genera automáticamente UUIDs v4 usando `gen_random_uuid()` en la base de datos. [Referencia](https://www.postgresql.org/docs/current/functions-uuid.html)
- **Formato estándar**: Los UUIDs se representan como strings en formato estándar en el contrato REST
- **Reemplazo de IDs numéricos**: Se utilizan UUIDs como identificadores en todas las operaciones

**Tests de verificación**: 
- Ubicados en `tests-integracion/playlists-post-test.ts`
- Incluyen validación de formato UUID v4 
- Verifican unicidad de UUIDs generados

### 3. Middleware para Manejo Centralizado de Errores ✅

**Implementado**: Sistema de manejo centralizado de errores usando Hono.

**Características**:
- **defaultHook**: Configurado en OpenAPIHono para manejar errores de validación automáticamente
- **onError middleware**: Manejo centralizado de errores con formato RFC 7807
- **Referencias utilizadas**:
  - [@hono/zod-openapi middleware](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
  - [Hono error handling](https://hono.dev/docs/api/hono#error-handling)

### 4. Mejoras a la Solución ✅

**Mejoras implementadas**:
- **Migración de MySQL a PostgreSQL**: Cambio de MySQL con queries manuales a PostgreSQL con Prisma ORM
- **Código más mantenible**: Uso de Prisma simplifica el código y mejora la mantenibilidad
- **Generación automática de UUIDs**: PostgreSQL genera UUIDs v4 nativamente, permitiendo implementar el desafío opcional #2
- **Mejor estructura de código**: Separación clara entre lógica de negocio y acceso a datos

### 5. Docker Compose ✅

**Implementado**: Configuración completa con Docker Compose.

**Características**:
- **compose.yaml**: Define servicios de aplicación y base de datos
- **Base de datos**: PostgreSQL configurado como servicio independiente
- **Aplicación**: Contenedor de la aplicación que apunta al Dockerfile
- **Networking**: Comunicación automática entre contenedores
- **Variables de entorno**: Configuración separada para desarrollo y testing


### 7. Publicación Diferida de Playlists ✅

**Implementado**: Sistema de publicación diferida donde las playlists recién creadas no son visibles hasta que se publiquen explícitamente.

**Características**:
- **Estado por defecto**: Las playlists se crean con `isPublished: false` y `publishedAt: null`
- **Endpoint de publicación**: `POST /playlists/{id}/publish` (idempotente)
- **Filtrado en listado**: `GET /playlists?published=true` (por defecto) vs `GET /playlists?published=false` (todas)
- **Ordenamiento**: Las playlists se ordenan por `publishedAt` en orden descendente (más recientes primero)
- **Integridad de datos**: Validación que `publishedAt` no puede ser null si `isPublished` es true

**Tests de verificación**: 
- Ubicados en `tests-integracion/playlists-get-test.ts` y `tests-integracion/playlists-id-publish-test.ts`
- Verifican flujo completo de creación → publicación → visibilidad
- Validan comportamiento idempotente del endpoint de publicación

## Tests de Integración de Flujos Complejos 

**Implementado**: Tests de integración que prueban flujos completos usando múltiples endpoints en secuencia.

**Características**:
- **Flujos de publicación**: Crear playlist → verificar oculta → publicar → verificar visible
- **Flujos de eliminación**: Obtener playlist → eliminar → verificar desaparece
- **Flujos de gestión de canciones**: Crear canción → agregar a playlist → verificar integridad
- **Flujos de eliminación de canciones**: Eliminar canción → verificar desaparece de todas las playlists


**Comandos disponibles**:
```bash
# Levantar servicios completos
docker compose up -d

# Construir y levantar
docker compose up -d --build

# Ver logs
docker compose logs -f

# Parar servicios
docker compose down
```

## Estructura del Proyecto

```
IngSoft2/
├── server/                # Código fuente de la aplicación
│   ├── app.ts             # Configuración principal de Hono
│   ├── db.ts              # Configuración de base de datos
│   ├── playlists/              # Endpoints de playlists
│   └── playlists-id/           # Endpoints de playlists-id
│   ├── playlists-id-songs/     # Endpoints de playlists-id-songs
│   └── songs/                  # Endpoints de songs
│   └── songs-id/               # Endpoints de songs-id
├── tests-mocked/          # Tests unitarios con mocks
│   ├── README.md          # Documentación de tests mocked
│   └── *.ts               # Archivos de tests
├── tests-integracion/     # Tests de integración con BD real
│   ├── README.md          # Documentación de tests de integración
│   └── *.ts               # Archivos de tests 
├── scripts/               # Scripts de utilidad
├── schemas/               # Esquemas de validación Zod
├── database/              # Scripts de inicialización de BD
└── docker-compose.yml     # Configuración de Docker
```

## 📅 Fecha de Entrega

**Fecha máxima de entrega**: 28-08-2025

