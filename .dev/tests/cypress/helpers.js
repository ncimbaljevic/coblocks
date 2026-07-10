/**
 * Select the block inspector's "Styles" tab. Ensures the settings sidebar is
 * open first, because some flows (e.g. closing the media modal) leave it closed,
 * which would hide the block's Styles tab.
 */
export function selectStylesTabIfExists() {
	cy.get( 'button[aria-label="Settings"]' ).then( ( $settings ) => {
		if ( ! $settings.hasClass( 'is-pressed' ) && ! $settings.hasClass( 'is-toggled' ) ) {
			cy.wrap( $settings ).click();
		}
	} );
	// Click the Styles inspector tab only when the block exposes one. Some blocks
	// (e.g. logos) render their style variations within the Settings tab instead
	// of a dedicated Styles tab, so there is nothing to switch to.
	cy.get( sidebarClass() ).then( ( $sidebar ) => {
		const $tab = $sidebar.find( 'button[aria-label="Styles"]' );
		if ( $tab.length ) {
			cy.wrap( $tab ).click();
		}
	} );
}

/**
 * Add Form block child element by name.
 *
 * @param {string} name the name of the child block to add.
 */
export function addFormChild( name ) {
	cy.get( '[data-type="coblocks/form"] [data-type^="coblocks/field"]' ).first().click( { force: true } );
	cy.get( '.block-editor-block-settings-menu' ).click();
	cy.get( '.components-popover__content button' ).contains( /insert after|add after/i ).click( { force: true } );
	cy.get( '[data-type="coblocks/form"] [data-type="core/paragraph"]' ).click( { force: true } );

	if ( isWP65AtLeast() ) {
		cy.get( '.edit-post-header-toolbar' ).find( '.editor-document-tools__inserter-toggle' ).click( { force: true } );

		cy.get( '.components-input-control__input' ).click().type( name );
	} else {
		cy.get( '.edit-post-header-toolbar' ).find( '.edit-post-header-toolbar__inserter-toggle' ).click( { force: true } );

		cy.get( '.block-editor-inserter__search .components-search-control__input' ).click().type( name );
	}

	cy.get( '.editor-block-list-item-coblocks-field-' + name ).first().click( { force: true } );
	cy.get( `[data-type="coblocks/field-${ name }"]` ).should( 'exist' ).click( { force: true } );
}

/**
 * Login to our test WordPress site
 */
export function loginToSite() {
	return goTo( '/wp-login.php', true )
		.then( () => {
			cy.wait( 250 );

			cy.get( '#user_login' ).type( Cypress.env( 'wpUsername' ) );
			cy.get( '#user_pass' ).type( Cypress.env( 'wpPassword' ) );
			cy.get( '#wp-submit' ).click();
		} );
}

/**
 * Go to a specific URI.
 *
 * @param {string}  path  The URI path to go to.
 * @param {boolean} login If this is a login page.
 */
export function goTo( path = '/wp-admin', login = false ) {
	return cy.visit( Cypress.env( 'testURL' ) + path ).then( () => {
		return login ? cy.window().then( ( win ) => {
			return win;
		} ) : getWPDataObject();
	} );
}

/**
 * Safely obtain the window data object or error
 * when the window object is not available.
 */
export function getWPDataObject() {
	return cy.window().its( 'wp' ).then( ( wp ) => {
		return wp.data;
	} );
}

/**
 * Safely obtain the window blocks object or error
 * when the window object is not available.
 */
export function getWPBlocksObject() {
	return cy.window().its( 'wp' ).then( ( wp ) => {
		return wp.blocks;
	} );
}

/**
 * Disable Gutenberg Tips
 */
export function disableGutenbergFeatures() {
	return getWPDataObject().then( ( data ) => {
		// Enable "Top Toolbar"
		if ( ! data.select( 'core/edit-post' ).isFeatureActive( 'fixedToolbar' ) ) {
			data.dispatch( 'core/edit-post' ).toggleFeature( 'fixedToolbar' );
		}

		if ( data.select( 'core/edit-post' ).isFeatureActive( 'welcomeGuide' ) ) {
			data.dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
		}

		data.dispatch( 'core/editor' ).disablePublishSidebar();
	} );
}

/**
 * From inside the WordPress editor insert a block by blockName.
 * This function has changed to insert blocks by the via dispatch to `core/block-editor`.
 * The old method, using the inserter with Cypress triggers a race condition crashing the editor.
 *
 * @param {string}  blockName   The name to find in the block inserter
 *                              e.g 'core/image' or 'coblocks/accordion'.
 * @param {boolean} clearEditor Should clear editor of all blocks
 */
