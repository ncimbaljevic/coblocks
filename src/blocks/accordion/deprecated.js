/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import metadata from './block.json';

const deprecated = [
	{
		attributes: {
			...metadata.attributes,
		},

		// v1 (apiVersion 1) markup, before the migration to `useBlockProps.save()`
		// for Block API v3. Kept so existing content continues to validate.
		save() {
			return (
				<div>
					<InnerBlocks.Content />
				</div>
			);
		},
	},
];

export default deprecated;
