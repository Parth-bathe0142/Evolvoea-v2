import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import pages from "./views";
import { authRoutes } from "./routes/auth";

const app = new Hono();

app.use("/static/*", serveStatic({ root: './' }))

app.route("/", pages)
app.route("/", authRoutes);

export default app;