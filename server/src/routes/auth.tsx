import { Hono } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import {
  hashPassword,
  verifyPassword,
  createUser,
  findUserByUsername,
  findUserByEmail,
  createSession,
  deleteSession,
} from "../lib/auth";
import { LoginPage, LoginForm } from "../views/components/LoginPage";
import { SignupPage, SignupForm } from "../views/components/SignupPage";

export const authRoutes = new Hono();

const isProd = process.env.NODE_ENV === "production";

function setSessionCookie(c: any, sessionId: string, expiresAt: Date) {
  setCookie(c, "session_id", sessionId, {
    httpOnly: true,
    sameSite: "Lax",
    secure: isProd, 
    path: "/",
    expires: expiresAt,
  });
}

function isHtmx(c: any): boolean {
  return c.req.header("HX-Request") === "true";
}

// ------ Pages ------

authRoutes.get("/login", (c) => c.html(<LoginPage />));
authRoutes.get("/signup", (c) => c.html(<SignupPage />));

// ---------- Sign up ----------

authRoutes.post("/signup", async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");

  const fail = (error: string, status: 400 = 400) => {
    if (isHtmx(c)) {
      return c.html(
        <SignupForm error={error} username={username} email={email} />,
        status
      );
    }
    return c.html(
      <SignupPage error={error} username={username} email={email} />,
      status
    );
  };

  if (!username || !email || !password) {
    return fail("All fields are required.");
  }
  if (password.length < 8) {
    return fail("Password must be at least 8 characters.");
  }
  if (findUserByUsername(username)) {
    return fail("That username is taken.");
  }
  if (findUserByEmail(email)) {
    return fail("An account with that email already exists.");
  }

  const passwordHash = await hashPassword(password);
  const user = createUser(username, email, passwordHash);
  const session = createSession(user.id);
  setSessionCookie(c, session.id, session.expiresAt);

  if (isHtmx(c)) {
    c.header("HX-Redirect", "/");
    return c.body(null, 200);
  }
  return c.redirect("/");
});

// ---------- Log in ----------

authRoutes.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  const user = findUserByUsername(username);
  const valid = user
    ? await verifyPassword(password, user.password_hash)
    : false;

  if (!user || !valid) {
    // Same error either way — don't reveal whether the username exists
    const error = "Invalid username or password.";
    if (isHtmx(c)) {
      return c.html(<LoginForm error={error} username={username} />, 401);
    }
    return c.html(<LoginPage error={error} username={username} />, 401);
  }

  const session = createSession(user.id);
  setSessionCookie(c, session.id, session.expiresAt);

  if (isHtmx(c)) {
    c.header("HX-Redirect", "/");
    return c.body(null, 200);
  }
  return c.redirect("/");
});

// ---------- Log out ----------

authRoutes.post("/logout", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) deleteSession(sessionId);
  deleteCookie(c, "session_id", { path: "/" });

  if (isHtmx(c)) {
    c.header("HX-Redirect", "/login");
    return c.body(null, 200);
  }
  return c.redirect("/login");
});
