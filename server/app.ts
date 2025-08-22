import { OpenAPIHono } from "@hono/zod-openapi";
import songsApp from "./songs/routes";
import { Context } from "hono";
import { ZodError } from "zod";
import logger from "./logger";
import { NotFoundError } from "../schemas/error";
import songsIdApp from "./songs-id/routes";

const app = new OpenAPIHono();

// Mount songs routes
app.route("/songs/:id", songsIdApp);
app.route("/songs", songsApp);

export default app;

export function handlerError(err: Error, c: Context) {
  if (err instanceof ZodError) {
    const errorResponse = {
      type: "about:blank",
      title: "Validation Error",
      status: 400,
      detail: err.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", "),
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

  // Handle database errors
  if (err instanceof Error && err.message && err.message.includes("ER_")) {
    const errorResponse = {
      type: "about:blank",
      title: "Database Error",
      status: 500,
      detail:
        err.message ||
        "A database error occurred while processing your request",
      instance: c.req.path,
    };

    logger.error(`Database error on ${c.req.path}: ${err.message}`);
    return c.json(errorResponse, 500);
  }

  // Handle other errors
  const errorResponse = {
    type: "about:blank",
    title: "Internal Server Error",
    status: 500,
    detail: err.message || "An unexpected error occurred",
    instance: c.req.path,
  };

  logger.error(`Internal server error on ${c.req.path}: ${err.message}`);
  return c.json(errorResponse, 500);
}
