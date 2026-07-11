/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { BackgroundStyles, BackgroundClasses, BackgroundVideo } from '../../../components/background';

/**
 * WordPress dependencies
 */
import { InnerBlocks, getColorClassName, useBlockProps } from '@wordpress/block-editor';

const save = ( { attributes } ) => {
	const {
		coblocks,
		contentAlign,
		customTextColor,
		textColor,
		paddingSize,
	} = attributes;

	// Body color class and styles.
	const textClass = getColorClassName( 'color', textColor );

	let extraClasses = classnames( {
		[ `has-${ contentAlign }-content` ]: contentAlign,
	} );

	if ( coblocks && ( typeof coblocks.id !== 'undefined' ) ) {
		extraClasses = classnames( extraClasses, `coblocks-feature-${ coblocks.id }` );
	}

	const blockProps = useBlockProps.save( {
		className: extraClasses,
	} );

	const innerClasses = classnames(
		'wp-block-coblocks-feature__inner',
		...BackgroundClasses( attributes ), {
			'has-text-color': textColor || customTextColor,
			[ textClass ]: textClass,
			'has-padding': paddingSize && paddingSize !== 'no',
			[ `has-${ paddingSize }-padding` ]: paddingSize && ( paddingSize !== 'advanced' ),
		} );

	const innerStyles = {
		...BackgroundStyles( attributes ),
		color: textClass ? undefined : customTextColor,
	};

	return (
		<div { ...blockProps }>
			<div className={ innerClasses } style={ innerStyles }>
				{ BackgroundVideo( attributes ) }
				<InnerBlocks.Content />
			</div>
		</div>
	);
};

export default save;
