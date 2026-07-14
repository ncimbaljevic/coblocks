/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import metadata from './block.json';

/**
 * WordPress dependencies.
 */
import { InnerBlocks } from '@wordpress/block-editor';

const deprecated = [
	{
		attributes: {
			...metadata.attributes,
		},
		save( { attributes } ) {
			const { className, externalCalendarUrl, showCarousel } = attributes;

			const classes = classnames( className, 'wp-block-coblocks-front-events-swiper-container' );

			return ! externalCalendarUrl && (
				<div className="wp-block-coblocks-events-front-container">
					<div className={ classes }>
						<div className={ showCarousel ? 'swiper-wrapper-loading' : '' }>
							<InnerBlocks.Content />
						</div>
					</div>
					<button className={ `wp-coblocks-events-nav-button__prev` } id={ `wp-coblocks-event-swiper-prev` } style={ { visibility: 'hidden' } } />
					<button className={ `wp-coblocks-events-nav-button__next` } id={ `wp-coblocks-event-swiper-next` } style={ { visibility: 'hidden' } } />
				</div>
			);
		},
	},
	{
		attributes: {
			...metadata.attributes,
		},
		save( { attributes } ) {
			const { className, externalCalendarUrl } = attributes;

			return ! externalCalendarUrl && (
				<div className={ className }>
					<InnerBlocks.Content />
				</div>
			);
		},
	},
];

export default deprecated;
