namespace app.viewport
{

	export class LayerPalette
	{
		private viewport:app.viewport.Viewport;

		private requiresInit = true;
		private $container:JQuery;
		private $button:JQuery;

		private $layerColumn:JQuery;
		private $subLayerColumn:JQuery;
		private $subLayerLabel:JQuery;

		private layers:LayerItem[] = [];
		private sublayers:LayerItem[] = [];

		private defaultLayer:LayerItem;
		private selectedLayer:LayerItem;

		private layerColumnScroll = 0;
		private subLayerColumnScroll = 0;

		private $dragColumn:JQuery;
		private dragY:number;

		constructor(viewport:Viewport)
		{
			this.viewport = viewport;

			this.$container = $('#layer-palette');
			this.$button = this.$container.find('.btn-show')
				.on('click', this.onShowButtonClick);

			if(Config.showLayerPalette)
			{
				this.show();
			}
		}

		private show()
		{
			this.$container.removeClass('hidden');

			if(this.requiresInit)
			{
				this.$container.find('.column.layers .heading')
					.on('click', this.onLayerHeadingClick);

				this.$layerColumn = this.$container.find('.column.layers .items');
				this.$subLayerColumn = this.$container.find('.column.sublayers .items');
				this.$subLayerLabel = this.$container.find('.column.sublayers span.layer-number');

				var columns = [this.$layerColumn, this.$subLayerColumn];
				for(var $column of columns)
				{
					$column
						.on('mousewheel', this.onLayerColumnMouseWheel)
						.on('click', 'i.btn-visible', this.onVisibilityIconClick)
						.on('click', 'i.btn-locked', this.onLockedIconClick)
						.on('click', 'div.layer', this.onLayerClick)
						.on('mousedown', this.onColumnMouseDown);
				}

				for(var layer = 0; layer <= MAX_LAYER; layer++)
				{
					const item = new LayerItem(layer, false);
					this.$layerColumn.append(item.$element);
					this.layers.push(item);

					if(layer == DEFAULT_LAYER)
					{
						this.defaultLayer = item;
					}

					const layerObj = this.viewport.getLayer(layer, -1);
					item.setVisible(layerObj.visible);
					item.setLocked(layerObj.locked);
				}

				for(var layer = 0; layer <= MAX_SUB_LAYER; layer++)
				{
					const item = new LayerItem(layer, true);
					this.$subLayerColumn.append(item.$element);
					this.sublayers.push(item);
				}

				this.setSelectedLayer(this.defaultLayer);

				this.$subLayerLabel.html(String(this.selectedLayer.layer));

				this.requiresInit = false;
			}

			this.$layerColumn.scrollTop(this.layerColumnScroll);
			this.$subLayerColumn.scrollTop(this.subLayerColumnScroll);
			Config.set('showLayerPalette', true);
		}

		private hide()
		{
			this.layerColumnScroll = this.$layerColumn.scrollTop();
			this.subLayerColumnScroll = this.$subLayerColumn.scrollTop();

			this.$container.addClass('hidden');
			Config.set('showLayerPalette', false);
		}

		private setSelectedLayer(layer:LayerItem)
		{
			if(!layer) layer = this.defaultLayer;

			if(layer.isSubLayer || layer == this.selectedLayer) return;

			if(this.selectedLayer)
			{
				this.selectedLayer.setSelected(false);
			}

			this.selectedLayer = layer;
			this.selectedLayer.setSelected(true);
			this.$subLayerLabel.html(String(this.selectedLayer.layer));

			for(var sublayer = 0; sublayer <= MAX_SUB_LAYER; sublayer++)
			{
				const item = this.sublayers[sublayer];
				const layerObj = this.viewport.getLayer(layer.layer, sublayer);
				item.setVisible(layerObj.visible);
				item.setLocked(layerObj.locked);
			}
		}

		private toggleAllLayers(locked:boolean|null, visible:boolean|null, onlySubLayers:boolean)
		{
			const end = onlySubLayers ? MAX_SUB_LAYER : MAX_LAYER;

			for(var i = 0; i <= end; i++)
			{
				const layerItem = (onlySubLayers ? this.sublayers : this.layers)[i];
				const layer = onlySubLayers ? this.selectedLayer.layer : i;
				const subLayer = onlySubLayers ? i : -1;

				const layerObj = this.viewport.getLayer(layer, subLayer);

				if(locked !== null)
				{
					layerItem.setLocked(locked);
					layerObj.locked = locked;
				}

				if(visible !== null)
				{
					layerItem.setVisible(visible);
					layerObj.visible = visible;
				}
			}
		}

