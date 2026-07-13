/**
 * Load the ESM `@godaddy-wordpress/coblocks-icons` package from this CommonJS
 * script via jiti. The package's barrel re-exports (`export { meta as XMeta }
 * from './library/x'`) are only reliable when each icon module is required
 * directly, so we read `meta`/`styles` per-icon from `build/library/<slug>.js`
 * while taking the canonical icon list from the barrel.
 */
const path = require( 'path' );
const jiti = require( 'jiti' )( __filename, { interopDefault: false } );

const iconsEntry = require.resolve( '@godaddy-wordpress/coblocks-icons/build/index.js' );
const iconsLibDir = path.join( path.dirname( iconsEntry ), 'library' );

const CoblocksIcons = jiti( iconsEntry );
const fs = require( 'fs' ).promises;
const prettier = require( 'prettier' );

const warningHeader = `// --
// -- WARNING!
// -- This is an auto-generated file. Do not edit.
// --`;

/**
 * Scan for all the files inside /svg
 */
const init = async () => {
	console.log( 'Generating SVGS file ...' ); /* eslint-disable-line */

	await createFile( CoblocksIcons.IconsList );
};

/**
 * Create the index file that contains all the icons
 *
 * @param {Array} svgs - An array of all the SVGs
 */
const createFile = async ( svgs ) => {
	let content = `
		${ warningHeader }

		/* eslint-disable */
		import { __ } from \'@wordpress/i18n\';
		import { Icon } from \'@wordpress/icons\';
		import * as CoblocksIcons from \'@godaddy-wordpress/coblocks-icons\'

		const svgs = {`;

	svgs.forEach( ( svg ) => {
		// The barrel's named re-exports are unreliable through jiti, so read the
		// icon's metadata directly from its own module.
		const iconModule = jiti( path.join( iconsLibDir, `${ svg }.js` ) );
		const metas = iconModule.meta;
		const styles = iconModule.styles;

		content =
			content +
			`${ svg.replace( /-/g, '_' ) }: {
				/* translators: icon label */
				label: __( '${ metas.label }', 'coblocks' ),
				keywords: [ ${ metas.keywords.map( ( keyword ) => `
					/* translators: icon keyword */
					__( '${ keyword }', 'coblocks' )
				` ) } ],
				${ Object.keys( styles ).map( ( key ) => `icon${ key !== 'default' ? `_${ key }` : '' }: <Icon icon={ CoblocksIcons[ '${ `${ toPascalCase( svg ) }Styles` }' ][ '${ key }' ] } />` ) }
			},\r\n`;
	} );

	content = content + '};\r\n\r\n export default svgs;';

	content = await prettier.format( content, {
		parser: 'babel',
		singleQuote: true,
		tabWidth: 4,
		useTabs: true,
	} );

	await fs.writeFile( path.join( __dirname, 'svgs-generated.js' ), content );
};

/**
 * Pascal Case a string
 *
 * @param {string} text - The string to pascal case
 * @return {string} The pascal cased string
 */
const toPascalCase = ( text ) => text.replace( /(^\w|-\w)/g, clearAndUpper );

/**
 * Remove dashes and uppercase next letter
 *
 * @param {string} text - The string to uppercase
 * @return {string} The upper cased string
 */
const clearAndUpper = ( text ) => text.replace( /-/, '' ).toUpperCase();

init();
