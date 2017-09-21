var app;
(function (app) {
    var viewport;
    (function (viewport_1) {
        var LayerPalette = (function () {
            function LayerPalette(viewport) {
                var _this = this;
                this.requiresInit = true;
                this.layers = [];
                this.sublayers = [];
                this.layerColumnScroll = 0;
                this.subLayerColumnScroll = 0;
                /*
                 * Events
                 */
                this.onColumnMouseDown = function (event) {
                    if (event.button != 0)
                        return;
                    var $column = event.currentTarget == _this.$layerColumn[0] ? _this.$layerColumn : _this.$subLayerColumn;
                    var parentOffset = $column.offset();
                    var relY = event.pageY - parentOffset.top;
                    _this.$dragColumn = $column;
                    _this.dragY = relY + $column.scrollTop();
                    app.$window
                        .on('mousemove', _this.onDragScrollColumn)
                        .on('mouseup', _this.onDragScrollColumnUp);
                    event.preventDefault();
                    return false;
                };
                this.onDragScrollColumn = function (event) {
                    var parentOffset = _this.$dragColumn.offset();
                    var relY = event.pageY - parentOffset.top;
                    _this.$dragColumn.scrollTop(_this.dragY - relY);
                };
                this.onDragScrollColumnUp = function (event) {
                    app.$window
                        .off('mousemove', _this.onDragScrollColumn)
                        .off('mouseup', _this.onDragScrollColumnUp);
                };
                this.onLayerColumnMouseWheel = function (event) {
                    var $column = event.currentTarget == _this.$layerColumn[0] ? _this.$layerColumn : _this.$subLayerColumn;
                    $column.scrollTop($column.scrollTop() - event.originalEvent.wheelDelta);
                };
                this.onShowButtonClick = function () {
                    _this.show();
                };
                this.onLayerHeadingClick = function () {
                    _this.hide();
                };
                this.onLayerClick = function (event) {
                    _this.setSelectedLayer($(event.target).closest('.layer').data('layerItem'));
                };
                this.onLockedIconClick = function (event) {
                    var layerItem = $(event.target).closest('.layer').data('layerItem');
                    var isSubLayer = layerItem.isSubLayer;
                    if (event.shiftKey) {
                        _this.toggleAllLayers(!layerItem.locked, null, isSubLayer);
                    }
                    else {
                        layerItem.setLocked(!layerItem.locked);
                        var layerObj = _this.viewport.getLayer(isSubLayer ? _this.selectedLayer.layer : layerItem.layer, isSubLayer ? layerItem.layer : -1);
                        layerObj.locked = layerItem.locked;
                    }
                    event.preventDefault();
                    return false;
                };
                this.onVisibilityIconClick = function (event) {
                    var layerItem = $(event.target).closest('.layer').data('layerItem');
                    var isSubLayer = layerItem.isSubLayer;
                    if (event.shiftKey) {
                        _this.toggleAllLayers(null, !layerItem.visible, isSubLayer);
                    }
                    else {
                        layerItem.setVisible(!layerItem.visible);
                        var layerObj = _this.viewport.getLayer(isSubLayer ? _this.selectedLayer.layer : layerItem.layer, isSubLayer ? layerItem.layer : -1);
                        layerObj.visible = layerItem.visible;
                    }
                    event.preventDefault();
                    return false;
                };
                this.viewport = viewport;
                this.$container = $('#layer-palette');
                this.$button = this.$container.find('.btn-show')
                    .on('click', this.onShowButtonClick);
                if (app.Config.showLayerPalette) {
                    this.show();
                }
            }
            LayerPalette.prototype.show = function () {
                this.$container.removeClass('hidden');
                if (this.requiresInit) {
                    this.$container.find('.column.layers .heading')
                        .on('click', this.onLayerHeadingClick);
                    this.$layerColumn = this.$container.find('.column.layers .items');
                    this.$subLayerColumn = this.$container.find('.column.sublayers .items');
                    this.$subLayerLabel = this.$container.find('.column.sublayers span.layer-number');
                    var columns = [this.$layerColumn, this.$subLayerColumn];
                    for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
                        var $column = columns_1[_i];
                        $column
                            .on('mousewheel', this.onLayerColumnMouseWheel)
                            .on('click', 'i.btn-visible', this.onVisibilityIconClick)
                            .on('click', 'i.btn-locked', this.onLockedIconClick)
                            .on('click', 'div.layer', this.onLayerClick)
                            .on('mousedown', this.onColumnMouseDown);
                    }
                    for (var layer = 0; layer <= MAX_LAYER; layer++) {
                        var item = new LayerItem(layer, false);
                        this.$layerColumn.append(item.$element);
                        this.layers.push(item);
                        if (layer == DEFAULT_LAYER) {
                            this.defaultLayer = item;
                        }
                        var layerObj = this.viewport.getLayer(layer, -1);
                        item.setVisible(layerObj.visible);
                        item.setLocked(layerObj.locked);
                    }
                    for (var layer = 0; layer <= MAX_SUB_LAYER; layer++) {
                        var item = new LayerItem(layer, true);
                        this.$subLayerColumn.append(item.$element);
                        this.sublayers.push(item);
                    }
                    this.setSelectedLayer(this.defaultLayer);
                    this.$subLayerLabel.html(String(this.selectedLayer.layer));
                    this.requiresInit = false;
                }
                this.$layerColumn.scrollTop(this.layerColumnScroll);
                this.$subLayerColumn.scrollTop(this.subLayerColumnScroll);
                app.Config.set('showLayerPalette', true);
            };
            LayerPalette.prototype.hide = function () {
                this.layerColumnScroll = this.$layerColumn.scrollTop();
                this.subLayerColumnScroll = this.$subLayerColumn.scrollTop();
                this.$container.addClass('hidden');
                app.Config.set('showLayerPalette', false);
            };
            LayerPalette.prototype.setSelectedLayer = function (layer) {
                if (!layer)
                    layer = this.defaultLayer;
                if (layer.isSubLayer || layer == this.selectedLayer)
                    return;
                if (this.selectedLayer) {
                    this.selectedLayer.setSelected(false);
                }
                this.selectedLayer = layer;
                this.selectedLayer.setSelected(true);
                this.$subLayerLabel.html(String(this.selectedLayer.layer));
                for (var sublayer = 0; sublayer <= MAX_SUB_LAYER; sublayer++) {
                    var item = this.sublayers[sublayer];
                    var layerObj = this.viewport.getLayer(layer.layer, sublayer);
                    item.setVisible(layerObj.visible);
                    item.setLocked(layerObj.locked);
                }
            };
            LayerPalette.prototype.toggleAllLayers = function (locked, visible, onlySubLayers) {
                var end = onlySubLayers ? MAX_SUB_LAYER : MAX_LAYER;
                for (var i = 0; i <= end; i++) {
                    var layerItem = (onlySubLayers ? this.sublayers : this.layers)[i];
                    var layer = onlySubLayers ? this.selectedLayer.layer : i;
                    var subLayer = onlySubLayers ? i : -1;
                    var layerObj = this.viewport.getLayer(layer, subLayer);
                    if (locked !== null) {
                        layerItem.setLocked(locked);
                        layerObj.locked = locked;
                    }
                    if (visible !== null) {
                        layerItem.setVisible(visible);
                        layerObj.visible = visible;
                    }
                }
            };
            return LayerPalette;
        }());
        viewport_1.LayerPalette = LayerPalette;
        var LayerItem = (function () {
            function LayerItem(layer, isSubLayer) {
                this.visible = true;
                this.locked = false;
                this.layer = layer;
                this.isSubLayer = isSubLayer;
                this.$element = $("\n\t\t\t\t<div class=\"layer\">\n\t\t\t\t\t<div class=\"index\">" + layer + "</div>\n\t\t\t\t\t<i class=\"fa fa-eye fa-fw btn btn-visible\"></i>\n\t\t\t\t\t<i class=\"fa fa-lock fa-fw btn btn-locked\"></i>\n\t\t\t\t</div>")
                    .data('layerItem', this);
                this.$visIcon = this.$element.find('.fa-eye');
                this.$lockIcon = this.$element.find('.fa-lock');
            }
            LayerItem.prototype.setSelected = function (selected) {
                this.$element.toggleClass('selected', selected);
            };
            LayerItem.prototype.setLocked = function (locked) {
                this.locked = locked;
                this.$lockIcon
                    .toggleClass('fa-lock', locked)
                    .toggleClass('fa-unlock-alt', !locked)
                    .toggleClass('inactive', !locked);
            };
            LayerItem.prototype.setVisible = function (visible) {
                this.visible = visible;
                this.$visIcon
                    .toggleClass('fa-eye', visible)
                    .toggleClass('fa-eye-slash', !visible)
                    .toggleClass('inactive', visible);
            };
            return LayerItem;
        }());
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=LayerPalette.js.map