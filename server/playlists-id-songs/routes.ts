import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../../schemas/error";
import { addSongToPlaylist } from "./functions";
import { Context } from "hono";
import { handlerError } from "../app";
import logger from "../logger";
import { PlaylistResponseSchema } from "../../schemas/playlists";
import { PlaylistIdSchema } from "../../schemas/playlists-id";
import { AddSongToPlaylistRequestSchema } from "../../schemas/playlists-id-songs";

const playlistsIdSongsApp = new OpenAPIHono({
  defaultHook: (result, c) => {
    //https://github.com/honojs/middleware/tree/main/packages/zod-openapi
    if (!result.success) {
      throw result.error; // deja que onError formatee el JSON
    }
  },
});

// Middleware to handle validation errors
playlistsIdSongsApp.onError((err: Error, c: Context) => {
  //https://hono.dev/docs/api/hono#error-handling
  return handlerError(err, c);
});

export default playlistsIdSongsApp;

// post:
//       summary: Add a song to a playlist
//       parameters:
//         - in: path
//           name: id
//           required: true
//           schema:
//             type: integer
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema:
//               $ref: '#/components/schemas/AddSongToPlaylistRequest'
//       responses:
//         '200':
//           description: Song added to playlist successfully
//           content:
//             application/json:
//               schema:
//                 type: object
//                 properties:
//                   data:
//                     $ref: '#/components/schemas/Playlist'
//         '400':
//           description: Bad request error
//           content:
//             application/json:
//               schema:
//                 $ref: '#/components/schemas/ErrorResponse'
//         '404':
//           description: Playlist or song not found
//           content:
//             application/json:
//               schema:
//                 $ref: '#/components/schemas/ErrorResponse'

const addSongToPlaylistRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    required: true,
    params: PlaylistIdSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: AddSongToPlaylistRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PlaylistResponseSchema,
        },
      },
      description: "Song added to playlist successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Bad request error",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Playlist or song not found",
    },
    409: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Song already exists in playlist",
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

playlistsIdSongsApp.openapi(addSongToPlaylistRoute, async (c) => {
  logger.http(`POST /playlists/{id}/songs - Adding a song to a playlist`);
  const { id } = c.req.valid("param");
  const { songId } = c.req.valid("json");
  const response = await addSongToPlaylist(id, songId);
  return c.json({ data: response }, 200);
});
