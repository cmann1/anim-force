var app;
(function (app) {
    var properties;
    (function (properties) {
        var AngelScriptExporter = app.exporters.AngelScriptExporter;
        var SpriteGroupExporter = app.exporters.SpriteGroupExporter;
        var PropertiesPanel = (function () {
            function PropertiesPanel(model) {
                var _this = this;
                this.setModel(model);
                this.$panel = $('#properties-panel');
                // TODO: Remove
                this.$panel.find('button.btn-export-as').on('click', function (event) {
                    var out = (new AngelScriptExporter()).exportModel(_this.model);
                    // console.log(out);
                    if (event.shiftKey) {
                        Utils.copyToClipboard(out);
                        app.App.notice('Output copied to clipboard', 'blue');
                    }
                    else {
                        var blob = new Blob([out], { type: 'text/json;charset=utf-8' });
                        saveAs(blob, _this.model.name + '.cpp');
                    }
                });
                // TODO: Remove
                this.$panel.find('button.btn-export-spr').on('click', function () {
                    var out = (new SpriteGroupExporter()).exportModel(_this.model);
                    Utils.copyToClipboard(out);
                    app.App.notice('Output copied to clipboard', 'blue');
                });
            }
            PropertiesPanel.prototype.setModel = function (model) {
                if (model == this.model)
                    return;
                this.model = model;
            };
            return PropertiesPanel;
        }());
        properties.PropertiesPanel = PropertiesPanel;
    })(properties = app.properties || (app.properties = {}));
})(app || (app = {}));
//# sourceMappingURL=PropertiesPanel.js.map