const { defineConfig } = require( 'cypress' );

module.exports = defineConfig( {
	chromeWebSecurity: false,
	defaultCommandTimeout: 20000,
	e2e: {
		setupNodeEvents( on, config ) {
			return require( './.dev/tests/cypress/plugins/index.js' )( on, config );
		},
		specPattern: './/**/*.cypress.js',
		supportFile: '.dev/tests/cypress/support/commands.js',
		// Preserve cookies/localStorage (notably the WordPress login) across the
		// tests within a spec. Replaces the removed `Cypress.Cookies.defaults()`
		// call after the Cypress 13 upgrade.
		testIsolation: false,
	},
	env: {
		testURL: 'http://localhost:9281',
		wpPassword: 'password',
		wpUsername: 'admin',
	},
	fixturesFolder: 'languages',
	pageLoadTimeout: 120000,
	projectId: 'sovnn2',
	retries: {
		openMode: 0,
		runMode: 0,
	},
	screenshotsFolder: '.dev/tests/cypress/screenshots',
	videosFolder: '.dev/tests/cypress/videos',
	viewportHeight: 1440,
	viewportWidth: 2560,
} );
