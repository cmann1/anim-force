var app;
(function (app) {
    var viewport;
    (function (viewport_1) {
        var SettingsDlg = (function () {
            function SettingsDlg(viewport, $viewportContainer) {
                var _this = this;
                this.onDlgOpen = function (event) {
                    _this.$showFps.prop('checked', app.Config.showFps);
                    _this.$showControls.prop('checked', app.Config.showControls);
                    _this.$drawOutlines.prop('checked', app.Config.drawOutlines);
                    _this.$drawAABB.prop('checked', app.Config.drawAABB);
                    _this.$drawGrid.prop('checked', app.Config.drawGrid);
                    _this.$pixelHitTest.prop('checked', app.Config.pixelHitTest);
                };
                this.onInputChange = function (event) {
                    var type = event.target.id.replace('view-prop-', '');
                    app.Config.set(type, _this["$" + type].prop('checked'));
                    _this.viewport.requiresUpdate = true;
                };
                this.viewport = viewport;
                var $btn = $viewportContainer.find('i.settings-btn');
                this.$dlg = $('#viewport-properties-dlg');
                this.$showFps = this.$dlg.find('#view-prop-showFps');
                this.$showControls = this.$dlg.find('#view-prop-showControls');
                this.$drawOutlines = this.$dlg.find('#view-prop-drawOutlines');
                this.$drawAABB = this.$dlg.find('#view-prop-drawAABB');
                this.$drawGrid = this.$dlg.find('#view-prop-drawGrid');
                this.$pixelHitTest = this.$dlg.find('#view-prop-pixelHitTest');
                this.$dlg.find('input').on('change', this.onInputChange);
                this.dlg = new jBox('Modal', {
                    title: 'Viewport Settings',
                    attach: $btn,
                    overlay: false,
                    position: { x: 'right', y: 'top' },
                    offset: { y: -10 },
                    outside: 'y',
                    closeButton: true,
                    closeOnEsc: true,
                    closeOnClick: 'body',
                    content: this.$dlg,
                    target: $btn,
                    trigger: 'click',
                    onOpen: this.onDlgOpen
                });
                new jBox('Tooltip', {
                    attach: this.$dlg.find('label[title]'),
                    theme: 'TooltipDark'
                });
            }
            return SettingsDlg;
        }());
        viewport_1.SettingsDlg = SettingsDlg;
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=SettingsDlg.js.map