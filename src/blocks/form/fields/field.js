/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import CoBlocksFieldLabel from './field-label';

/**
 * WordPress dependencies
 */
import { TextControl } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';

function CoBlocksField( {
	isSelected,
	type,
	required,
	label,
	setAttributes,
	textColor,
	customTextColor,
	name,
} ) {
	const blockProps = useBlockProps( {
		className: classnames( 'coblocks-field', { 'is-selected': isSelected } ),
	} );

	return (
		<>
			<div { ...blockProps }>
				<CoBlocksFieldLabel
					required={ required }
					label={ label }
					setAttributes={ setAttributes }
					isSelected={ isSelected }
					textColor={ textColor }
					customTextColor={ customTextColor }
					name={ name }
				/>
				<TextControl type={ type } />
			</div>
		</>
	);
}

export default CoBlocksField;