export function addBlockToPost( blockName, clearEditor = false ) {
	const blockCategory = blockName.split( '/' )[ 0 ] || false;
	const blockID = blockName.split( '/' )[ 1 ] || false;

	if ( ! blockCategory || ! blockID ) {
		return;
	}

	if ( clearEditor ) {
		clearBlocks();
	}

	// Ensure editor is ready for blocks.
	cy.get( '.is-root-container.wp-block-post-content' );

	/**
	 * Insert the block using dispatch to avoid the block inserter
	 *
	 * Note: This method is preferred over the old method because
	 * we do not need to test the Core controls around block insertion.
	 */
	getWPDataObject().then( ( data ) => {
		getWPBlocksObject().then( ( blocks ) => {
			data.dispatch( 'core/block-editor' ).insertBlock(
				blocks.createBlock( blockName )
			);
		} );
	} );

	// Make sure the block was added to our page. The block renders inside the
	// editor-canvas iframe under WP 7.0, so query the block wrapper directly
	// (the cy.get override scopes it into the canvas).
	cy.get( `[data-type="${ blockName }"]` ).should( 'exist' );

	// Give a short delay for blocks to render.
	cy.wait( 250 );
}

export function addNewGroupToPost() {
	clearBlocks();

	if ( isWP65AtLeast() ) {
		cy.get( '.editor-document-tools__inserter-toggle' ).click();

		cy.get( '.components-input-control__input' ).click().type( 'group' );
	} else {
		cy.get( '.edit-post-header [aria-label="Add block"], .edit-site-header [aria-label="Add block"], .edit-post-header-toolbar__inserter-toggle' ).click();

		cy.get( '.block-editor-inserter__search-input,input.block-editor-inserter__search, .components-search-control__input' ).click().type( 'group' );
	}

	cy.wait( 1000 );

	cy.get( '.block-editor-block-types-list__list-item' ).contains( 'Group' ).click();

	// Make sure the block was added to our page
	cy.get( `[class*="-visual-editor"] [data-type='core/group']` ).should( 'exist' ).then( () => {
		// Then close the block inserter if still open.
		const inserterButton = Cypress.$( 'button[class*="__inserter-toggle"].is-pressed' );
		if ( !! inserterButton.length ) {
			cy.get( 'button[class*="__inserter-toggle"].is-pressed' ).click();
		}
	} );
}

/**
 * From inside the WordPress editor open the CoBlocks Gutenberg editor panel
 */
export function savePage() {
	if ( isWP66AtLeast() ) {
		cy.get( '.editor-header__settings button.is-primary' ).click();
	} else {
		cy.get( '.edit-post-header__settings button.is-primary' ).click();
	}

	cy.get( '.components-editor-notices__snackbar', { timeout: 120000 } ).should( 'not.be.empty' );

	// Reload the saved post to ensure we're not hitting any block errors. We
	// navigate to the post's edit screen by ID rather than cy.reload(): saving a
	// new post no longer updates the post-new.php URL in a way cy.reload() can
	// follow, so a reload would re-open an empty new post.
	getWPDataObject().then( ( data ) => {
		const postId = data.select( 'core/editor' ).getCurrentPostId();
		goTo( `/wp-admin/post.php?post=${ postId }&action=edit` );
	} );
}

/**
 * Check the page for block errors
 *
 * @param {string} blockName blockName the block to check for
 *                           e.g 'core/image' or 'coblocks/accordion'.
 */

export function checkForBlockErrors( blockName ) {
	// Ensure editor is ready for blocks.
	cy.get( '.is-root-container.wp-block-post-content' );

	disableGutenbergFeatures();

	cy.get( '.block-editor-warning' ).should( 'not.exist' );

	cy.get( 'body.php-error' ).should( 'not.exist' );

	cy.get( `[data-type="${ blockName }"]` ).should( 'exist' );
}

/**
 * View the currently edited page on the front of site
 */
