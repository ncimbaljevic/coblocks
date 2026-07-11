/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import GutterWrapper from '../../components/gutter-control/gutter-wrapper';

/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const save = ( { attributes } ) => {
	const {
		contentAlign,
		count,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: classnames(
			{
				[ `has-text-align-${ contentAlign }` ]: contentAlign,
			}
		),
	} );

	const innerClasses = classnames( 'wp-block-coblocks-pricing-table__inner',
		{
			'has-columns': count > 1,
			[ `has-${ count }-columns` ]: count,
			'has-responsive-columns': count > 1,
		}
	);

	return (
		<div { ...blockProps }>
			<GutterWrapper { ...attributes } >
				<div className={ innerClasses }>
					<InnerBlocks.Content />
				</div>
			</GutterWrapper>
		</div>
	);
};

export default save;
