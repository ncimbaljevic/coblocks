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
		contentAlign,
		isStackedOnMobile,
	} = attributes;

	const blockProps = useBlockProps.save();

	const innerClasses = classnames(
		'wp-block-coblocks-buttons__inner', {
			[ `flex-align-${ contentAlign }` ]: contentAlign,
			'is-stacked-on-mobile': isStackedOnMobile,
		}
	);

	return (
		<div { ...blockProps }>
			<div className={ innerClasses }>
				<InnerBlocks.Content />
			</div>
		</div>
	);
}
