import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../../schemas/error";
import { Context } from "hono";
import { handlerError } from "../app";
import logger from "../logger";
import { PlaylistResponseSchema } from "../../schemas/playlists";
import { PlaylistIdSchema } from "../../schemas/playlists-id";
import { publishPlaylist } from "./functions";

const playlistsIdPublishApp = new OpenAPIHono({
  defaultHook: (result, c) => {
    //https://github.com/honojs/middleware/tree/main/packages/zod-openapi
    if (!result.success) {
      throw result.error; // deja que onError formatee el JSON
    }
  },
});

// Middleware to handle validation errors
playlistsIdPublishApp.onError((err: Error, c: Context) => {
  //https://hono.dev/docs/api/hono#error-handling
  return handlerError(err, c);
});

export default playlistsIdPublishApp;

// playlists/{id}/publish:
// post:
//   summary: Publish a playlist (idempotent)
//   description: Sets isPublished=true and publishedAt=now() if not already published.
//   parameters:
//     - in: path
//       name: id
//       required: true
//       schema:
//         type: integer
//   responses:
//     '200':
//       description: Playlist published
//       content:
//         application/json:
//           schema:
//             type: object
//             properties:
//               data:
//                 $ref: '#/components/schemas/Playlist'
//     '404':
//       description: Playlist not found
//       content:
//         application/json:
//           schema:
//             $ref: '#/components/schemas/ErrorResponse'
const publishPlaylistRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    params: PlaylistIdSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PlaylistResponseSchema,
        },
      },
      description: "Playlist published",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Playlist not found",
    },
  },
});

playlistsIdPublishApp.openapi(publishPlaylistRoute, async (c) => {
  logger.http(`POST /playlists/:id/publish - Publishing playlist`);
  const { id } = c.req.valid("param");
  const res = await publishPlaylist(id);
  return c.json({ data: res }, 200);
});
