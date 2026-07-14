/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { default as currentBlock } from './block.json';

/**
 * WordPress dependencies.
 */
import { InnerBlocks } from '@wordpress/block-editor';

const deprecated = [
	{
		attributes: currentBlock.attributes,
		save: ( { attributes, className } ) => {
			const {
				columns,
				gutter,
			} = attributes;

			const classes = classnames( className, {
				'has-columns': columns > 1,
				'has-responsive-columns': columns > 1,
				[ `has-${ columns }-columns` ]: columns > 1,
				[ `has-${ gutter }-gutter` ]: gutter,
			} );

			return (
				<div className={ classes } data-columns={ attributes.columns } itemScope itemType="http://schema.org/Menu">
					<InnerBlocks.Content />
				</div>
			);
		},
	},
	{
		attributes: currentBlock.attributes,
		save: ( deprecatedProps ) => {
			return (
				<div className={ deprecatedProps.className } data-columns={ deprecatedProps.attributes.columns } itemScope itemType="http://schema.org/Menu">
					<InnerBlocks.Content />
				</div>
			);
		},
	},
];

export default deprecated;
