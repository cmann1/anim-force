var app;
(function (app) {
    var viewport;
    (function (viewport_1) {
        var SettingsDlg = (function () {
            function SettingsDlg(viewport, $viewportContainer) {
                var _this = this;
                this.onDlgOpen = function (event) {
                    _this.$showFps.prop('checked', app.Config.showFps);
                    _this.$showControls.prop('checked', app.Config.drawControls);
                    _this.$showAABB.prop('checked', app.Config.drawAABB);
                };
                this.onInputChange = function (event) {
                    var type = event.target.id.replace('view-prop-', '');
                    if (type == 'show-fps') {
                        _this.viewport.toggleFps(_this.$showFps.prop('checked'));
                    }
                    else if (type == 'show-controls') {
                        app.Config.drawControls = _this.$showControls.prop('checked');
                    }
                    else if (type == 'show-aabb') {
                        app.Config.drawAABB = _this.$showAABB.prop('checked');
                    }
                    _this.viewport.requiresUpdate = true;
                };
                this.viewport = viewport;
                var $btn = $viewportContainer.find('i.settings-btn');
                this.$dlg = $('#viewport-properties-dlg');
                this.$showFps = this.$dlg.find('#view-prop-show-fps');
                this.$showControls = this.$dlg.find('#view-prop-show-controls');
                this.$showAABB = this.$dlg.find('#view-prop-show-aabb');
                this.$dlg.find('input').on('change', this.onInputChange);
                this.dlg = new jBox('Modal', {
                    title: 'Viewport Settings',
                    attach: $btn,
                    overlay: false,
                    position: { x: 'right', y: 'top' },
                    offset: { y: -10 },
                    outside: 'y',
                    closeButton: false,
                    closeOnEsc: true,
                    closeOnClick: 'body',
                    content: this.$dlg,
                    target: $btn,
                    trigger: 'click',
                    onOpen: this.onDlgOpen
                });
            }
            return SettingsDlg;
        }());
        viewport_1.SettingsDlg = SettingsDlg;
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=SettingsDlg.js.map