export function viewPage() {
	cy.get( 'button[aria-label="Settings"]' ).then( ( settingsButton ) => {
		if ( ! Cypress.$( settingsButton ).hasClass( 'is-pressed' ) && ! Cypress.$( settingsButton ).hasClass( 'is-toggled' ) ) {
			cy.get( settingsButton ).click();
		}
	} );

	if ( isWP65AtLeast() ) {
		cy.get( '[data-tab-id="edit-post/document"]' );

		cy.get( '.editor-post-url__panel-dropdown button' ).click();
	} else {
		cy.get( 'button[data-label="Post"]' );

		cy.get( '.edit-post-post-url__dropdown button' ).click();
	}

	cy.get( '.editor-post-url__link' ).then( ( pageLink ) => {
		const linkAddress = Cypress.$( pageLink ).attr( 'href' );
		cy.visit( linkAddress );
	} );
}

/**
 * Edit the currently viewed page
 */
export function editPage() {
	cy.get( '#wp-admin-bar-edit' )
		.click();
}

/**
 * Clear all blocks from the editor
 */
export function clearBlocks() {
	getWPDataObject().then( ( data ) => {
		data.dispatch( 'core/block-editor' ).removeBlocks(
			data.select( 'core/block-editor' ).getBlocks().map( ( block ) => block.clientId )
		);
	} );
}

/**
 * Attempts to retrieve the block slug from the current spec file being run
 * eg: accordion.js => accordion
 */
export function getBlockSlug() {
	const specFile = Cypress.spec.name;

	return ( specFile.split( '/' ).pop().replace( '.cypress.js', '' ) );
}

/**
 * Click on a style button within the style panel
 *
 * @param {string} style Name of the style to apply
 */
export function setBlockStyle( style ) {
	// WordPress 6.3+ moved block styles from a collapsible panel into a
	// dedicated "Styles" inspector tab, so select that tab rather than opening
	// a "Styles" panel body (which no longer exists).
	selectStylesTabIfExists();

	// Style variations render either within the settings sidebar (older layout)
	// or under the Styles tab's variants list, depending on the block, so match
	// across both containers.
	cy.get( [
		sidebarClass() + ' [class*="editor-block-styles"]',
		'.block-editor-block-styles__variants',
		'.block-editor-block-styles__item',
	].join( ', ' ) )
		.contains( RegExp( style, 'i' ) )
		.click();
}

/**
 * Click on a style button within the new style panel
 *
 * @param {string} style Name of the style to apply
 */
export function setNewBlockStyle( style ) {
	selectStylesTabIfExists();

	cy.get( sidebarClass() + ' [class*="editor-block-styles"]' )
		.contains( RegExp( style, 'i' ) )
		.click();
}

/**
 * Select the block using the Block navigation component.
 * Input parameter is the name of the block to select.
 * Allows chaining.
 *
 * @param {string} name The name of the block to select eg: highlight or click-to-tweet
 */
export function selectBlock( name ) {
	/**
	 * There are network requests taking place to the REST API to get the blocks and block patterns.
	 * Sometimes these requests occur and other times they are cached and are not called.
	 * For that reason is difficult to assert against those requests from core code.
	 * We introduce an arbitrary wait to avoid a race condition by interacting too quickly.
	 */
	cy.wait( 600 );

	let id = ''; // The block client ID.
	cy.window().then( ( win ) => {
		// Prefer selector from data-store.
		id = win.wp.data.select( 'core/block-editor' ).getBlocks().filter( ( i ) => i?.name === name )[ 0 ]?.clientId;

		// Fallback to selector from DOM.
		if ( ! id ) {
			cy.get(	`[data-type*="${ name }"], [data-title*="${ name }"]` )
				.invoke( 'attr', 'data-block' )
				.then( ( clientId ) => id = clientId );
		}
	} );

	cy.window().then( ( win ) => {
		win.wp.data.dispatch( 'core/block-editor' ).selectBlock( id );
	} );

	cy.window().then( ( win ) => {
		win.wp.data.dispatch( 'core/edit-post' ).openGeneralSidebar( 'edit-post/block' );
	} );
	cy.wait( 600 );
}

/**
 * Helper function to set the block alignment.
 *
 * @param {string} alignment The alignment to set.
 */
export function setBlockAlignment( alignment ) {
	// Open alignment toolbar for selected block.
	cy.get( '[aria-label="Change alignment"], [aria-label="Align"]' ).click();

	if ( alignment !== 'wide' && alignment !== 'full' ) { // Label prefixed with "Align".
		alignment = `Align ${ alignment }`;
	} else { // Label starts with capitalized letter.
		alignment = alignment.charAt( 0 ).toUpperCase() + alignment.slice( 1 );
	}

	cy.get( '[aria-label="Change alignment"], [aria-label="Align"]' ).contains( alignment ).click();
}

