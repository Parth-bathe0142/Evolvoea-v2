// server/src/views/components/LoginPage.tsx

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
      class="rpg-form"
      x-data="{ showPassword: false }"
    >
      {error && (
        <div class="form-error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div class="field">
        <label for="username">
          Username
        </label>

        <div class="input-wrapper">
          <span class="input-icon">♟</span>

          <input
            id="username"
            name="username"
            type="text"
            required
            autofocus
            autocomplete="username"
            placeholder="Enter your username"
            value={username ?? ""}
          />
        </div>
      </div>

      <div class="field">
        <label for="password">
          Password
        </label>

        <div class="input-wrapper">
          <span class="input-icon">◆</span>

          <input
            id="password"
            name="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
            x-bind:type="showPassword ? 'text' : 'password'"
          />

          <button
            type="button"
            class="show-password"
            x-on:click="showPassword = !showPassword"
          >
            <span x-text="showPassword ? 'Hide' : 'Show'"></span>
          </button>
        </div>
      </div>

      <button type="submit" class="rpg-button">
        <span class="button-slime">●</span>
        <span>Log In</span>

        <span
          id="login-spinner"
          class="htmx-indicator spinner"
        ></span>
      </button>
    </form>
  );
}

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

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Evolvoea — Login</title>

        <link
          rel="stylesheet"
          href="/static/style.css"
        />

        <script src="https://unpkg.com/htmx.org@2.0.4"></script>

        <script
          defer
          src="https://unpkg.com/alpinejs@3.14.1/dist/cdn.min.js"
        ></script>

        <style>{`
          .htmx-indicator {
            display: none;
          }

          .htmx-request .htmx-indicator,
          .htmx-request.htmx-indicator {
            display: inline-block;
          }

          [x-cloak] {
            display: none !important;
          }
        `}</style>
      </head>

      <body class="rpg-auth-page">

        {/* Decorative background elements */}
        <div class="forest-glow glow-one"></div>
        <div class="forest-glow glow-two"></div>

        <div class="pixel-particles">
          <span>✦</span>
          <span>•</span>
          <span>✦</span>
          <span>•</span>
          <span>✦</span>
        </div>

        <main class="auth-layout">

          {/* LEFT DECORATION */}
          <section class="auth-intro">

            <div class="character-stage">
  <div class="bunny-character" aria-label="Evolvoea bunny"></div>
</div>

            <h1 class="game-logo">
              EVOLVOEA
            </h1>

            <p class="game-tagline">
              EXPLORE · SURVIVE · EVOLVE
            </p>

            <div class="game-message">
              <span class="message-icon">♥</span>

              <div>
                <strong>A new adventure awaits.</strong>

                <p>
                  Enter Into Endless Adventure Of Evolvoea
                  <br />
                  Are you ready?
                </p>
              </div>
            </div>

          </section>


          {/* LOGIN CARD */}
          <section class="auth-card">

            <div class="card-corner corner-tl">❧</div>
            <div class="card-corner corner-tr">❧</div>
            <div class="card-corner corner-bl">❧</div>
            <div class="card-corner corner-br">❧</div>

            <div class="auth-card-header">

              <div class="mini-slime">
                ●
              </div>

              <h2>
                Welcome Back
              </h2>

              <p>
                Continue your journey in Evolvoea.
              </p>

            </div>

            <div class="divider">
              <span></span>
              <b>◆</b>
              <span></span>
            </div>

            <LoginForm
              error={error}
              username={username}
            />

            <div class="auth-switch">

              <span>
                Don't have an account?
              </span>

              <a href="/signup">
                Sign up
                <span class="leaf"> ❧</span>
              </a>

            </div>


          </section>

        </main>

        <div class="auth-footer">
          <span>EVOLVOEA</span>
        </div>

      </body>
    </html>
  );
}