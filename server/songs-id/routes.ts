import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  AllSongsResponseSchema,
  CreateSongRequestSchema,
  CreateSongResponseSchema,
} from "../../schemas/songs";
import { ErrorResponseSchema } from "../../schemas/error";
import { getSongById } from "./functions";
import { Context } from "hono";
import { handlerError } from "../app";
import logger from "../logger";
import { SongIdSchema } from "../../schemas/songs-id";

const songsIdApp = new OpenAPIHono({
  defaultHook: (result, c) => {
    //https://github.com/honojs/middleware/tree/main/packages/zod-openapi
    if (!result.success) {
      throw result.error; // deja que onError formatee el JSON
    }
  },
});

// Middleware to handle validation errors
songsIdApp.onError((err: Error, c: Context) => {
  //https://hono.dev/docs/api/hono#error-handling
  return handlerError(err, c);
});

export default songsIdApp;

// get:
// summary: Retrieve a song by ID
// parameters:
//   - in: path
//     name: id
//     required: true
//     schema:
//       type: integer
// responses:
//   '200':
//     description: Song retrieved successfully
//     content:
//       application/json:
//         schema:
//           type: object
//           properties:
//             data:
//               $ref: '#/components/schemas/Song'
//   '404':
//     description: Song not found
//     content:
//       application/json:
//         schema:
//           $ref: '#/components/schemas/ErrorResponse'

// get song by id endpoint
const getSongByIdRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    required: true,
    params: SongIdSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CreateSongResponseSchema,
        },
      },
      description: "Song retrieved successfully",
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
      description: "Song not found",
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

songsIdApp.openapi(getSongByIdRoute, async (c) => {
  logger.http(`GET /songs/:id - Getting song by id`);
  const { id } = c.req.valid("param");
  const response = await getSongById(id);
  return c.json({ data: response }, 200);
});
