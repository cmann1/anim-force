var app;
(function (app) {
    var ui;
    (function (ui) {
        var SpriteSelector = (function () {
            function SpriteSelector() {
                var _this = this;
                this.scrollTop = 0;
                this.onHeadingClick = function (event) {
                    $(event.currentTarget).next().toggleClass('collapsed');
                    _this.modal.position();
                };
                this.onSpriteClick = function (event) {
                    var $sprite = $(event.currentTarget);
                    var spriteGroup = $sprite.data('group');
                    var spriteName = $sprite.data('sprite');
                    if (_this.callback) {
                        _this.callback(spriteGroup, spriteName);
                    }
                    _this.hide();
                };
                this.onDialogOpen = function (event) {
                    _this.modal.position();
                    _this.modal.content.scrollTop(_this.scrollTop);
                };
                this.onDialogPosition = function (event) {
                    _this.modal.content.scrollTop(_this.scrollTop);
                };
                this.onDialogClose = function (event) {
                    _this.scrollTop = _this.modal.content.scrollTop();
                };
            }
            SpriteSelector.prototype.show = function (callback) {
                var _this = this;
                if (callback === void 0) { callback = null; }
                if (!this.modal) {
                    this.init();
                }
                this.callback = callback;
                this.modal.open();
                setTimeout(function () { _this.modal.position(); }, 100);
            };
            SpriteSelector.prototype.hide = function () {
                this.modal.close();
            };
            SpriteSelector.prototype.init = function () {
                this.$container = $('#sprite_selector');
                this.$container
                    .on('click', '.sprite-group', this.onHeadingClick)
                    .on('click', '.thumb-outer', this.onSpriteClick);
                var spriteList = app.main.spriteManager.getSpriteList();
                for (var _i = 0, spriteList_1 = spriteList; _i < spriteList_1.length; _i++) {
                    var groupData = spriteList_1[_i];
                    var groupName = groupData['name'];
                    var spriteList_2 = groupData['sprites'];
                    var $group = $("<div class=\"sprite-group spr-tooltip\" title=\"" + groupName + "\">\n\t\t\t\t\t\t<img src=\"assets/sprites/" + groupName + "/_group_thumb.png\" alt=\"\">\n\t\t\t\t\t</div>");
                    var $content = this.$content = $('<div class="content collapsed"></div>');
                    var thumbX = 0;
                    for (var _a = 0, spriteList_3 = spriteList_2; _a < spriteList_3.length; _a++) {
                        var spriteData = spriteList_3[_a];
                        var $thumb = $("<div class=\"thumb-outer spr-tooltip\" title=\"" + spriteData.name + " p[" + spriteData.palettes + "] f[" + spriteData.frames + "]\" data-group=\"" + groupName + "\" data-sprite=\"" + spriteData.name + "\">\n\t\t\t\t\t\t\t<div class=\"thumb\" style=\"background: url('assets/sprites/" + groupName + "/_thumb.png') " + -thumbX + "px 0\"></div>\n\t\t\t\t\t\t</div>");
                        $content.append($thumb);
                        thumbX += 42;
                    }
                    this.$container.append($group);
                    this.$container.append($content);
                }
                new jBox('Tooltip', {
                    attach: '.spr-tooltip',
                    theme: 'TooltipDark'
                });
                this.modal = new jBox('Modal', {
                    title: '<i class="fa fa-image fa-2x"></i> Sprite Selector',
                    content: this.$container,
                    isolateScroll: false,
                    onOpen: this.onDialogOpen,
                    onPosition: this.onDialogPosition,
                    onClose: this.onDialogClose,
                });
            };
            return SpriteSelector;
        }());
        ui.SpriteSelector = SpriteSelector;
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));
//# sourceMappingURL=SpriteSelector.js.map