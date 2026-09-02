// The reusable form fragment — this is what HTMX swaps back in on error,
// so it needs to stand alone (no <html>/<head>).
export function LoginForm({
  error,
  username,
}: {
  error?: string;
  username?: string;
}) {
  return (
    <form
      id="login-form"
      method="post"
      action="/login"
      hx-post="/login"
      hx-target="#login-form"
      hx-swap="outerHTML"
      hx-indicator="#login-spinner"
      class="flex flex-col gap-4"
      x-data="{ showPassword: false }"
    >
      {error && (
        <p class="text-red-400 bg-red-950/40 border border-red-800 rounded px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <div class="flex flex-col gap-1">
        <label class="text-slate-300 text-sm" for="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autofocus
          value={username ?? ""}
          class="bg-slate-700 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-slate-300 text-sm" for="password">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            name="password"
            required
            x-bind:type="showPassword ? 'text' : 'password'"
            class="bg-slate-700 text-white rounded px-3 py-2 w-full outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            x-on:click="showPassword = !showPassword"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs hover:text-white"
          >
            <span x-text="showPassword ? 'Hide' : 'Show'"></span>
          </button>
        </div>
      </div>

      <button
        type="submit"
        class="bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-semibold rounded px-3 py-2 mt-2 flex items-center justify-center gap-2"
      >
        <span>Log in</span>
        <span
          id="login-spinner"
          class="htmx-indicator animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"
        ></span>
      </button>
    </form>
  );
}

// The full page — used for the initial GET /login load.
export function LoginPage({
  error,
  username,
}: {
  error?: string;
  username?: string;
}) {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Log in</title>
        <link rel="stylesheet" href="/style.css" />
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        <script
          defer
          src="https://unpkg.com/alpinejs@3.14.1/dist/cdn.min.js"
        ></script>
        <style>{`
          .htmx-indicator { opacity: 0; }
          .htmx-request .htmx-indicator, .htmx-request.htmx-indicator { opacity: 1; }
          [x-cloak] { display: none !important; }
        `}</style>
      </head>
      <body class="bg-slate-900 min-h-screen flex items-center justify-center">
        <div class="bg-slate-800 p-8 rounded-lg w-full max-w-sm shadow-lg">
          <h1 class="text-2xl font-bold text-white mb-6">Log in</h1>
          <LoginForm error={error} username={username} />
          <p class="text-slate-400 text-sm mt-4 text-center">
            No account?{" "}
            <a href="/signup" class="text-emerald-400 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
