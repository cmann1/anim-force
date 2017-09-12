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
    (function (model) {
        var EventDispatcher = app.events.EventDispatcher;
        var StructureChangeEvent = model.events.StructureChangeEvent;
        var SelectionEvent = model.events.SelectionEvent;
        var Event = app.events.Event;
        var EditMode;
        (function (EditMode) {
            EditMode[EditMode["EDIT"] = 0] = "EDIT";
            EditMode[EditMode["ANIMATE"] = 1] = "ANIMATE";
            EditMode[EditMode["PLAYBACK"] = 2] = "PLAYBACK";
        })(EditMode = model.EditMode || (model.EditMode = {}));
        var Model = (function (_super) {
            __extends(Model, _super);
            function Model() {
                var _this = _super.call(this, 'Unnamed Model') || this;
                _this.nextAnimationId = 0;
                _this.selectedNode = null;
                _this.highlightedNode = null;
                _this.drawList = new model.DrawList();
                _this._mode = EditMode.EDIT;
                _this.bindPose = new app.anim.Animation('None', _this, true);
                _this.animations = {};
                _this.activeAnimation = null;
                _this.animationList = null;
                /// Events
                _this.modeChange = new EventDispatcher();
                _this.selectionChange = new EventDispatcher();
                _this.animationChange = new EventDispatcher();
                _this.nodeDrawOrder = function (a, b) {
                    if (a.layer < b.layer || b == _this.selectedNode) {
                        return -1;
                    }
                    if (a.layer > b.layer || a == _this.selectedNode) {
                        return 1;
                    }
                    if (a.subLayer < b.subLayer || b == _this.selectedNode) {
                        return -1;
                    }
                    if (a.subLayer > b.subLayer || a == _this.selectedNode) {
                        return 1;
                    }
                    return a.drawIndex - b.drawIndex;
                };
                _this.model = _this;
                _this.type = 'model';
                _this.bindPose.active = true;
                _this.activeAnimation = _this.bindPose;
                return _this;
            }
            Model.prototype.draw = function (ctx, worldScale) {
                console.error('Use drawModel instead');
            };
            Model.prototype.prepareChildren = function () {
                this.drawList.clear();
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.prepareForDrawing(0, 0, 1, 1, 1, 0, null, null);
                }
            };
            Model.prototype.drawModel = function (ctx, worldScale, viewport) {
                this.drawList.clear();
                var i = 0;
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.prepareForDrawing(0, 0, worldScale, 1, 1, 0, this.drawList, viewport);
                    if (i++ == 0) {
                        this.childrenWorldAABB.from(child.worldAABB);
                    }
                    else {
                        this.childrenWorldAABB.union(child.worldAABB);
                    }
                }
                this.worldAABB.from(this.childrenWorldAABB);
                ctx.save();
                var drawList = this.drawList.list;
                drawList.sort(this.nodeDrawOrder);
                for (var _b = 0, drawList_1 = drawList; _b < drawList_1.length; _b++) {
                    var node = drawList_1[_b];
                    node.draw(ctx, worldScale);
                }
                ctx.restore();
                ctx.save();
                if (app.Config.drawControls) {
                    for (var _c = 0, _d = this.children; _c < _d.length; _c++) {
                        var child = _d[_c];
                        if (child != this.selectedNode && child.worldAABB.intersects(viewport)) {
                            child.drawControls(ctx, worldScale, viewport);
                        }
                    }
                    if (this.selectedNode && this.selectedNode.worldAABB.intersects(viewport)) {
                        this.selectedNode.drawControls(ctx, worldScale, viewport);
                    }
                }
                if (app.Config.drawAABB) {
                    // this.childrenWorldAABB.draw(ctx, worldScale, Config.childrenAABB);
                    this.worldAABB.draw(ctx, worldScale, '#0FF');
                }
                ctx.restore();
            };
            Model.prototype.setHighlighted = function (highlighted) {
                if (highlighted) {
                    this.setHighlightedNode(null);
                }
            };
            Model.prototype.setHighlightedNode = function (node) {
                if (this.highlightedNode == node)
                    return;
                if (this.highlightedNode) {
                    this.highlightedNode.highlighted = false;
                }
                if ((this.highlightedNode = node)) {
                    this.highlightedNode.highlighted = true;
                }
                this.selectionChange.dispatch(this, new SelectionEvent('highlight', node));
            };
            Model.prototype.setSelected = function (selected) {
                if (selected) {
                    this.setSelectedNode(null);
                }
            };
            Model.prototype.setSelectedNode = function (node) {
                if (this.selectedNode == node)
                    return;
                if (this.selectedNode) {
                    this.selectedNode.selected = false;
                }
                if ((this.selectedNode = node)) {
                    this.selectedNode.selected = true;
                }
                this.selectionChange.dispatch(this, new SelectionEvent('selection', node));
            };
            Model.prototype.getSelectedNode = function () {
                return this.selectedNode;
            };
            Model.prototype.getActiveAnimation = function () {
                return this.activeAnimation;
            };
            Model.prototype.getBindPose = function () {
                return this.bindPose;
            };
            Model.prototype.getAnimationList = function () {
                if (this.animationList)
                    return this.animationList;
                var animNames = [];
                for (var animName in this.animations) {
                    animNames.push(animName);
                }
                animNames.sort(Utils.naturalCompare);
                var anims = [this.bindPose];
                for (var _i = 0, animNames_1 = animNames; _i < animNames_1.length; _i++) {
                    var animName = animNames_1[_i];
                    anims.push(this.animations[animName]);
                }
                this.animationList = anims;
                return anims;
            };
            Model.prototype.clear = function () {
                this.selectedNode = null;
                this.highlightedNode = null;
                this.bindPose.clear();
                this.animations = {};
                this.activeAnimation = this.bindPose;
                this.animationChange.dispatch(this.bindPose, new Event('updateAnimationList'));
                _super.prototype.clear.call(this);
            };
            Model.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                if (this.selectedNode && this.selectedNode.hitTest(x, y, worldScaleFactor, result)) {
                    return true;
                }
                return _super.prototype.hitTest.call(this, x, y, worldScaleFactor, result);
            };
            Model.prototype.animateStep = function (deltaTime) {
                this.activeAnimation.animateStep(deltaTime);
            };
            Model.prototype.addNewAnimation = function (name, select) {
                if (select === void 0) { select = false; }
                if (name == null || name == 'None') {
                    name = 'Untitled Animation ' + (++this.nextAnimationId);
                }
                var newName = name;
                var newIndex = 1;
                while (this.animations[newName]) {
                    newName = name + ' ' + newIndex;
                    newIndex++;
                }
                var anim = new app.anim.Animation(newName, this);
                this.animations[newName] = anim;
                this.animationList = null;
                this.animationChange.dispatch(anim, new Event('newAnimation'));
                if (select) {
                    this.setActiveAnimation(newName);
                }
            };
            Model.prototype.setActiveAnimation = function (name) {
                if (this._mode == EditMode.PLAYBACK)
                    return;
                var anim = name == 'None' ? this.bindPose : this.animations[name];
                if (anim && anim != this.activeAnimation) {
                    if (this.activeAnimation) {
                        this.activeAnimation.active = false;
                    }
                    anim.active = true;
                    this.activeAnimation = anim;
                    this.animationChange.dispatch(anim, new Event('setAnimation'));
                    this.activeAnimation.updateNodes();
                    this.setMode(anim == this.bindPose ? EditMode.EDIT : EditMode.ANIMATE);
                }
            };
            Model.prototype.deleteAnimation = function (anim) {
                if (anim === void 0) { anim = null; }
                if (!anim)
                    anim = this.activeAnimation;
                if (anim == this.bindPose)
                    return;
                var animList = this.getAnimationList();
                var animIndex = animList.indexOf(anim);
                delete this.animations[anim.name];
                this.animationList = null;
                this.animationChange.dispatch(anim, new Event('updateAnimationList'));
                animList = this.getAnimationList();
                if (animIndex >= animList.length)
                    animIndex = animList.length - 1;
                this.setActiveAnimation(animList[animIndex].name);
            };
            Model.prototype.renameAnimation = function (anim, newName) {
                newName = $.trim(newName);
                if (newName == anim.name || this.animations[newName])
                    return;
                delete this.animations[anim.name];
                this.animations[newName] = anim;
                anim.name = newName;
                this.animationList = null;
                this.animationChange.dispatch(this.bindPose, new Event('updateAnimationList'));
                this.animationChange.dispatch(anim, new Event('setAnimation'));
            };
            Object.defineProperty(Model.prototype, "mode", {
                get: function () {
                    return this._mode;
                },
                set: function (value) {
                    if (value == EditMode.EDIT)
                        return;
                    this.setMode(value);
                },
                enumerable: true,
                configurable: true
            });
            Model.prototype.setMode = function (value) {
                if (this._mode == value)
                    return;
                if (value == EditMode.PLAYBACK) {
                    this.activeAnimation.initForAnimation();
                }
                this._mode = value;
                this.modeChange.dispatch(this, new Event('mode'));
            };
            /*
             * Events
             */
            Model.prototype.onStructureChange = function (type, parent, source, index, other) {
                this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, source, index, other));
            };
            return Model;
        }(model.ContainerNode));
        model.Model = Model;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Model.js.map