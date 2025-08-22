import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  AllSongsResponseSchema,
  SongRequestSchema,
  SongResponseSchema,
} from "../../schemas/songs";
import { ErrorResponseSchema } from "../../schemas/error";
import { createSong, getAllSongs } from "./functions";
import { Context } from "hono";
import { handlerError } from "../app";
import logger from "../logger";

const songsApp = new OpenAPIHono({
  defaultHook: (result, c) => {
    //https://github.com/honojs/middleware/tree/main/packages/zod-openapi
    if (!result.success) {
      throw result.error; // deja que onError formatee el JSON
    }
  },
});

// Middleware to handle validation errors
songsApp.onError((err: Error, c: Context) => {
  //https://hono.dev/docs/api/hono#error-handling
  return handlerError(err, c);
});

export default songsApp;

// post:
// summary: Create a new song
// requestBody:
//   required: true
//   content:
//     application/json:
//       schema:
//         $ref: '#/components/schemas/CreateSongRequest'
// responses:
//   '201':
//     description: Song created successfully
//     content:
//       application/json:
//         schema:
//           type: object
//           properties:
//             data:
//               $ref: '#/components/schemas/Song'
//   '400':
//     description: Bad request error
//     content:
//       application/json:
//         schema:
//           $ref: '#/components/schemas/ErrorResponse'

// post song endpoint
const createSongRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: SongRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: SongResponseSchema,
        },
      },
      description: "Song created successfully",
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

songsApp.openapi(createSongRoute, async (c) => {
  logger.http(`POST /songs - Creating new song`);
  const { title, artist } = c.req.valid("json");
  const response = await createSong(title, artist);
  return c.json(response, 201);
});

// get:
// summary: Retrieve all songs
// responses:
//   '200':
//     description: A list of songs
//     content:
//       application/json:
//         schema:
//           type: object
//           properties:
//             data:
//               type: array
//               items:
//                 $ref: '#/components/schemas/Song'

// get all songs endpoint
const getAllSongsRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AllSongsResponseSchema,
        },
      },
      description: "A list of songs",
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

songsApp.openapi(getAllSongsRoute, async (c) => {
  logger.http(`GET /songs - Getting all songs`);
  const response = await getAllSongs();
  return c.json({ data: response }, 200);
});
