/**
 * Internal dependencies
 */
import CoBlocksFieldLabel from '../field-label';

/**
 * WordPress dependencies
 */
import { TextControl } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';

function CoBlocksFieldWebsite( props ) {
	const { attributes, setAttributes, isSelected, name } = props;
	const { required, label, textColor, customTextColor } = attributes;

	const blockProps = useBlockProps();

	return (
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
			<TextControl
				type="url"
			/>
		</div>
	);
}

export default CoBlocksFieldWebsite;
