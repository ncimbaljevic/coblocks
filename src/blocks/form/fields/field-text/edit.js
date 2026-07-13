/**
 * Internal dependencies
 */
import CoBlocksFieldLabel from '../field-label';

/**
 * WordPress dependencies
 */
import { TextControl } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';

function CoBlocksFieldTextControl( props ) {
	const { attributes, setAttributes, isSelected, name } = props;
	const { required, label, textColor, customTextColor } = attributes;

	const blockProps = useBlockProps( { className: 'coblocks-field' } );

	return (
		<>
			<div { ...blockProps }>
				<CoBlocksFieldLabel
					required={ required }
					label={ label }
					setAttributes={ setAttributes }
					isSelected={ isSelected }
					name={ name }
					textColor={ textColor }
					customTextColor={ customTextColor }
				/>
				<TextControl />
			</div>
		</>
	);
}

export default CoBlocksFieldTextControl;
