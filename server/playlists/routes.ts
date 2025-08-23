import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../../schemas/error";
import { createPlaylist } from "./functions";
import { Context } from "hono";
import { handlerError } from "../app";
import logger from "../logger";
import {
  CreatePlaylistRequestSchema,
  PlaylistResponseSchema,
} from "../../schemas/playlists";

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
