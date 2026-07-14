/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		columns,
		gutter,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: classnames( {
			'has-columns': columns > 1,
			'has-responsive-columns': columns > 1,
			[ `has-${ columns }-columns` ]: columns > 1,
			[ `has-${ gutter }-gutter` ]: gutter,
		} ),
	} );

	return (
		<div { ...blockProps } data-columns={ attributes.columns } itemScope itemType="http://schema.org/Menu">
			<InnerBlocks.Content />
		</div>
	);
}
