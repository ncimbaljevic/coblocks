/* eslint-disable sort-keys */
module.exports = {
	preset: '@wordpress/jest-preset-default',
	rootDir: '../../../',

	// The jsdom test environment adds the `browser` export condition, which
	// makes packages that ship a browser-only ESM build (e.g. parsel-js, pulled
	// in transitively by @wordpress/components) resolve to ESM that Jest cannot
	// parse. Prefer the Node/CommonJS builds instead.
	testEnvironmentOptions: {
		customExportConditions: [ 'node' ],
	},

	collectCoverageFrom: [
		'<rootDir>/src/blocks/**/save.js',
		'<rootDir>/src/blocks/**/transforms.js',
		'!<rootDir>/src/blocks/gallery-masonry/v1/*.js',
	],
	moduleNameMapper: {
		'@godaddy-wordpress/coblocks-icons': require.resolve(
			'@wordpress/jest-preset-default/scripts/style-mock.js'
		),
		// `uuid` (and the copy bundled inside @wordpress/block-editor) ships ESM
		// that Jest cannot parse; map it to the CommonJS build.
		'^uuid$': require.resolve( 'uuid' ),
	},
	setupFilesAfterEnv: [
		require.resolve( '@wordpress/jest-preset-default/scripts/setup-globals.js' ),
		'<rootDir>/.dev/tests/jest/setup-globals.js',
	],
	testMatch: [ '**/test/*.spec.js' ],
	// Several WordPress 7.0 packages depend on ESM-only modules (e.g. `marked`,
	// the `@ariakit/*` family used by @wordpress/components). Jest ignores
	// node_modules by default, so allow-list these to be transpiled by Babel.
	transformIgnorePatterns: [
		'node_modules/(?!(@ariakit|marked|lodash-es|nanoid|change-case|@react-spring|react-spring|@wordpress/icons|is-plain-object|client-zip|@react-google-maps|supercluster|kdbush|comctx|@sindresorhus)/)',
	],
	transform: {
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/.dev/tests/jest/assets-transformer.js',
	},
};
