import "../config";
import { serve } from "@hono/node-server";
import app from "./app";
import logger from "./logger";
import { config } from "../config";

serve({
  fetch: app.fetch,
  port: Number(config.PORT),
  hostname: config.HOSTNAME,
});

logger.info(`Server running on http://${config.HOSTNAME}:${config.PORT}`);
