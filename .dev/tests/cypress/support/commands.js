import { disableGutenbergFeatures, goTo, loginToSite } from '../helpers';

// WordPress 7.0 renders the editor canvas inside an `iframe[name="editor-canvas"]`.
// Editor-content selectors (block wrappers, block content, the post title) live
// inside that iframe, while chrome (toolbar, inspector/sidebar, modals) stays in
// the top document. To avoid rewriting every spec, transparently extend
// `cy.get()` so that, for a plain string selector at the query root, it also
// searches the canvas iframe body when nothing matches in the top document.
// `get` is a query in Cypress 13, so it must be extended via overwriteQuery; the
// returned function is re-run on every retry, so this stays fully retryable.
Cypress.Commands.overwriteQuery( 'get', function( originalFn, selector, options ) {
	const getFn = originalFn.call( this, selector, options );
	return function( subject ) {
		// When scoped by `.within()`, the previous subject is passed in. Defer to
		// the original query so that scoping (and its iframe context) is honoured
		// rather than searching the whole document/canvas.
		if ( subject ) {
			return getFn.call( this, subject );
		}
		if ( typeof selector === 'string' && ! ( options && options.withinSubject ) ) {
			const topEls = Cypress.$( selector );
			if ( topEls.length ) {
				return topEls;
			}
			const $canvas = Cypress.$( 'iframe[name="editor-canvas"]' );
			const canvasDoc = $canvas.length ? $canvas[ 0 ].contentDocument : null;
			if ( canvasDoc ) {
				const canvasEls = Cypress.$( canvasDoc.body ).find( selector );
				if ( canvasEls.length ) {
					return canvasEls;
				}
				// Handle selectors that span the iframe boundary, e.g.
				// '[class*="-visual-editor"] [data-type="core/image"]': the editor
				// wrapper lives in the top document but the block content is inside
				// the canvas. Strip a leading editor-wrapper segment and retry
				// within the canvas body.
				const stripped = selector.replace(
					/^\s*(?:\.edit-post-visual-editor|\.editor-visual-editor|\[class\*?="-visual-editor"\])\s+/,
					''
				);
				if ( stripped !== selector ) {
					const strippedEls = Cypress.$( canvasDoc.body ).find( stripped );
					if ( strippedEls.length ) {
						return strippedEls;
					}
				}
			}
		}
		return getFn.call( this, subject );
	};
} );

before( function() {
	loginToSite().then( () => {
		goTo( '/wp-admin/post-new.php?post_type=post' ).then( () => {
			cy.wait( 2000 );
			disableGutenbergFeatures();
		} );
	} );
} );

// Custom uploadFile command
Cypress.Commands.add( 'uploadFile', ( fileName, fileType, selector ) => {
	cy.get( selector ).then( ( subject ) => {
		cy.fixture( fileName, 'hex' ).then( ( fileHex ) => {
			const fileBytes = hexStringToByte( fileHex );
			const testFile = new File( [ fileBytes ], fileName, {
				type: fileType,
			} );
			const dataTransfer = new DataTransfer();
			const el = subject[ 0 ];

			dataTransfer.items.add( testFile );
			el.files = dataTransfer.files;
		} );
	} );
} );

// Utilities
function hexStringToByte( str ) {
	if ( ! str ) {
		return new Uint8Array();
	}

	const a = [];
	for ( let i = 0, len = str.length; i < len; i += 2 ) {
		a.push( parseInt( str.substr( i, 2 ), 16 ) );
	}

	return new Uint8Array( a );
}

/**
 * Starting in Cypress 8.1.0 Unhandled Exceptions now cause tests to fail.
 * Sometimes unhandled exceptions occur in Core that do not effect the UX created by CoBlocks.
 * We discard unhandled exceptions and pass the test as long as assertions continue expectedly.
 */
Cypress.on( 'uncaught:exception', () => {
	// returning false here prevents Cypress from failing the test.
	return false;
} );
