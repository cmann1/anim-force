var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var app;
(function (app) {
    var model;
    (function (model_1) {
        var ContainerNode = (function (_super) {
            __extends(ContainerNode, _super);
            function ContainerNode(name) {
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name) || this;
                _this.children = [];
                _this.childCount = 0;
                _this.canHaveChildren = true;
                return _this;
            }
            ContainerNode.prototype.getChildAt = function (index) {
                if (this.childCount == 0)
                    return null;
                if (index < 0)
                    index = 0;
                if (index >= this.childCount)
                    index = this.childCount - 1;
                return this.children[index];
            };
            ContainerNode.prototype.addChild = function (child, triggerEvent) {
                if (triggerEvent === void 0) { triggerEvent = true; }
                if (child.parent == this) {
                    return this;
                }
                var eventType = 'addChild';
                if (child.parent) {
                    child.parent.removeChild(child, false);
                    eventType = 'reParent';
                }
                child.model = this.model;
                child.parent = this;
                this.children.push(child);
                this.childCount++;
                if (triggerEvent) {
                    this.onStructureChange(eventType, this, child, this.childCount - 1);
                }
                return child;
            };
            ContainerNode.prototype.removeChild = function (child, triggerEvent) {
                if (triggerEvent === void 0) { triggerEvent = true; }
                if (child.parent == this) {
                    var index = this.children.indexOf(child);
                    child.setModel(null);
                    child.parent = null;
                    this.children.splice(index, 1);
                    this.childCount--;
                    if (triggerEvent) {
                        this.onStructureChange('removeChild', this, child, index);
                    }
                }
                return child;
            };
            ContainerNode.prototype.previous = function (node) {
                if (node === void 0) { node = null; }
                if (!node) {
                    if (!this.parent) {
                        return this;
                    }
                    return this.parent.previous(this);
                }
                if (node.parent != this)
                    return this;
                var index = this.children.indexOf(node) - 1;
                return index < 0
                    ? this
                    : this.children[index];
            };
            ContainerNode.prototype.next = function (node) {
                if (node === void 0) { node = null; }
                if (!node) {
                    if (this.childCount) {
                        return this.children[0];
                    }
                    if (!this.parent) {
                        return this;
                    }
                    return this.parent.next(this);
                }
                if (node.parent != this)
                    return this;
                var index = this.children.indexOf(node) + 1;
                return index >= this.childCount
                    ? this.parent ? this.parent.next(this) : this
                    : this.children[index];
            };
            ContainerNode.prototype.setModel = function (model) {
                _super.prototype.setModel.call(this, model);
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.setModel(model);
                }
            };
            ContainerNode.prototype.clear = function () {
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.setModel(null);
                }
                this.setSelected(null);
                this.children = [];
                this.childCount = 0;
                this.onStructureChange('clear', this, null, -1);
            };
            return ContainerNode;
        }(model_1.Node));
        model_1.ContainerNode = ContainerNode;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=ContainerNode.js.map