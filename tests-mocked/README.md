# Tests Unitarios con Mocks

Este directorio contiene los tests unitarios que utilizan mocks para simular errores internos y problemas de base de datos, permitiendo probar el comportamiento de la aplicación en escenarios de fallo controlados.

## Propósito

Los tests en esta carpeta están diseñados para:

- **Simular errores de base de datos** (timeouts, conexiones fallidas, queries fallidas)
- **Probar manejo de errores internos** (validaciones, procesamiento de datos)
- **Verificar respuestas de error** sin necesidad de una BD real
- **Aislamiento completo** de dependencias externas

## Diferencias con Tests de Integración

| Aspecto | Tests Mocked | Tests de Integración |
|---------|-------------|---------------------|
| **Base de Datos** | Mockeada | Real (MySQL) |
| **Velocidad** | Muy rápida | Más lenta |
| **Escenarios** | Errores controlados | Flujo completo |
| **Dependencias** | Aisladas | Reales |
| **Propósito** | Validar lógica de error | Validar integración |

## Estructura de los Tests

### Archivos de Test Disponibles

#### Tests de Playlists
- `playlists-get-test.ts` - Tests para GET /playlists con mocks (incluye filtros `published` y `sort`)
- `playlists-post-test.ts` - Tests para POST /playlists con mocks
- `playlists-id-get-test.ts` - Tests para GET /playlists/:id con mocks
- `playlists-id-delete-test.ts` - Tests para DELETE /playlists/:id con mocks
- `playlists-id-songs-post-test.ts` - Tests para POST /playlists/:id/songs con mocks
- `playlists-id-publish-test.ts` - Tests para POST /playlists/:id/publish con mocks

#### Tests de Songs
- `songs-get-test.ts` - Tests para GET /songs con mocks
- `songs-post-test.ts` - Tests para POST /songs con mocks
- `songs-id-get-test.ts` - Tests para GET /songs/:id con mocks
- `songs-id-put-test.ts` - Tests para PUT /songs/:id con mocks
- `songs-id-delete-test.ts` - Tests para DELETE /songs/:id con mocks

#### Archivos de Soporte
- `setup.ts` - Configuración de mocks y setup de tests

## Ejecutar Tests

### Todos los Tests Unitarios
```bash
npm run test:mocked
```

### Tests Específicos

Puedes ejecutar tests individuales o por categoría:

```bash
# Test específico de un archivo (sin extensión .ts)
npm run test:mocked:file playlists-get-test

# Ejecutar todos los tests de playlists con mocks
npm run test:mocked:playlists

# Ejecutar todos los tests de songs con mocks
npm run test:mocked:songs

# Ejecutar tests individuales de playlists
npm run test:mocked:file playlists-get-test
npm run test:mocked:file playlists-post-test
npm run test:mocked:file playlists-id-get-test
npm run test:mocked:file playlists-id-delete-test
npm run test:mocked:file playlists-id-songs-post-test

# Ejecutar tests individuales de songs
npm run test:mocked:file songs-get-test
npm run test:mocked:file songs-post-test
npm run test:mocked:file songs-id-get-test
npm run test:mocked:file songs-id-put-test
npm run test:mocked:file songs-id-delete-test

# Modo watch (desarrollo)
npx vitest tests-mocked/ --watch
```


## Cómo Funcionan los Mocks

Los mocks en Vitest son herramientas que permiten **interceptar y reemplazar** el comportamiento de funciones, métodos y módulos durante la ejecución de tests.

### Concepto Básico

Los mocks funcionan como **interceptores inteligentes** que se colocan el código y las dependencias externas. Cuando uso `vi.spyOn(db, "query").mockImplementation(mockQuery)`, estoy creando un "espía" que intercepta todas las llamadas al método `query` de mi base de datos. En lugar de ejecutar la consulta real a la base de datos, el mock ejecuta la función personalizada `mockQuery`. Esto significa que cada vez que mi código llame `db.query()`, en lugar de conectarse a MySQL y ejecutar la consulta SQL, se ejecutará mi función mock que puede retornar datos de prueba, simular errores, o cualquier comportamiento que necesite para mi test.

**Referencia**: [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)

### Tipos de Mocks Utilizados

#### 1. **Spy (Espía)**
```typescript
// Solo observa las llamadas sin cambiar el comportamiento
const spy = vi.spyOn(db, 'query');
// db.query() sigue funcionando normalmente, pero podemos verificar si fue llamado
```

#### 2. **Mock Implementation (Implementación Mock)**
```typescript
// Reemplaza completamente la función
vi.spyOn(db, 'query').mockImplementation(() => {
  return Promise.resolve([{ id: 1, name: 'Mocked Playlist' }]);
});
```

#### 3. **Mock Return Value (Valor de Retorno Mock)**
```typescript
// Simplemente retorna un valor específico
vi.spyOn(db, 'query').mockResolvedValue([{ id: 1, name: 'Mocked Playlist' }]);
vi.spyOn(db, 'query').mockRejectedValue(new Error('Database error'));
```
## Casos de Prueba Cubiertos

### Casos de Error de Base de Datos
- ❌ Conexión fallida
- ❌ Base de datos no disponible
- ❌ Datos corruptos retornados

### Casos de Error de Validación
- ❌ Datos faltantes requeridos
- ❌ Tipos de datos incorrectos

## Parámetros de Ordenamiento (GET /playlists)

Los tests mocked para `GET /playlists` verifican el comportamiento de los parámetros de consulta:

### Parámetro `published`
- **Valores válidos**: `"true"` | `"false"`
- **Valores inválidos**: Cualquier otro string
- **Comportamiento mockeado**: Simula filtrado de playlists por estado de publicación

### Parámetro `sort`
- **Valores válidos**: `"asc"` | `"desc"`
- **Valores inválidos**: Cualquier otro string
- **Comportamiento mockeado**: Simula ordenamiento por `publishedAt`
- **Playlists no publicadas**: Siempre aparecen al final en los mocks

### Casos de Error Verificados
- ❌ Parámetro `published` con valor inválido (400)
- ❌ Parámetro `sort` con valor inválido (400)
- ❌ Combinaciones de parámetros inválidos

