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
        var AABB = app.viewport.AABB;
        var ContainerNode = (function (_super) {
            __extends(ContainerNode, _super);
            function ContainerNode(name) {
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name) || this;
                _this.children = [];
                _this.childCount = 0;
                _this.worldEndPointX = 0;
                _this.worldEndPointY = 0;
                _this.childrenWorldAABB = new AABB();
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
                    return child;
                }
                if (child.parent) {
                    child.parent.removeChild(child, false);
                    child.rotation = child.worldRotation - this.worldRotation;
                    var local = this.globalToLocal(child.worldX - this.worldEndPointX + this.worldX, child.worldY - this.worldEndPointY + this.worldY);
                    child.offsetX = local.x / this.stretchX;
                    child.offsetY = local.y / this.stretchY;
                }
                child.setModel(this.model);
                child.parent = this;
                this.children.push(child);
                this.childCount++;
                if (triggerEvent) {
                    this.onStructureChange('addChild', this, child, this.childCount - 1, null);
                }
                return child;
            };
            ContainerNode.prototype.addChildBefore = function (child, sibling) {
                if (!sibling)
                    return this.addChild(child);
                if (sibling.parent != this)
                    return child;
                if (child.parent == this && this.children.indexOf(child) == this.children.indexOf(sibling) - 1)
                    return;
                if (child.parent) {
                    if (child.parent == this) {
                        this.children.splice(this.children.indexOf(child), 1);
                    }
                    else {
                        child.rotation = child.worldRotation - this.worldRotation;
                        var local = this.globalToLocal(child.worldX - this.worldEndPointX + this.worldX, child.worldY - this.worldEndPointY + this.worldY);
                        child.offsetX = local.x / this.stretchX;
                        child.offsetY = local.y / this.stretchY;
                        child.parent.removeChild(child, false);
                        this.childCount++;
                    }
                }
                child.parent = this;
                child.setModel(this.model);
                this.children.splice(this.children.indexOf(sibling), 0, child);
                this.onStructureChange('addChild', this, child, this.children.indexOf(child), sibling);
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
                        this.onStructureChange('removeChild', this, child, index, null);
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
                if (index < 0)
                    return this;
                var previous = this.children[index];
                if (previous instanceof ContainerNode) {
                    return previous.childCount ? previous.children[previous.childCount - 1] : previous;
                }
                return previous;
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
            ContainerNode.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                if (this.childrenWorldAABB.contains(x, y)) {
                    for (var i = this.childCount - 1; i >= 0; i--) {
                        var child = this.children[i];
                        if (child.hitTest(x, y, worldScaleFactor, result)) {
                            return true;
                        }
                    }
                }
                return _super.prototype.hitTest.call(this, x, y, worldScaleFactor, result);
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
                this.onStructureChange('clear', this, null, -1, null);
            };
            return ContainerNode;
        }(model_1.Node));
        model_1.ContainerNode = ContainerNode;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=ContainerNode.js.map