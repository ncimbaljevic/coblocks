/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import metadata from './block.json';

/**
 * WordPress dependencies
 */
import { getColorClassName } from '@wordpress/block-editor';

const deprecated = [
	{
		attributes: {
			...metadata.attributes,
		},

		// v1 (apiVersion 1) markup, before the migration to `useBlockProps.save()`
		// for Block API v3. Kept so existing content continues to validate.
		save( { attributes, className } ) {
			const {
				color,
				customColor,
				height,
			} = attributes;

			const colorClass = getColorClassName( 'color', color );

			const classes = classnames(
				className, {
					'has-background': color || customColor,
					[ colorClass ]: colorClass,
				} );

			const styles = {
				color: colorClass ? undefined : customColor,
				height: height ? height + 'px' : undefined,
			};

			return (
				<hr className={ classes } style={ styles }></hr>
			);
		},
	},
	{
		attributes: {
			...metadata.attributes,
		},

		save( { attributes, className } ) {
			const {
				color,
				customColor,
				height,
			} = attributes;

			const colorClass = getColorClassName( 'color', color );

			const classes = classnames(
				className, {
					'has-text-color': color || customColor,
					[ colorClass ]: colorClass,
				} );

			const styles = {
				color: colorClass ? undefined : customColor,
				height: height ? height + 'px' : undefined,
			};

			return (
				<hr className={ classes } style={ styles }></hr>
			);
		},
	},
];

export default deprecated;
