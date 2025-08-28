import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../../schemas/error";
import { createPlaylist, getPlaylists } from "./functions";
import { Context } from "hono";
import { handlerError } from "../app";
import logger from "../logger";
import {
  CreatePlaylistRequestSchema,
  PlaylistResponseArraySchema,
  PlaylistResponseSchema,
  GetPlaylistsQuerySchema,
} from "../../schemas/playlists";
import { PlaylistIdSchema } from "../../schemas/playlists-id";

const playlistsApp = new OpenAPIHono({
  defaultHook: (result, c) => {
    //https://github.com/honojs/middleware/tree/main/packages/zod-openapi
    if (!result.success) {
      throw result.error; // deja que onError formatee el JSON
    }
  },
});

// Middleware to handle validation errors
playlistsApp.onError((err: Error, c: Context) => {
  //https://hono.dev/docs/api/hono#error-handling
  return handlerError(err, c);
});

export default playlistsApp;

// post:
// summary: Create a new playlist
// requestBody:
//   required: true
//   content:
//     application/json:
//       schema:
//         $ref: '#/components/schemas/CreatePlaylistRequest'
// responses:
//   '201':
//     description: Playlist created successfully
//     content:
//       application/json:
//         schema:
//           type: object
//           properties:
//             data:
//               $ref: '#/components/schemas/Playlist'
//   '400':
//     description: Bad request error
//     content:
//       application/json:
//         schema:
//           $ref: '#/components/schemas/ErrorResponse'

// post playlist endpoint
const postPlaylistRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    required: true,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: CreatePlaylistRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: PlaylistResponseSchema,
        },
      },
      description: "Playlist created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Bad request error",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

playlistsApp.openapi(postPlaylistRoute, async (c) => {
  logger.http(`POST /playlists - Creating a new playlist`);
  const { name, description } = c.req.valid("json");
  const response = await createPlaylist(name, description);
  return c.json({ data: response }, 201);
});

// get:
// summary: Retrieve playlists (filter by published)
// description: By default returns only published playlists ordered by publishedAt desc.
// parameters:
//   - in: query
//     name: published
//     required: false
//     schema:
//       type: boolean
//       default: true
//     description: If true (default), only published playlists are returned. If false, returns all playlists.
//   - in: query
//     name: sort
//     required: false
//     schema:
//       type: string
//       default: -publishedAt
//     description: Sort expression (e.g., -publishedAt).
// responses:
//   '200':
//     description: A list of published playlists ordered by publishedAt desc (songs ordered by addedAt desc)
//     content:
//       application/json:
//         schema:
//           type: object
//           properties:
//             data:
//               type: array
//               items:
//                 $ref: '#/components/schemas/Playlist'
const getPlaylistsRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    query: GetPlaylistsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PlaylistResponseArraySchema,
        },
      },
      description:
        "A list of published playlists ordered by publishedAt desc (songs ordered by addedAt desc)",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

playlistsApp.openapi(getPlaylistsRoute, async (c) => {
  logger.http(`GET /playlists - Retrieving playlists`);
  const query = c.req.valid("query");
  const published = query.published === "false" ? false : true; // Default to true if not specified
  const sort = query.sort ?? "desc";

  const res = await getPlaylists(published, sort);
  return c.json({ data: res }, 200);
});
