/*
 * Include our constants
 */
import * as helpers from '../../../../.dev/tests/cypress/helpers';

describe( 'Test CoBlocks Gallery Stacked Block', function() {
	/**
	 * Setup Gallery data
	 */
	const galleryData = {
		caption: 'Caption Here',
	};

	/**
	 * Test that we can add a gallery-stacked block to the content, not add any images or
	 * alter any settings, and are able to successfully save the block without errors.
	 */
	it( 'Test stacked block saves with empty values.', function() {
		helpers.addBlockToPost( 'coblocks/gallery-stacked', true );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-stacked' );

		helpers.viewPage();

		cy.get( '.wp-block-coblocks-gallery-stacked' ).find( 'ul' ).should( 'be.empty' );

		helpers.editPage();
	} );

	/**
	 * Test that we can upload images to block and are able
	 * to successfully save the block without errors.
	 */
	it( 'Test stacked block saves with image upload.', function() {
		const { imageBase } = helpers.upload.spec;
		helpers.addBlockToPost( 'coblocks/gallery-stacked', true );

		helpers.selectBlock( 'stacked' );

		helpers.upload.imageToBlock( 'coblocks/gallery-stacked' );

		cy.get( '.coblocks-gallery--item img[src*="http"]' ).should( 'have.attr', 'src' ).should( 'include', imageBase );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-stacked' );
	} );

	/**
	 * Test that we can add image from library and are able
	 * to successfully save the block without errors.
	 */
	it( 'Test stacked block saves with images from media library.', function() {
		helpers.addBlockToPost( 'coblocks/gallery-stacked', true );

		cy.get( '[data-type="coblocks/gallery-stacked"]' )
			.click()
			.contains( /media library/i )
			.click();

		cy.get( '.media-modal-content' ).contains( /media library/i ).click();

		cy.get( '.media-modal-content' ).find( 'li.attachment' )
			.first( 'li' )
			.click();

		cy.get( 'button' ).contains( /create a new gallery/i ).click();
		cy.get( 'button' ).contains( /insert gallery/i ).click();

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-stacked' );
	} );

	/**
	 * Test that we can add image captions
	 * to successfully save the block without errors.
	 */
	it( 'Test stacked block saves with images captions.', function() {
		const { caption } = galleryData;
		helpers.addBlockToPost( 'coblocks/gallery-stacked', true );

		cy.get( '[data-type="coblocks/gallery-stacked"]' )
			.click()
			.contains( /media library/i )
			.click();

		cy.get( '.media-modal-content' ).contains( /media library/i ).click();

		cy.get( '.media-modal-content' ).find( 'li.attachment' )
			.first( 'li' )
			.click();

		cy.get( 'button' ).contains( /create a new gallery/i ).click();
		cy.get( 'button' ).contains( /insert gallery/i ).click();

		helpers.toggleSettingCheckbox( /captions/i );

		cy.get( '.coblocks-gallery--item' ).first().find( 'img' ).click( { force: true } );
		cy.get( '.coblocks-gallery--item' ).first().find( 'figcaption' ).focus().type( caption );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-stacked' );
	} );

	/**
	 * Test that we can add image captions with rich text options
	 */
	it( 'Test stacked captions allow rich text controls.', function() {
		helpers.addBlockToPost( 'coblocks/gallery-stacked', true );

		cy.get( '[data-type="coblocks/gallery-stacked"]' )
			.click()
			.contains( /media library/i )
			.click();

		cy.get( '.media-modal-content' ).contains( /media library/i ).click();

		cy.get( '.media-modal-content' ).find( 'li.attachment' )
			.first( 'li' )
			.click();

		cy.get( 'button' ).contains( /create a new gallery/i ).click();
		cy.get( 'button' ).contains( /insert gallery/i ).click();

		helpers.toggleSettingCheckbox( /captions/i );

		cy.get( '.block-editor-format-toolbar' ).should( 'not.exist' );

		cy.get( '.coblocks-gallery--item' ).first().find( 'img' ).click( { force: true } );
		cy.get( '.coblocks-gallery--item' ).first().find( 'figcaption' ).focus();

		cy.get( '.block-editor-format-toolbar, .block-editor-rich-text__inline-format-toolbar-group' );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-stacked' );
	} );

	/**
	 * Test that we can add image and replace image.
	 */
	it( 'Test stacked replace image flow.', function() {
		helpers.addBlockToPost( 'coblocks/gallery-stacked', true );

		helpers.upload.imageReplaceFlow( 'coblocks/gallery-stacked' );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-stacked' );
	} );

	/**
	 * Test the text sizes change as expected
	 */
	it( 'Test the text sizes change as expected.', function() {
		const { caption } = galleryData;
		helpers.addBlockToPost( 'coblocks/gallery-stacked', true );

		cy.get( '[data-type="coblocks/gallery-stacked"]' )
			.click()
			.contains( /media library/i )
			.click();

		cy.get( '.media-modal-content' ).contains( /media library/i ).click();

		cy.get( '.media-modal-content' ).find( 'li.attachment' )
			.first( 'li' )
			.click();

		cy.get( 'button' ).contains( /create a new gallery/i ).click();
		cy.get( 'button' ).contains( /insert gallery/i ).click();

		helpers.toggleSettingCheckbox( /captions/i );

		cy.get( '.coblocks-gallery--item' ).first().find( 'img' ).click( { force: true } );
		cy.get( '.coblocks-gallery--item' ).first().find( 'figcaption' ).focus().type( caption );

		// Styles tab introduced in 6.2.
		helpers.selectStylesTabIfExists();

		// The Typography panel now shows the Font size control directly, so
		// interact with its options rather than adding it via the panel menu.
		// The caption lives inside the editor-canvas iframe, so read its computed
		// font size from the iframe document rather than the top-level Cypress.$.
		const captionFontSize = () => {
			const iframe = Cypress.$( 'iframe[name="editor-canvas"]' )[ 0 ];
			const captionEl = iframe && iframe.contentDocument.querySelector( 'figcaption.coblocks-gallery--caption' );
			return captionEl ? iframe.contentWindow.getComputedStyle( captionEl ).fontSize : undefined;
		};

		cy.get( '.components-toggle-group-control-option, .components-toggle-group-control-option-base' ).then( ( elems ) => {
			// Click through every font-size preset and record the caption's
			// computed font size after each. We do not assert exact px values
			// because the theme dictates them. We also cannot require every
			// adjacent step to differ: the WP 7.0 default theme uses fluid
			// typography, so at the wide Cypress viewport some neighbouring
			// presets clamp to the same px (e.g. XL and XXL both 48px). Instead
			// assert the control actually drives the caption size by yielding
			// more than one distinct value across the presets.
			const sizes = new Set();
			Array.from( elems ).forEach( ( elem ) => {
				cy.get( elem ).focus().click();
				cy.get( 'figcaption.coblocks-gallery--caption' ).should( 'be.visible' ).then( () => {
					sizes.add( captionFontSize() );
				} );
			} );
			cy.wrap( null ).then( () => {
				expect( sizes.size, 'font-size presets produce distinct caption sizes' ).to.be.greaterThan( 1 );
			} );
		} );
	} );
} );
