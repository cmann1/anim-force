/**
 * jBox is a jQuery plugin that makes it easy to create customizable tooltips, modal windows, image galleries and more.
 * Author: Stephan Wagner (https://stephanwagner.me)
 * License: MIT (https://opensource.org/licenses/MIT)
 * Requires: jQuery 3.2.1 (https://code.jquery.com/jquery-3.2.1.min.js)
 * Documentation: https://stephanwagner.me/jBox/documentation
 * Demos: https://stephanwagner.me/jBox/demos
 */
declare class jBox
{

	options:any;
	wrapper:JQuery;
	content:JQuery;

	constructor(type:string, options?:any);

	// Attach jBox to elements
	attach(elements?, trigger?);

	// Detach jBox from elements
	detach(elements?);

	// Set title
	setTitle(title:string, ignore_positioning?);

	// Set content
	setContent(content, ignore_positioning?);

	// Set jBox dimensions
	setDimensions(type, value?, pos?);

	// Set jBox width or height
	setWidth(value, pos?:boolean);

	setHeight(value, pos?:boolean);

	// Position jBox
	position(options?:any);

	// Open jBox
	open(options?:any);

	// Close jBox
	close(options?:any);

	// Open or close jBox
	toggle(options?:any);

	// Block opening and closing
	disable();

	// Unblock opening and closing
	enable();

	// Hide jBox
	hide();

	// Show jBox
	show();

	// Get content from ajax
	ajax(options?:any, opening?:boolean);

	// Play an audio file
	audio(url, volume?);

	// Apply custom animations to jBox
	animate(animation, options?:any);

	// Destroy jBox and remove it from DOM
	destroy();

	// Function to create jBox plugins
	static plugin(type, options?:any);

}