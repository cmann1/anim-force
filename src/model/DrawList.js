var app;
(function (app) {
    var model;
    (function (model) {
        var DrawList = (function () {
            function DrawList() {
                this.list = [];
            }
            DrawList.prototype.add = function (node) {
                node.drawIndex = this.list.length;
                this.list.push(node);
            };
            DrawList.prototype.clear = function () {
                this.list = [];
            };
            return DrawList;
        }());
        model.DrawList = DrawList;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=DrawList.js.map