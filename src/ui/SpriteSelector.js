var app;
(function (app) {
    var ui;
    (function (ui) {
        var SpriteSelector = (function () {
            function SpriteSelector() {
                var _this = this;
                this.onHeadingClick = function (event) {
                    $(event.currentTarget).parent().toggleClass('collapsed');
                    // this.modal.position();
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
            }
            SpriteSelector.prototype.show = function (callback) {
                if (callback === void 0) { callback = null; }
                if (!this.modal) {
                    this.init();
                }
                this.callback = callback;
                this.modal.open();
            };
            SpriteSelector.prototype.hide = function () {
                this.modal.close();
            };
            SpriteSelector.prototype.init = function () {
                this.$container = $('#sprite_selector');
                this.$container
                    .on('click', '.heading', this.onHeadingClick)
                    .on('click', '.thumb-outer', this.onSpriteClick);
                var spriteList = app.main.spriteManager.getSpriteList();
                for (var _i = 0, spriteList_1 = spriteList; _i < spriteList_1.length; _i++) {
                    var groupData = spriteList_1[_i];
                    var groupName = groupData['name'];
                    var spriteList_2 = groupData['sprites'];
                    var $group = $("<div class=\"sprite_group collapsed\">\n\t\t\t\t\t\t<div class=\"heading\">\n\t\t\t\t\t\t\t<i class=\"fa fold-icon\"></i>\n\t\t\t\t\t\t\t<img src=\"assets/sprites/" + groupName + "/_group_thumb.png\" alt=\"\">\n\t\t\t\t\t\t\t<span>" + groupName.toTitleCase() + "</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"content\"></div>\n\t\t\t\t\t</div>");
                    var $content = $group.find('.content');
                    var thumbX = 0;
                    for (var _a = 0, spriteList_3 = spriteList_2; _a < spriteList_3.length; _a++) {
                        var spriteName = spriteList_3[_a];
                        var $thumb = $("<div class=\"thumb-outer spr-tooltip\" title=\"" + spriteName + "\" data-group=\"" + groupName + "\" data-sprite=\"" + spriteName + "\">\n\t\t\t\t\t\t\t<div class=\"thumb\" style=\"background: url('assets/sprites/" + groupName + "/_thumb.png') " + -thumbX + "px 0\"></div>\n\t\t\t\t\t\t</div>");
                        $content.append($thumb);
                        thumbX += 42;
                    }
                    this.$container.append($group);
                }
                new jBox('Tooltip', {
                    attach: '.spr-tooltip',
                    theme: 'TooltipDark'
                });
                this.modal = new jBox('Modal', {
                    title: '<i class="fa fa-image fa-2x"></i> Sprite Selector',
                    content: this.$container,
                    isolateScroll: false
                });
            };
            return SpriteSelector;
        }());
        ui.SpriteSelector = SpriteSelector;
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));
//# sourceMappingURL=SpriteSelector.js.map