/**
 * Set a value within the input box
 *
 * @param {string}  panelName   Name of the panel to open
 * @param {string}  settingName The name of the setting to search for
 * @param {string}  value       The value to type
 * @param {boolean} ignoreCase  Optional case sensitivity. Default will ignore case.
 */
export function setInputValue( panelName, settingName, value, ignoreCase = true ) {
	openSettingsPanel( ignoreCase ? RegExp( panelName, 'i' ) : panelName );

	cy.get( sidebarClass() )
		.contains( ignoreCase ? RegExp( settingName, 'i' ) : settingName ).not( '.block-editor-block-card__description' )
		.then( ( $settingSection ) => {
			cy.get( Cypress.$( $settingSection ).parent() )
				.find( 'input[type="number"]' )
				.focus()
				.type( `{selectall}${ value }` );
		} );
}

/**
 * Upload helper object. Contains image fixture spec and uploader function.
 * `helpers.upload.spec` Object containing image spec.
 * `helpers.upload.imageToBlock` Function performs upload action on specified block.
 * `helpers.upload.imageReplaceFlow` Function performs replace action on specified block.
 */
export const upload = {
	/**
	 * Upload image to input element and trigger replace image flow.
	 *
	 * @param {string} blockName The name of the block that is replacing target
	 *                           imageReplaceFlow works with CoBlocks Galleries: Carousel, Collage, Masonry, Offset, Stacked.
	 */
	imageReplaceFlow: ( blockName ) => {
		const selectBlockBy = blockName.split( '-' )?.[ 1 ];

		upload.imageToBlock( blockName );

		selectBlock( selectBlockBy );

		cy.get( '.coblocks-gallery-item__button-replace' ).should( 'not.exist' );

		cy.get( `[class*="-visual-editor"] [data-type="${ blockName }"]` ).click();

		cy.get( `[class*="-visual-editor"] [data-type="${ blockName }"] img` ).first().click( { force: true } );

		cy.get( '.coblocks-gallery-item__button-replace' ).click( { force: true } );

		cy.get( '#menu-item-browse' ).click();

		cy.get( 'ul.attachments' );

		// Replace the image.
		const newImageBase = 'R150x150';
		const newFilePath = `../.dev/tests/cypress/fixtures/images/${ newImageBase }.png`;

		cy.fixture( newFilePath, { encoding: null } ).then( ( fileContent ) => {
			cy.get( '[class^="moxie"] [type="file"]' ).selectFile( { contents: fileContent, fileName: newFilePath, mimeType: 'image/png' }, { force: true } );
		} );

		cy.get( '.attachment.selected.save-ready' );
		cy.get( '.media-modal .media-button-select' ).click();

		cy.get( '[class*="-visual-editor"]' ).find( `[data-type="${ blockName }"] img` ).first().should( 'have.attr', 'src' ).should( 'include', newImageBase );
	},
	/**
	 * Upload image to input element.
	 *
	 * @param {string}  blockName The name of the block that is upload target
	 *                            e.g 'core/image' or 'coblocks/accordion'.
	 * @param {boolean} allBlocks Whether to iterate and upload to all block dropzone selectors.
	 */
	imageToBlock: ( blockName, allBlocks = false ) => {
		const { fileName, pathToFixtures } = upload.spec;
		let fileContent;

		cy.fixture( pathToFixtures + fileName, { encoding: null } ).then( ( fileCont ) => {
			fileContent = fileCont;

			if ( allBlocks ) {
				cy.get( `[data-type="${ blockName }"] .components-drop-zone` ).each( ( zone ) => {
					cy.wrap( zone ).selectFile( { contents: fileContent, fileName: pathToFixtures + fileName, mimeType: 'image/png' }, { action: 'drag-drop', force: true } );
				} );
			} else {
				cy.get( `[data-type="${ blockName }"] .components-drop-zone` ).first()
					.selectFile( { contents: fileContent, fileName: pathToFixtures + fileName, mimeType: 'image/png' }, { action: 'drag-drop', force: true } );
			}
			// Now validate upload is complete and is not a blob.
			cy.get( `[class*="-visual-editor"] [data-type="${ blockName }"] [src^="http"]` );
		} );
	},
	spec: {
		fileName: '150x150.png',
		imageBase: '150x150',
		pathToFixtures: '../.dev/tests/cypress/fixtures/images/',
	},
};

const customColorPalatteSelector = ( () => [
	'.components-color-palette__custom-color-button', // WP 6.3+
	'.components-color-palette__custom-color', // WP 6.2.
].join() )();

