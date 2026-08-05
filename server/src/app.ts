import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import pages from "./views";

const app = new Hono();

app.use("/static/*", serveStatic({ root: './' }))

app.route("/", pages)

export default app;