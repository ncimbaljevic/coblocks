/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import GutterWrapper from '../../components/gutter-control/gutter-wrapper';
import metadata from './block.json';

/**
 * WordPress dependencies.
 */
import { InnerBlocks } from '@wordpress/block-editor';

const deprecated =
[
	{
		attributes: {
			...metadata.attributes,
		},
		save( { attributes, className } ) {
			const classes = classnames( 'has-columns', {
				[ `has-${ attributes.columns }-columns` ]: attributes.columns,
				'has-responsive-columns': attributes.columns > 1,
			} );

			return (
				<div className={ className }>
					<GutterWrapper { ...attributes }>
						<div className={ classes }>
							<InnerBlocks.Content />
						</div>
					</GutterWrapper>
				</div>
			);
		},
	},
	{
		attributes: {
			...metadata.attributes,
		},
		save( { attributes, className } ) {
			return (
				<div className={ className } data-columns={ attributes.columns }>
					<InnerBlocks.Content />
				</div>
			);
		},

	},
];

export default deprecated;
