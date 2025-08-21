import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  CreateSongRequestSchema,
  CreateSongResponseSchema,
} from "../../schemas/songs";
import { ErrorResponseSchema } from "../../schemas/error";
import { createSong } from "./functions";

const songsApp = new OpenAPIHono();

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
  const { response, status } = await createSong(title, artist);
  return c.json(response, status);
});

export default songsApp;
