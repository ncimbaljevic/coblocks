/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import GutterWrapper from '../../components/gutter-control/gutter-wrapper';

/**
 * WordPress dependencies.
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save();

	const classes = classnames( 'has-columns', {
		[ `has-${ attributes.columns }-columns` ]: attributes.columns,
		'has-responsive-columns': attributes.columns > 1,
	} );

	return (
		<div { ...blockProps }>
			<GutterWrapper { ...attributes }>
				<div className={ classes }>
					<InnerBlocks.Content />
				</div>
			</GutterWrapper>
		</div>
	);
}
