import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";

import { getSession } from "../lib/auth";
import type { User } from "../db";

function isHtmx(c: any): boolean {
  return c.req.header("HX-Request") === "true";
}

function redirectToLogin(c: any) {
  if (isHtmx(c)) {
    c.header("HX-Redirect", "/login");
    return c.body(null, 200);
  }

  return c.redirect("/login");
}

export const requireAuth = createMiddleware<{
  Variables: {
    user: User;
  };
}>(async (c, next) => {
  const sessionId = getCookie(c, "session_id");

  const user = sessionId ? getSession(sessionId) : null;

  if (!user) {
    return redirectToLogin(c);
  }

  c.set("user", user);

  await next();
});

export const optionalAuth = createMiddleware<{
  Variables: {
    user: User | null;
  };
}>(async (c, next) => {
  const sessionId = getCookie(c, "session_id");

  const user = sessionId ? getSession(sessionId) : null;

  c.set("user", user);

  await next();
});