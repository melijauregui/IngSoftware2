import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  CreateSongRequestSchema,
  CreateSongResponseSchema,
} from "../../schemas/songs";
import { ErrorResponseSchema } from "../../schemas/error";
import { createSong } from "./functions";
import { Context } from "hono";
import { handlerError } from "../app";

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

// Create song endpoint
const createSongRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: CreateSongRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CreateSongResponseSchema,
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
  const { title, artist } = c.req.valid("json");
  const response = await createSong(title, artist);
  return c.json(response, 201);
});

export default songsApp;
