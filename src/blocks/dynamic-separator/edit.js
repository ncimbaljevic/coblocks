/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Inspector from './inspector';
import applyWithColors from './colors';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { ResizableBox } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Block edit function
 *
 * @param {Object} props
 */
const DynamicSeparatorEdit = ( props ) => {
	const {
		attributes: {
			height,
		},
		className,
		isSelected,
		setAttributes,
		color,
	} = props;

	const blockProps = useBlockProps( {
		className: classnames( className, {
			'is-selected': isSelected,
			'has-background': color.color,
			[ color.class ]: color.class,
		} ),
		style: {
			color: color.color,
		},
	} );

	return (
		<>
			{ isSelected && <Inspector { ...props } /> }
			{ /*
			 * `useBlockProps` must own a stable DOM root that stays mounted for the
			 * block's lifetime. Spreading it directly onto `<ResizableBox>` made
			 * re-resizable the block root, and in WP 7.0's iframed editor it reads
			 * `ownerDocument.defaultView` on that node and threw a TypeError. Keep the
			 * block root a plain `<div>` and render `<ResizableBox>` inside it.
			 */ }
			<div { ...blockProps }>
				<ResizableBox
					size={ {
						height,
					} }
					minHeight="20"
					enable={ {
						top: false,
						right: false,
						bottom: true,
						left: false,
						topRight: false,
						bottomRight: false,
						bottomLeft: false,
						topLeft: false,
					} }
					onResizeStop={ ( _event, _direction, _elt, delta ) => {
						const spacerHeight = parseInt( height + delta.height, 10 );
						setAttributes( {
							height: spacerHeight,
						} );
					} }
					showHandle={ isSelected }
				/>
			</div>
		</>
	);
};

export default compose( [ applyWithColors ] )( DynamicSeparatorEdit );
