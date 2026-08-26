import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { Game } from "./components";

const pages = new Hono();
export default pages;

const HtmxScript = () => (
	<script
		src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.10/dist/htmx.js"
		integrity="sha384-Q+Dky3iHVJOr6wUjQ4ulh6uQ76an/t+ak1+PjMVaxRjbZamFLAG+u9InkfjbsEQf"
		crossorigin="anonymous">
	</script>
)

const AlpineScript = () => (
	<script
		src=" https://cdn.jsdelivr.net/npm/alpinejs@3.15.12/dist/cdn.min.js "
		crossorigin="anonymous"
		defer
	></script>
)

const Shell: FC = ({ children }) => (
	<html>
		<head>
			<link rel="stylesheet" href="/static/style.css"/>
		</head>
		<body class="bg-gray-500 m-0 p-0">
			{children}
		</body>
		<HtmxScript />
		<AlpineScript />
	</html>
	
)

pages.get('/', c => {
	return c.html(
		<Shell></Shell>
	)
});

pages.get('/game', c => {
	return c.html(
		<Shell>
			<Game />
		</Shell>
	)
})