import { OpenAPIHono } from '@hono/zod-openapi';
import songsApp from './songs/routes';
import { Context } from 'hono';
import { ZodError } from 'zod';
import logger from './logger';
import songsIdApp from './songs-id/routes';
import playlistsApp from './playlists/routes';
import playlistsIdApp from './playlists-id/routes';
import playlistsIdSongsApp from './playlists-id-songs/routes';
import playlistsIdPublishApp from './playslists-id-publish/routes';
import { NotFoundError } from '../schemas/error';
import { Prisma } from './generated/prisma';

const app = new OpenAPIHono();

// Mount songs routes
app.route('/songs/:id', songsIdApp);
app.route('/songs', songsApp);
app.route('/playlists/:id/publish', playlistsIdPublishApp);
app.route('/playlists/:id/songs', playlistsIdSongsApp);
app.route('/playlists/:id', playlistsIdApp);
app.route('/playlists', playlistsApp);
export default app;

export function handlerError(err: Error, c: Context) {
  // Handle JSON parsing errors as validation errors
  if (err.constructor.name === 'HTTPException') {
    const errorResponse = {
      type: 'about:blank',
      title: 'Validation Error',
      status: 400,
      detail: err.message,
      instance: c.req.path,
    };

    logger.warn(`JSON parsing error on ${c.req.path}: ${err.message}`);
    return c.json(errorResponse, 400);
  }

  if (err instanceof ZodError) {
    const errorResponse = {
      type: 'about:blank',
      title: 'Validation Error',
      status: 400,
      detail: err.errors
        .map(e =>
          e.path.length > 0 ? `${e.path.join('.')}: ${e.message}` : e.message
        )
        .join(', '),
      instance: c.req.path,
    };

    logger.warn(`Validation error on ${c.req.path}: ${errorResponse.detail}`);
    return c.json(errorResponse, 400);
  }

  // Handle 404 Not Found errors
  if (err instanceof NotFoundError) {
    const errorResponse = {
      type: err.type,
      title: err.title,
      status: err.status,
      detail: err.message,
      instance: err.instance,
    };

    logger.warn(`Not found error on ${c.req.path}: ${err.message}`);
    return c.json(errorResponse, 404);
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle 409 Duplicate Song errors (unique constraint violation)
    if (err.code === 'P2002') {
      const errorResponse = handlePrismaDuplicateError(err, c.req.path);
      logger.warn(`Prisma duplicate error on ${c.req.path}: ${err.message}`);
      return c.json(errorResponse, 409);
    }

    // Handle 404 Not Found errors (foreign key constraint violation)
    if (err.code === 'P2003') {
      const errorResponse = handlePrismaNotFoundError2(
        err,
        c.req.path,
        err.meta?.constraint as string
      );
      logger.warn(`Prisma foreign key error on ${c.req.path}: ${err.message}`);
      return c.json(errorResponse, 404);
    }

    // P2025: Record to delete does not exist
    if (err.code === 'P2025') {
      const errorResponse = handlePrismaNotFoundError(err, c.req.path);
      logger.warn(
        `Prisma record not found error on ${c.req.path}: ${err.message}`
      );
      return c.json(errorResponse, 404);
    }

    // Handle other Prisma errors
    const errorResponse = {
      type: 'about:blank',
      title: 'Database Error',
      status: 500,
      detail: err.message,
      instance: c.req.path,
    };

    logger.error(`Prisma error on ${c.req.path}: ${err.message}`);
    return c.json(errorResponse, 500);
  }

  // Handle other errors
  const errorResponse = {
    type: 'about:blank',
    title: 'Internal Server Error',
    status: 500,
    detail: err.message || 'An unexpected error occurred',
    instance: c.req.path,
  };

  logger.error(`Internal server error on ${c.req.path}: ${err.message}`);
  return c.json(errorResponse, 500);
}

// Function to handle Prisma not found errors and determine resource type
function handlePrismaNotFoundError(err: any, path: string) {
  const pathParts = path.split('/');
  const id = pathParts[pathParts.length - 1];

  // Determine if it's a playlist or song based on path
  let resourceType = 'Resource';
  if (path.includes('/playlists/')) {
    resourceType = 'Playlist';
  } else if (path.includes('/songs/')) {
    resourceType = 'Song';
  }

  return {
    type: 'about:blank',
    title: `${resourceType} Not Found`,
    status: 404,
    detail: `The ${resourceType} with ID ${id} was not found`,
    instance: path,
  };
}

// Function to handle Prisma not found errors and determine resource type
function handlePrismaNotFoundError2(err: any, path: string, meta: string) {
  const pathParts = path.split('/');
  const id = pathParts[pathParts.length - 2];

  // Determine if it's a playlist or song based on path
  let resourceType = 'Resource';
  if (meta === 'PlaylistsSongs_songId_fkey') {
    resourceType = 'Song';
  } else if (meta === 'PlaylistsSongs_playlistId_fkey') {
    resourceType = 'Playlist';
  }

  return {
    type: 'about:blank',
    title: `${resourceType} Not Found`,
    status: 404,
    detail: `The ${resourceType} was not found`,
    instance: path,
  };
}

function handlePrismaDuplicateError(err: any, path: string) {
  return {
    type: 'about:blank',
    title: 'Duplicate Error',
    status: 409,
    detail: `The song is already in the playlist`,
    instance: path,
  };
}
