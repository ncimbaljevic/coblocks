/*
 * Include our constants
 */
import * as helpers from '../../../../.dev/tests/cypress/helpers';

describe( 'Test CoBlocks Alert Block', function() {
	let postId;
	before( () => {
		helpers.createFixturePost( Cypress.spec.name ).then( ( id ) => {
			postId = id;
		} );
	} );

	it( 'Test Alert block migrates into core blocks.', function() {
		helpers.goTo( `/wp-admin/post.php?post=${ postId }&action=edit` );

		// Three alert blocks in fixture. Should end up as three paragraph blocks.
		cy.get( '[data-type="core/paragraph"]' ).should( 'have.length', 3 );
		helpers.checkForBlockErrors( 'core/paragraph' );
	} );
} );
