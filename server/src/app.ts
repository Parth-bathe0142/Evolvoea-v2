import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import pages from "./views";
import { authRoutes } from "./routes/auth";
import { mapEditorRoutes } from "./routes/mapEditor";



const app = new Hono();

app.use("/static/*", serveStatic({ root: './' }))

app.route("/", pages)
app.route("/", authRoutes);
app.route("/", mapEditorRoutes);


export default app;