		/*
		 * Events
		 */

		private onColumnMouseDown = (event) =>
		{
			if(event.button != 0) return;

			const $column = event.currentTarget == this.$layerColumn[0] ? this.$layerColumn : this.$subLayerColumn;
			var parentOffset = $column.offset();
			var relY = event.pageY - parentOffset.top;

			this.$dragColumn = $column;
			this.dragY = relY + $column.scrollTop();

			app.$window
				.on('mousemove', this.onDragScrollColumn)
				.on('mouseup', this.onDragScrollColumnUp);

			event.preventDefault();
			return false;
		};

		private onDragScrollColumn = (event) =>
		{
			var parentOffset = this.$dragColumn.offset();
			var relY = event.pageY - parentOffset.top;

			this.$dragColumn.scrollTop(this.dragY - relY);
		};

		private onDragScrollColumnUp = (event) =>
		{
			app.$window
				.off('mousemove', this.onDragScrollColumn)
				.off('mouseup', this.onDragScrollColumnUp);
		};

		private onLayerColumnMouseWheel = (event) =>
		{
			const $column = event.currentTarget == this.$layerColumn[0] ? this.$layerColumn : this.$subLayerColumn;
			$column.scrollTop($column.scrollTop() - event.originalEvent.wheelDelta);
		};

		private onShowButtonClick = () =>
		{
			this.show();
		};

		private onLayerHeadingClick = () =>
		{
			this.hide();
		};

		private onLayerClick = (event) =>
		{
			this.setSelectedLayer($(event.target).closest('.layer').data('layerItem'));
		};

		private onLockedIconClick = (event) =>
		{
			const layerItem:LayerItem = $(event.target).closest('.layer').data('layerItem');
			const isSubLayer = layerItem.isSubLayer;

			if(event.shiftKey)
			{
				this.toggleAllLayers(!layerItem.locked, null, isSubLayer);
			}
			else
			{
				layerItem.setLocked(!layerItem.locked);
				const layerObj = this.viewport.getLayer(
					isSubLayer ? this.selectedLayer.layer : layerItem.layer,
					isSubLayer ? layerItem.layer : -1);
				layerObj.locked = layerItem.locked;
			}

			event.preventDefault();
			return false;
		};

		private onVisibilityIconClick = (event) =>
		{
			const layerItem:LayerItem = $(event.target).closest('.layer').data('layerItem');
			const isSubLayer = layerItem.isSubLayer;

			if(event.shiftKey)
			{
				this.toggleAllLayers(null, !layerItem.visible, isSubLayer);
			}
			else
			{
				layerItem.setVisible(!layerItem.visible);
				const layerObj = this.viewport.getLayer(
					isSubLayer ? this.selectedLayer.layer : layerItem.layer,
					isSubLayer ? layerItem.layer : -1);
				layerObj.visible = layerItem.visible;
			}

			event.preventDefault();
			return false;
		};

	}

	class LayerItem
	{

		public $element:JQuery;
		public $visIcon:JQuery;
		public $lockIcon:JQuery;

		public layer:number;
		public visible = true;
		public locked = false;
		public isSubLayer:boolean;

		constructor(layer:number, isSubLayer:boolean)
		{
			this.layer = layer;
			this.isSubLayer = isSubLayer;

			this.$element = $(`
				<div class="layer">
					<div class="index">${layer}</div>
					<i class="fa fa-eye fa-fw btn btn-visible"></i>
					<i class="fa fa-lock fa-fw btn btn-locked"></i>
				</div>`)
				.data('layerItem', this);
			this.$visIcon = this.$element.find('.fa-eye');
			this.$lockIcon = this.$element.find('.fa-lock');
		}

		public setSelected(selected:boolean)
		{
			this.$element.toggleClass('selected', selected);
		}

		public setLocked(locked:boolean)
		{
			this.locked = locked;
			this.$lockIcon
				.toggleClass('fa-lock', locked)
				.toggleClass('fa-unlock-alt', !locked)
				.toggleClass('inactive', !locked);
		}

		public setVisible(visible:boolean)
		{
			this.visible = visible;
			this.$visIcon
				.toggleClass('fa-eye', visible)
				.toggleClass('fa-eye-slash', !visible)
				.toggleClass('inactive', visible)
		}

	}

}