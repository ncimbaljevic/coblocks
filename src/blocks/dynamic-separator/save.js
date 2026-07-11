/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { getColorClassName, useBlockProps } from '@wordpress/block-editor';

const save = ( { attributes } ) => {
	const {
		color,
		customColor,
		height,
	} = attributes;

	const colorClass = getColorClassName( 'color', color );

	const blockProps = useBlockProps.save( {
		className: classnames( {
			'has-background': color || customColor,
			[ colorClass ]: colorClass,
		} ),
		style: {
			color: colorClass ? undefined : customColor,
			height: height ? height + 'px' : undefined,
		},
	} );

	return (
		<hr { ...blockProps }></hr>
	);
};

export default save;
