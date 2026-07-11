/**
 * WordPress dependencies.
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save();

	return (
		<div
			{ ...blockProps }
			itemScope
			itemType="https://schema.org/FAQPage">
			<InnerBlocks.Content />
		</div>
	);
}
