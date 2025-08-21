import { OpenAPIHono } from "@hono/zod-openapi";
import songsApp from "./songs/routes";

const app = new OpenAPIHono();

// Mount songs routes
app.route("/songs", songsApp);

export default app;
