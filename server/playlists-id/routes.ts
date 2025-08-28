import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { ErrorResponseSchema } from '../../schemas/error';
import { deletePlaylist, getPlaylistById } from './functions';
import { Context } from 'hono';
import { handlerError } from '../app';
import logger from '../logger';
import { PlaylistResponseSchema } from '../../schemas/playlists';
import { PlaylistIdSchema } from '../../schemas/playlists-id';

const playlistsIdApp = new OpenAPIHono({
  defaultHook: (result, c) => {
    //https://github.com/honojs/middleware/tree/main/packages/zod-openapi
    if (!result.success) {
      throw result.error; // deja que onError formatee el JSON
    }
  },
});

// Middleware to handle validation errors
playlistsIdApp.onError((err: Error, c: Context) => {
  //https://hono.dev/docs/api/hono#error-handling
  return handlerError(err, c);
});

export default playlistsIdApp;

// get:
// summary: Retrieve a playlist by ID
// parameters:
//   - in: path
//     name: id
//     required: true
//     schema:
//       type: integer
// responses:
//   '200':
//     description: Playlist retrieved successfully (songs ordered by addedAt desc)
//     content:
//       application/json:
//         schema:
//           type: object
//           properties:
//             data:
//               $ref: '#/components/schemas/Playlist'
//   '404':
//     description: Playlist not found
//     content:
//       application/json:
//         schema:
//           $ref: '#/components/schemas/ErrorResponse'

// post playlist endpoint
const getPlaylistByIdRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    required: true,
    params: PlaylistIdSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PlaylistResponseSchema,
        },
      },
      description: 'Playlist retrieved successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Bad request error',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Playlist not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

playlistsIdApp.openapi(getPlaylistByIdRoute, async c => {
  logger.http(`GET /playlists/{id} - Retrieving a playlist by ID`);
  const { id } = c.req.valid('param');
  const response = await getPlaylistById(id);
  return c.json({ data: response }, 200);
});

// delete:
// summary: Delete a playlist by ID
// parameters:
//   - in: path
//     name: id
//     required: true
//     schema:
//       type: integer
// responses:
//   '204':
//     description: Playlist deleted successfully
//   '404':
//     description: Playlist not found
//     content:
//       application/json:
//         schema:
//           $ref: '#/components/schemas/ErrorResponse'
const deletePlaylistByIdRoute = createRoute({
  method: 'delete',
  path: '/',
  request: {
    required: true,
    params: PlaylistIdSchema,
  },
  responses: {
    204: {
      description: 'Playlist deleted successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Playlist not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

playlistsIdApp.openapi(deletePlaylistByIdRoute, async c => {
  logger.http(`DELETE /playlists/{id} - Deleting a playlist by ID`);
  const { id } = c.req.valid('param');
  await deletePlaylist(id);
  return new Response(null, { status: 204 });
});