/**
 * Set a Color Setting value to a custom hex color
 *
 * @param {string} settingName The setting to update. background|text
 * @param {string} hexColor
 */
export function setColorSettingsFoldableSetting( settingName, hexColor ) {
	const formattedHex = hexColor.split( '#' )[ 1 ];

	cy.get( '.block-editor-panel-color-gradient-settings__dropdown' ).contains( settingName, { matchCase: false } ).click();

	cy.get( customColorPalatteSelector ).click();

	cy.get( '.components-color-picker' ).find( '.components-input-control__input' ).click().clear().type( formattedHex );

	cy.get( '.block-editor-panel-color-gradient-settings__dropdown' )
		.contains( settingName, { matchCase: false } )
		.click( { force: true } );
}

export function setColorPanelSetting( settingName, hexColor ) {
	const formattedHex = hexColor.split( '#' )[ 1 ];

	cy.get( '.block-editor-panel-color-gradient-settings__dropdown' ).contains( settingName, { matchCase: false } ).click();

	cy.get( customColorPalatteSelector ).click();

	cy.get( '.components-color-picker' ).find( '.components-input-control__input' ).click().clear().type( formattedHex );

	cy.get( '.block-editor-panel-color-gradient-settings__dropdown' ).contains( settingName, { matchCase: false } ).click();
}

/**
 * Open a certain settings panel in the right hand sidebar of the editor
 *
 * @param {RegExp} panelText The panel label text to open. eg: Color Settings
 */
export function openSettingsPanel( panelText ) {
	// Block styles moved from a settings panel into a dedicated "Styles"
	// inspector tab in WP 6.3+, so route requests for the Styles panel there.
	const wantsStyles = panelText instanceof RegExp
		? panelText.test( 'Styles' )
		: /^\s*styles\s*$/i.test( String( panelText ) );
	if ( wantsStyles ) {
		selectStylesTabIfExists();
		return;
	}

	if ( isWP65AtLeast() ) {
		cy.get( '[data-tab-id="edit-post/block"]' ).click();
	} else {
		// Ensure block tab is selected.
		// eslint-disable-next-line no-lonely-if
		if ( Cypress.$( 'button[data-label="Block"]:not(.is-active)' ) ) {
			cy.get( 'button[data-label="Block"]' ).click();
		}
	}

	cy.get( '.components-panel__body' )
		.contains( panelText )
		.then( ( $panelTop ) => {
			const $parentPanel = Cypress.$( $panelTop ).closest( 'div.components-panel__body' );
			if ( ! $parentPanel.hasClass( 'is-opened' ) ) {
				$panelTop.trigger( 'click' );
			}
		} );
}

/**
 * Open a block heading controls located in block toolbar.
 *
 * @param {number} headingLevel The button that should be located and clicked
 */
export function openHeadingToolbarAndSelect( headingLevel ) {
	// Button has aria label select the heading
	if ( Cypress.$( '.block-editor-block-toolbar .block-editor-block-toolbar__slot button[aria-label="Change heading level"]' ) ) {
		cy.get( '.block-editor-block-toolbar .block-editor-block-toolbar__slot button[aria-label="Change heading level"]' ).click();
		cy.get( '.components-popover__content div[role="menu"] button' ).contains( headingLevel ).focus().click();
	} else {
		// No aria label present. Attempt to set using old method.

		cy.get( '.block-editor-block-toolbar .block-editor-block-toolbar__slot button' ).each( ( button, index ) => {
			if ( index === 1 ) { // represents the second position in the toolbar
				cy.get( button ).click( { force: true } );
			}
		} );
		cy.get( '.components-popover__content div[role="menu"] button' ).contains( headingLevel ).focus().click();
	}
}

/**
 * Toggle a checkbox in the settings panel of the block editor
 *
 * @param {string} checkboxLabelText The checkbox label text. eg: Drop Cap
 */
export function toggleSettingCheckbox( checkboxLabelText ) {
	// Match the ToggleControl by its label text and click the underlying
	// checkbox input. The `__label` element class changed in newer
	// @wordpress/components, so locate the control by its stable root class.
	cy.contains( '.components-toggle-control', checkboxLabelText )
		.find( 'input[type="checkbox"]' )
		.click( { force: true } );
}

/**
 * Add custom classes to a block
 *
 * @param {string} classes Custom class(es) to add to the block
 * @param {string} blockID The name of the block e.g. (accordion, alert, map)
 */
