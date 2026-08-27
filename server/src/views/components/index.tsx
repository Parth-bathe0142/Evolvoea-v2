import type { FC } from "hono/jsx";

export const GameScreen: FC = () => (
	<div
		id="game-screen"
		class="ui absolute inset-0 grid grid-cols-[20%_60%_20%] items-start"
		x-data="{ paused: false }"
		x-on:game_play="paused = false"
		x-on:game_pause="paused = true"
		x-show="$store.gameScreens.screen == 'game-screen'"
		x-cloak
	>
		{/* Left */}
		<div class="z-10 flex flex-col items-start gap-1 p-2">
			<button class="p-1 border-[#ffcc00] border-2 bg-[#ff4500]" x-on:click="$dispatch('game_pause')" x-show="!paused">
				pause
			</button>
			<button class="p-1 border-[#ffcc00] border-2 bg-[#ff4500]" x-on:click="$dispatch('game_play')" x-show="paused">
				play
			</button>
		</div>

		{/* Center */}
		<div class="flex h-full w-full items-center justify-center overflow-hidden">
			<canvas
				id="game-canvas"
				width="400"
				height="225"
				class="scale-[3] [image-rendering:pixelated]"
			/>
		</div>

		{/* Right */}
		<div class="z-10 flex flex-col items-end gap-1 p-2">
			<div
				id="health-bar"
				class="m-1.25 flex w-fit flex-row gap-0.5 [image-rendering:pixelated]"
			/>
		</div>
	</div>
);

export const TitleScreen: FC = () => (
	<div
		id="title-screen"
		class="ui flex absolute inset-0 flex-col items-center
		justify-center bg-black/80 text-center text-[#ffcc00]"
		x-show="$store.gameScreens.screen == 'title-screen'"
		x-cloak
	>
		<h1
			id="title-screen_title"
			class="mb-5 text-[42px] font-bold tracking-[3px]"
		>
			EVOLVOEA
		</h1>

		<button
			id="title-screen_button"
			class="mb-4 rounded-lg border-2 border-[#ffcc00]
			bg-[#ff4500] px-6 py-3 text-xl font-bold text-white transition
			hover:bg-[#ffcc00] hover:text-black"
			x-on:click="$store.gameScreens.goToGame()"
		>
			Play
		</button>

		<a href="/">
			<button
				class="rounded-lg border-2 border-[#ffcc00] bg-[#ff4500] px-6 py-3
				text-xl font-bold text-white transition hover:bg-[#ffcc00] hover:text-black"
			>
				Go Back
			</button>
		</a>
	</div>
);

export const ReplayScreen: FC = () => (
	<div
		id="replay-screen"
		class="ui flex absolute inset-0 flex-col items-center justify-center
		bg-black/80 text-center text-[#ffcc00]"
		x-show="$store.gameScreens.screen == 'replay-screen'"
		x-cloak
	>
		<h1
			id="replay-screen_title"
			class="mb-5 text-[40px] font-bold text-red-600"
		>
			Game Over
		</h1>

		<h2 class="mb-6 text-2xl font-bold text-white">
			Score: <span id="score">loading...</span>
		</h2>

		<button
			id="replay-screen_button_replay"
			class="mb-3 rounded-md border-2 border-[#ffcc00] bg-[#ff4500] px-5 py-2
			text-lg font-bold text-white transition hover:bg-[#ffcc00] hover:text-black"
			x-on:click="$store.gameScreens.goToGame()"
		>
			Play again
		</button>

		<button
			id="replay-screen_button_back"
			class="rounded-md border-2 border-[#ffcc00] bg-[#222] px-5 py-2 text-lg
			font-bold text-[#ffcc00] transition hover:bg-[#ffcc00] hover:text-black"
			x-on:click="$store.gameScreens.goToTitle()"
		>
			Back
		</button>
	</div>
);

export const Game: FC = () => (
	<>
		<div
			id="game-container"
			class="relative flex h-screen w-screen items-center justify-center"
		>
			<GameScreen />
			<TitleScreen />
			<ReplayScreen />
		</div>

		<script type="module" src="/static/game.js"></script>
	</>
);
