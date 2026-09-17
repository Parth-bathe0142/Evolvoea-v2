// server/src/views/components/SignupPage.tsx

export function SignupForm({
  error,
  username,
  email,
}: {
  error?: string;
  username?: string;
  email?: string;
}) {
  return (
    <form
      id="signup-form"
      method="post"
      action="/signup"
      hx-post="/signup"
      hx-target="#signup-form"
      hx-swap="outerHTML"
      hx-indicator="#signup-spinner"
      class="rpg-form"
      x-data="{
        password: '',
        confirm: '',
        showPassword: false
      }"
    >
      {error && (
        <div class="form-error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div class="field">
        <label for="username">Username</label>

        <div class="input-wrapper">
          <span class="input-icon">♟</span>

          <input
            id="username"
            name="username"
            type="text"
            required
            autofocus
            autocomplete="username"
            placeholder="Choose a username"
            value={username ?? ""}
          />
        </div>
      </div>

      <div class="field">
        <label for="email">Email</label>

        <div class="input-wrapper">
          <span class="input-icon">@</span>

          <input
            id="email"
            name="email"
            type="email"
            required
            autocomplete="email"
            placeholder="your@email.com"
            value={email ?? ""}
          />
        </div>
      </div>

      <div class="field">
        <label for="password">Password</label>

        <div class="input-wrapper">
          <span class="input-icon">◆</span>

          <input
            id="password"
            name="password"
            required
            minlength={8}
            autocomplete="new-password"
            placeholder="Create a password"
            x-model="password"
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

        <span class="field-hint">
          At least 8 characters
        </span>
      </div>

      <div class="field">
        <label for="confirm">Confirm password</label>

        <div class="input-wrapper">
          <span class="input-icon">◆</span>

          <input
            id="confirm"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Repeat your password"
            x-model="confirm"
            x-bind:class="
              confirm && confirm !== password
                ? 'input-invalid'
                : ''
            "
          />
        </div>

        <span
          class="field-hint password-warning"
          x-show="confirm && confirm !== password"
          x-cloak
        >
          Passwords don't match
        </span>
      </div>

      <button
        type="submit"
        class="rpg-button"
        x-bind:disabled="
          confirm !== '' && confirm !== password
        "
        x-bind:class="
          confirm !== '' && confirm !== password
            ? 'button-disabled'
            : ''
        "
      >
        <span class="button-slime">
          ●
        </span>

        <span>
          Create Character
        </span>

        <span
          id="signup-spinner"
          class="htmx-indicator spinner"
        ></span>
      </button>
    </form>
  );
}


export function SignupPage({
  error,
  username,
  email,
}: {
  error?: string;
  username?: string;
  email?: string;
}) {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Evolvoea — Create Account</title>

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

          <section class="auth-intro">

            <div class="character-stage">
              <div class="character-shadow"></div>
              <div class="bunny-character"></div>
            </div>

            <h1 class="game-logo">
              EVOLVOEA
            </h1>

            <p class="game-tagline">
              EXPLORE · SURVIVE · EVOLVE
            </p>

            <div class="game-message">

              <span class="message-icon">
                ✦
              </span>

              <div>
                <strong>
                  Begin your adventure.
                </strong>

                <p>
                  Enter the world.
                  <br />
                  Discover. Battle. Evolve.
                </p>
              </div>

            </div>

          </section>


          <section class="auth-card signup-card">

            <div class="card-corner corner-tl">❧</div>
            <div class="card-corner corner-tr">❧</div>
            <div class="card-corner corner-bl">❧</div>
            <div class="card-corner corner-br">❧</div>

            <div class="auth-card-header">

              <div class="mini-slime">
                ●
              </div>

              <h2>
                Create Your Character
              </h2>

              <p>
                Your journey begins here.
              </p>

            </div>


            <div class="divider">
              <span></span>
              <b>◆</b>
              <span></span>
            </div>


            <SignupForm
              error={error}
              username={username}
              email={email}
            />


            <div class="auth-switch">

              <span>
                Already have an account?
              </span>

              <a href="/login">
                Log in
                <span class="leaf">
                  ❧
                </span>
              </a>

            </div>


            <div class="card-footer"></div>

          </section>

        </main>


        <div class="auth-footer">
          <span>EVOLVOEA</span>
          <span>•</span>
          <span>A BRIGHTER ECOSYSTEM</span>
        </div>

      </body>
    </html>
  );
}