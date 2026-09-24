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
        <p class="border-2 border-red-500 bg-red-950/60 text-red-300 text-sm px-3 py-2 rounded">
          {error}
        </p>
      )}

      <div class="flex flex-col gap-1">
        <label class="text-[#ffcc00] text-xs uppercase tracking-wider" for="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autofocus
          value={username ?? ""}
          placeholder="your_username"
          class="bg-black border-2 border-[#ffcc00]/50 text-white rounded px-3 py-2 outline-none focus:border-[#ffcc00] placeholder:text-gray-600 transition-colors"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-[#ffcc00] text-xs uppercase tracking-wider" for="password">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            name="password"
            required
            placeholder="••••••••"
            x-bind:type="showPassword ? 'text' : 'password'"
            class="bg-black border-2 border-[#ffcc00]/50 text-white rounded px-3 py-2 w-full outline-none focus:border-[#ffcc00] placeholder:text-gray-600 transition-colors"
          />
          <button
            type="button"
            x-on:click="showPassword = !showPassword"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-[#ffcc00]/70 text-xs font-bold uppercase hover:text-[#ffcc00]"
          >
            <span x-text="showPassword ? 'Hide' : 'Show'"></span>
          </button>
        </div>
      </div>

      <button
        type="submit"
        class="mt-2 rounded-lg border-2 border-[#ffcc00] bg-[#ff4500] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#ffcc00] hover:text-black flex items-center justify-center gap-2"
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
        <title>Log in — Evolvoea</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        <script
          defer
          src="https://unpkg.com/alpinejs@3.14.1/dist/cdn.min.js"
        ></script>
        <style>{`
          .pixel-font { font-family: 'Press Start 2P', monospace; }
          .htmx-indicator { opacity: 0; }
          .htmx-request .htmx-indicator, .htmx-request.htmx-indicator { opacity: 1; }
          [x-cloak] { display: none !important; }
        `}</style>
      </head>
      <body class="bg-black min-h-screen flex items-center justify-center text-white">
        <div class="w-full max-w-sm border-2 border-[#ffcc00] bg-black/80 rounded-lg p-8 shadow-[0_0_25px_rgba(255,204,0,0.15)]">
          <h1 class="pixel-font text-[#ffcc00] text-lg text-center mb-2 tracking-widest">
            EVOLVOEA
          </h1>
          <p class="text-center text-gray-400 text-sm mb-6">Log in to continue</p>

          <LoginForm error={error} username={username} />

          <p class="text-gray-400 text-sm mt-6 text-center">
            No account?{" "}
            <a href="/signup" class="text-[#ffcc00] hover:underline font-semibold">
              Sign up
            </a>
          </p>

          <div class="mt-4 text-center">
            <a href="/" class="text-xs text-gray-500 hover:text-[#ffcc00] transition-colors">
              ← Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
