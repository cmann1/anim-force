///<reference path='../../lib/jquery.d.ts'/>

namespace app.ui
{
	export const enum SplitterOrientation
	{
		VERTICAL,
		HORIZONTAL
	}

	export const enum SplitterAnchor
	{
		FIRST,
		SECOND
	}

	export class Splitter
	{
		private $container:JQuery;
		private $first:JQuery;
		private $second:JQuery;
		private $bar:JQuery;
		private _orientation:SplitterOrientation;
		private anchor:SplitterAnchor;
		private position:number;

		private _barThickness = 6;

		private widthProp = 'width';
		private xProp = 'X';
		private leftProp = 'left';
		private rightProp = 'right';

		private dragOffset = 0;
		private id;

		// private

		constructor($first:JQuery, $second:JQuery, orientation:SplitterOrientation, defaultPosition:number, anchor:SplitterAnchor=SplitterAnchor.FIRST, id=null)
		{
			this.$container = $first.parent();
			this.$container.addClass('splitter-container');
			$first.addClass('splitter-partition');
			$second.addClass('splitter-partition');

			this.$bar = $('<div>')
				.addClass('splitter-bar')
				.on('mousedown', this.onMouseDown);
			this.$container.append(this.$bar);

			if(id != null)
			{
				this.id = 'splitter-' + id + '-position';
				var p = localStorage.getItem(this.id);
				if(p !== null)
				{
					defaultPosition = parseFloat(p);
				}
				else{
					localStorage.setItem(this.id, defaultPosition.toString());
				}
			}

			this.$first = $first;
			this.$second = $second;
			this.anchor = anchor;
			this.position = defaultPosition;

			this.orientation = orientation;
		}

		private update()
		{
			const thickness = this._barThickness * 0.5;

			if(this.position < 0)
			{
				this.position = 0;
			}
			else
			{
				const maxPosition = this.$container[this.widthProp]();
				if(this.position > maxPosition)
				{
					this.position = maxPosition;
				}
			}

			if(this.anchor == SplitterAnchor.FIRST)
			{
				this.$first.css(this.widthProp, this.position - thickness);
				this.$second.css(this.leftProp, this.position + thickness);
				this.$bar.css(this.leftProp, this.position - thickness);
			}
			else
			{
				this.$first.css(this.rightProp, this.position + thickness);
				this.$second.css(this.widthProp, this.position - thickness);
				this.$bar.css(this.rightProp, this.position - thickness);
			}

			this.$first.trigger('resize');
			this.$second.trigger('resize');
		}

		get orientation():SplitterOrientation
		{
			return this._orientation;
		}
		set orientation(value:SplitterOrientation)
		{
			this._orientation = value;

			const props = {left: '', right: '', top: '', bottom: '', width: '', height: ''};
			this.$first.css(props);
			this.$second.css(props);
			this.$bar.css(props);

			if(value == SplitterOrientation.HORIZONTAL)
			{
				this.xProp = 'X';
				this.widthProp = 'width';
				this.leftProp = 'left';
				this.rightProp = 'right';
				this.$first.css({top: 0, bottom: 0, left: 0});
				this.$second.css({top: 0, bottom: 0, right: 0});
				this.$bar.css({top: 0, bottom: 0, width: this._barThickness, cursor: 'col-resize'});
			}
			else
			{
				this.xProp = 'Y';
				this.widthProp = 'height';
				this.leftProp = 'top';
				this.rightProp = 'bottom';
				this.$first.css({left: 0, right: 0, top: 0});
				this.$second.css({left: 0, right: 0, bottom: 0});
				this.$bar.css({left: 0, right: 0, height: this._barThickness, cursor: 'row-resize'});
			}

			this.update();
		}

		get barThickness():number
		{
			return this._barThickness;
		}
		set barThickness(value:number)
		{
			this._barThickness = Math.ceil(value / 2) * 2;
			this.$bar.css(this.widthProp, this._barThickness);
			this.update();
		}

		/*
		 * Events
		 */

		protected onMouseDown = (event) =>
		{
			this.dragOffset = event[`offset${this.xProp}`] - this._barThickness * 0.5;
			$(window)
				.on('mousemove', this.onMouseMove)
				.on('mouseup', this.onMouseUp);

			event.preventDefault();
		};

		protected onMouseMove = (event) =>
		{
			var offset = this.$container.offset();
			var newPosition = event[`page${this.xProp}`] - offset[this.leftProp] - this.dragOffset;

			if(this.anchor == SplitterAnchor.SECOND)
			{
				newPosition = this.$container[this.widthProp]() - newPosition;
			}

			this.position = newPosition;
			this.update();
		};

		protected onMouseUp = (event) =>
		{
			$(window)
				.off('mousemove', this.onMouseMove)
				.off('mouseup', this.onMouseUp);

			if(this.id !== null)
			{
				localStorage.setItem(this.id, this.position.toString());
			}
		};

	}

}