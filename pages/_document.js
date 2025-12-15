import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang='en'>
			<Head>
				<meta charset='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />

				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />
				<link
					href='https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;1,300&family=Ubuntu:wght@300&display=swap'
					rel='stylesheet'
				/>
				<link rel='icon' href='./assets/Logo.png' />
				<title>JUSD</title>

				<meta name='title' content='JUSD' />
				<meta name='description' content='JUSD StableCoin' />

				<meta property='og:type' content='website' />
				<meta property='og:title' content='JUSD' />
				<meta property='og:description' content='JUSD StableCoin' />

				<meta name='twitter:card' content='summary_large_image' />
				<meta property='twitter:title' content='JUSD' />
				<meta property='twitter:description' content='JUSD StableCoin' />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
