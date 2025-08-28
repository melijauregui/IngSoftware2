import { serve } from "@hono/node-server";
import app from "./app";
import logger from "./logger";

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT),
  hostname: process.env.HOSTNAME,
});

logger.info(
  `Server running on http://${process.env.HOSTNAME}:${process.env.PORT}`
);
