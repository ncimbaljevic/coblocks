/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { className, externalCalendarUrl, showCarousel } = attributes;

	const classes = classnames( className, 'wp-block-coblocks-front-events-swiper-container' );

	const blockProps = useBlockProps.save( { className: 'wp-block-coblocks-events-front-container' } );

	return ! externalCalendarUrl && (
		<div { ...blockProps }>
			<div className={ classes }>
				<div className={ showCarousel ? 'swiper-wrapper-loading' : '' }>
					<InnerBlocks.Content />
				</div>
			</div>
			<button className={ `wp-coblocks-events-nav-button__prev` } id={ `wp-coblocks-event-swiper-prev` } style={ { visibility: 'hidden' } } />
			<button className={ `wp-coblocks-events-nav-button__next` } id={ `wp-coblocks-event-swiper-next` } style={ { visibility: 'hidden' } } />
		</div>
	);
}
