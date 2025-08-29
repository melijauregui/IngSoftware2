# IngSoftware2 - TP0 Individual

El repositorio debe incluir un archivo README.md (en español) con:

- Un apartado de pre-requisitos listando lo necesario para levantar el entorno de desarrollo, especificando los lenguajes y versiones de los manejadores de paquetes necesarios.

## Tabla de Contenido

- [Introducción](#introducción)
- [Desafíos del Proyecto](#desafíos-del-proyecto)
- [Pre-requisitos](#pre-requisitos)
- [Configuración de Entornos](#configuración-de-entornos)
  - [Entorno de Desarrollo](#entorno-de-desarrollo)
  - [Entorno de Producción](#entorno-de-producción)
  - [Entorno de Testing](#entorno-de-testing)
- [Instalación](#instalación)
- [Base de Datos](#base-de-datos)
- [Docker](#docker)
- [Testing](#testing)
- [Desafíos Opcionales](#desafíos-opcionales)
- [Estructura del Proyecto](#estructura-del-proyecto)

## Introducción

Este proyecto implementa una API REST para gestionar playlists y canciones utilizando Node.js con TypeScript, Hono como framework web, y PostgreSQL como base de datos con Prisma ORM. La solución incluye un sistema completo de testing con dos enfoques: tests unitarios con mocks para validar lógica de errores y tests de integración con base de datos real para verificar el flujo completo de la aplicación.

## Desafíos del Proyecto

El mayor desafío fue implementar un sistema de testing robusto que cubriera tanto los casos de éxito como los escenarios de error. Esto requirió:

- **Diseño de mocks** para simular fallos de base de datos y validaciones
- **Configuración de tests de integración** con base de datos real en Docker
- **Aislamiento de tests** para garantizar que no interfieran entre sí

Gracias a que ya trabajé con creación de endpoints y manejo de base de datos relacionales en mi proyecto de tesis y trabajos prácticos de materias como arquitectura de software, en sí la implementación de los mismos no fue un gran desafio.

## Pre-requisitos

### Lenguajes y Versiones

- **Node.js**: v18.0.0 o superior
- **TypeScript**: v5.3.2
- **PostgreSQL**: v15 (via Docker)

### Manejadores de Paquetes

- **npm**: v9.0.0 o superior
- **Docker**: v20.0.0 o superior
- **Docker Compose**: v2.0.0 o superior

### Dependencias Principales

- **Hono**: v4.0.5 (Framework web)
- **Prisma**: v6.14.0 (ORM para PostgreSQL)
- **Vitest**: v3.2.4 (Framework de testing)
- **Supertest**: v7.1.4 (Testing de APIs)
- **PostgreSQL**: v15 (Base de datos)
- **Winston**: v3.17.0 (Logger)
- **Zod**: v3.22.4 (Validación de esquemas)

## Configuración de Entornos

### Entorno de Desarrollo

```bash
# 1. Clonar el repositorio
git clone git@github.com:melijauregui/IngSoftware2.git
cd IngSoft2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.test_example .env.test
# Editar .env con las configuraciones de desarrollo (ENVIRONMENT=development)

# 4. Levantar base de datos en Docker
npm run dev:db:up

# 5. Verificar estado de la base de datos
npm run dev:db:status

# 6. Iniciar servidor en modo desarrollo (local)
npm run dev

# 7. Bajar base de datos
npm run dev:db:down

```

### Entorno de Producción

```bash
# 1. Clonar el repositorio
git clone git@github.com:melijauregui/IngSoftware2.git
cd IngSoft2

# 2. Instalar dependencias (si no fueron ya instaladas)
npm install

# 3. Configurar variables de entorno de producción
cp .env_example .env
# Editar .env con las configuraciones de producción

# 4. Levantar servicios de producción
npm run prod:up

# 5. Verificar que los servicios estén corriendo
npm run prod:status

# 6. Bajar servicios de producción
npm run prod:down
```

### Entorno de Testing

```bash
# Configurar variables de entorno
cp .env.test_example .env.test
# Editar .env con las configuraciones de test (ENVIRONMENT=test)

# Levantar BD de testing
npm run test:db:up

# Verificar estado de la BD
npm run test:db:status

# Ejecutar tests de integración
npm run test:integration

# Ejecutar tests con mocks
npm run test:mocked

# Ejecutar tests específicos
npm run test:integration:playlists
npm run test:integration:songs
npm run test:integration:file filename

npm run test:mocked:playlists
npm run test:mocked:songs
npm run test:mocked:file filename

# Bajar BD de testing
npm run test:db:down
```

## Base de Datos

### Configuración con Prisma

El proyecto utiliza **Prisma ORM** con **PostgreSQL** como base de datos:

- **Prisma Schema**: `prisma/schema.prisma` - Define los modelos de datos
- **Migraciones**: Manejo automático de esquemas de base de datos

**Optimizado para Docker**: Los archivos de Prisma se generan automáticamente dentro del contenedor Docker para Linux, por lo que funcionan en cualquier sistema operativo.
**Para desarrollo local** (si ejecutas `npm run dev` en tu máquina), regenera el cliente:

```bash
npm run db:generate
```

## Docker

**Comandos**

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

**Endpoints implementados**:

- `POST /playlists/{id}/publish` - Publica una playlist (idempotente)
- `GET /playlists?published=true&sort=desc` - Lista solo playlists publicadas (por defecto)
- `GET /playlists?published=false&sort=desc` - Lista todas las playlists (publicadas y no publicadas)

**Parámetros de consulta para GET /playlists**:

- `published`: `"true"` | `"false"` (por defecto: `"true"`)
  - `published=true`: Solo playlists publicadas
  - `published=false`: Todas las playlists (publicadas y no publicadas)
- `sort`: `"asc"` | `"desc"` (por defecto: `"desc"`)
  - `sort=desc`: Ordena por `publishedAt` descendente (más recientes primero)
  - `sort=asc`: Ordena por `publishedAt` ascendente (más antiguas primero)
  - Las playlists no publicadas siempre aparecen al final

**Ejemplos de uso**:

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

## Estructura del Proyecto

```
IngSoft2/
├── server/                # Código fuente de la aplicación
│   ├── app.ts             # Configuración principal de Hono
│   ├── db.ts              # Configuración de base de datos con Prisma
│   ├── generated/         # Cliente de Prisma generado automáticamente
│   ├── playlists/         # Endpoints de playlists
│   ├── playlists-id/      # Endpoints de playlists-id
│   ├── playlists-id-songs/ # Endpoints de playlists-id-songs
│   ├── playslists-id-publish/ # Endpoints de publicación de playlists
│   ├── songs/             # Endpoints de songs
│   └── songs-id/          # Endpoints de songs-id
├── prisma/                # Configuración de Prisma ORM
│   └── schema.prisma      # Esquema de base de datos
├── tests-mocked/          # Tests unitarios con mocks
│   ├── README.md          # Documentación de tests mocked
│   └── *.ts               # Archivos de tests
├── tests-integracion/     # Tests de integración con BD real
│   ├── README.md          # Documentación de tests de integración
│   └── *.ts               # Archivos de tests
├── scripts/               # Scripts de utilidad
├── schemas/               # Esquemas de validación Zod
├── database/              # Scripts de inicialización de BD
├── docker-compose.yml     # Configuración de Docker para desarrollo/producción
├── docker-compose.test.yml # Configuración de Docker para testing
└── Dockerfile             # Imagen de Docker para la aplicación
```

## 📅 Fecha de Entrega

**Fecha máxima de entrega**: 28-08-2025