export function addCustomBlockClass( classes, blockID = '' ) {
	if ( ! blockID.length ) {
		blockID = getBlockSlug();
	}

	// Force click the target element so that we don't select any innerBlocks by mistake.
	cy.get( '[class*="-visual-editor"] .wp-block[data-type="coblocks/' + blockID + '"]' ).last().click( { force: true } );

	cy.get( '.block-editor-block-inspector__advanced' ).scrollIntoView().find( 'button' ).then( ( $btn ) => {
		const isOpen = $btn.attr( 'aria-expanded' );
		if ( 'false' === isOpen ) {
			cy.wrap( $btn ).click();
		}
	} );

	cy.get( 'div' + sidebarClass() )
		.contains( /Additional CSS/i )
		.next( 'input' )
		.then( ( $inputElem ) => {
			cy.get( $inputElem ).invoke( 'val' ).then( ( val ) => {
				if ( val.length > 0 ) {
					cy.get( $inputElem ).type( `{selectall}${ [ val, classes ].join( ' ' ) }` );
				} else {
					cy.get( $inputElem ).type( classes );
				}
			} );
		} );
}

/**
 * Open the CoBlocks Labs modal.
 */
export function openCoBlocksLabsModal() {
	// Open "more" menu.
	cy.get( '.edit-post-more-menu button, .interface-more-menu-dropdown button' ).click();
	cy.get( '.components-menu-group' ).contains( 'CoBlocks Labs' ).click( { force: true } );

	cy.get( '.components-modal__frame' ).contains( 'CoBlocks Labs' ).should( 'exist' );
}

/**
 * Helper method to convert a hex value to an RGB value
 *
 * @param {string} hex Hex string. eg: #55e7ff
 * @return {string} RGB string.
 */
export function hexToRGB( hex ) {
	let r = 0;
	let g = 0;
	let b = 0;

	// 3 digits
	if ( hex.length === 4 ) {
		r = '0x' + hex[ 1 ] + hex[ 1 ];
		g = '0x' + hex[ 2 ] + hex[ 2 ];
		b = '0x' + hex[ 3 ] + hex[ 3 ];
	// 6 digits
	} else if ( hex.length === 7 ) {
		r = '0x' + hex[ 1 ] + hex[ 2 ];
		g = '0x' + hex[ 3 ] + hex[ 4 ];
		b = '0x' + hex[ 5 ] + hex[ 6 ];
	}

	return 'rgb(' + +r + ', ' + +g + ', ' + +b + ')';
}

export function isNotWPLocalEnv() {
	return Cypress.env( 'testURL' ) !== 'http://localhost:8889';
}

/**
 * Whether the running WordPress is at least the given branch. Parses the
 * `branch-<major>-<minor>` body class instead of matching hard-coded branches,
 * so it keeps working for WordPress 7.0+ (previously these only checked for
 * specific 6.x branch classes and wrongly returned false on newer versions).
 *
 * @param {number} major Minimum major version.
 * @param {number} minor Minimum minor version.
 * @return {boolean} True when the current branch is >= major.minor.
 */
function wpBranchAtLeast( major, minor ) {
	// WordPress adds a `branch-<major>-<minor>` body class, but drops the minor
	// for x.0 releases (WP 7.0 is `branch-7`), so the minor group is optional.
	const match = ( Cypress.$( "[class*='branch-']" ).attr( 'class' ) || '' ).match( /branch-(\d+)(?:-(\d+))?/ );
	if ( ! match ) {
		return false;
	}
	const branchMajor = Number( match[ 1 ] );
	const branchMinor = match[ 2 ] !== undefined ? Number( match[ 2 ] ) : 0;
	return branchMajor > major || ( branchMajor === major && branchMinor >= minor );
}

export function isWP65AtLeast() {
	return wpBranchAtLeast( 6, 5 );
}

export function isWP66AtLeast() {
	return wpBranchAtLeast( 6, 6 );
}

function getIframeDocument( containerClass ) {
	return cy.get( containerClass + ' iframe' ).its( '0.contentDocument' ).should( 'exist' );
}

export function getIframeBody( containerClass ) {
	return getIframeDocument( containerClass ).its( 'body' ).should( 'not.be.undefined' )
		// wraps "body" DOM element to allow
		// chaining more Cypress commands, like ".find(...)"
		.then( cy.wrap );
}

export const sidebarClass = () => {
	return isWP66AtLeast() ? '.editor-sidebar__panel' : '.edit-post-sidebar';
};
