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
                var _this = _super.call(this, 'Untitled Model') || this;
                _this.nextAnimationId = 0;
                _this.nodeMap = {};
                _this.selectedNode = null;
                _this.highlightedNode = null;
                _this.drawList = new model.DrawList();
                _this._mode = EditMode.EDIT;
                _this.bindPose = new app.anim.Animation('None', _this, true);
                _this.animations = {};
                _this.activeAnimation = null;
                _this.animationList = null;
                /// Events
                _this.change = new EventDispatcher();
                _this.modeChange = new EventDispatcher();
                _this.selectionChange = new EventDispatcher();
                _this.animationChange = new EventDispatcher();
                _this.nodeDrawOrderSelect = function (a, b) {
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
                _this.nodeDrawOrder = function (a, b) {
                    if (a.layer < b.layer) {
                        return -1;
                    }
                    if (a.layer > b.layer) {
                        return 1;
                    }
                    if (a.subLayer < b.subLayer) {
                        return -1;
                    }
                    if (a.subLayer > b.subLayer) {
                        return 1;
                    }
                    return a.drawIndex - b.drawIndex;
                };
                /*
                 * Events
                 */
                _this.onNodePropertyChange = function (sender, event) {
                    _this.change.dispatch(_this, new Event('change'));
                };
                _this.model = _this;
                _this.type = 'model';
                _this.bindPose.active = true;
                _this.activeAnimation = _this.bindPose;
                return _this;
            }
            //
            Model.prototype.animateStep = function (deltaTime) {
                this.activeAnimation.animateStep(deltaTime);
            };
            Model.prototype.draw = function (ctx, worldScale) {
                console.error('Use drawModel instead');
            };
            Model.prototype.drawModel = function (ctx, worldScale, viewport) {
                // Update draw list
                {
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
                    this.drawList.list.sort(this.nodeDrawOrder);
                }
                ctx.save();
                var drawList = this.drawList.list;
                for (var _b = 0, drawList_1 = drawList; _b < drawList_1.length; _b++) {
                    var node = drawList_1[_b];
                    node.draw(ctx, worldScale);
                }
                ctx.restore();
                ctx.save();
                if (app.Config.showControls) {
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
            Model.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                if (this.hitTestControls(x, y, worldScaleFactor, result)) {
                    return true;
                }
                var drawList = this.drawList.list;
                var i = drawList.length - 1;
                if (this.selectedNode) {
                    if (result.selectUnderneath) {
                        i = drawList.indexOf(this.selectedNode) - 1;
                        if (i < 0)
                            i = drawList.length - 1;
                    }
                    else if (this.selectedNode.hitTest(x, y, worldScaleFactor, result, false)) {
                        return true;
                    }
                }
                while (i >= 0) {
                    var node = drawList[i--];
                    if (!node.locked && node.hitTest(x, y, worldScaleFactor, result, false)) {
                        return true;
                    }
                }
                return false;
                // return super.hitTest(x, y, worldScaleFactor, result);
            };
            Model.prototype.prepareChildren = function () {
                this.drawList.clear();
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.prepareForDrawing(0, 0, 1, 1, 1, 0, null, null);
                }
            };
            //
            Model.prototype.duplicateSelected = function (recursive) {
                if (recursive === void 0) { recursive = true; }
                if (!this.selectedNode)
                    return null;
                var copy = this.selectedNode.clone(recursive);
                if (copy) {
                    this.selectedNode.parent.addChild(copy);
                }
                return copy;
            };
            Model.prototype.getActiveAnimation = function () {
                return this.activeAnimation;
            };
            Model.prototype.setActiveAnimation = function (name, forceUpdate) {
                if (forceUpdate === void 0) { forceUpdate = false; }
                if (this._mode == EditMode.PLAYBACK)
                    return;
                var anim = (name == 'None' ? this.bindPose : this.animations[name]) || this.bindPose;
                var requiresUpdate = false;
                if (anim != this.activeAnimation) {
                    if (this.activeAnimation) {
                        this.activeAnimation.active = false;
                    }
                    anim.active = true;
                    this.activeAnimation = anim;
                    this.animationChange.dispatch(anim, new Event('setAnimation'));
                    requiresUpdate = true;
                    this.setMode(anim == this.bindPose ? EditMode.EDIT : EditMode.ANIMATE);
                }
                if (forceUpdate || requiresUpdate) {
                    this.activeAnimation.updateNodes();
                }
            };
            Model.prototype.getAllAnimations = function () {
                var anims = [this.bindPose];
                for (var animName in this.animations) {
                    anims.push(this.animations[animName]);
                }
                return anims;
            };
            Model.prototype.setAnimationListeners = function (callback) {
                this.bindPose.change.on(callback);
                for (var animName in this.animations) {
                    this.animations[animName].change.on(callback);
                }
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
            Model.prototype.getBindPose = function () {
                return this.bindPose;
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
            Model.prototype.getNodeList = function (skipCollapsedNodes) {
                if (skipCollapsedNodes === void 0) { skipCollapsedNodes = false; }
                var nodes = [];
                var nodeQueue = [];
                var i = -1;
                for (var j = this.childCount - 1; j >= 0; j--)
                    nodeQueue[++i] = this.children[j];
                while (i >= 0) {
                    var node = nodeQueue[i--];
                    if (node instanceof model.ContainerNode && (!node.collapsed || !skipCollapsedNodes)) {
                        for (var j = node.childCount - 1; j >= 0; j--)
                            nodeQueue[++i] = node.children[j];
                    }
                    nodes.push(node);
                }
                return nodes;
            };
            Model.prototype.setSelected = function (selected) {
                if (selected) {
                    this.setSelectedNode(null);
                }
            };
            Model.prototype.getSelectedNode = function () {
                return this.selectedNode;
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
            Model.prototype.updateNodeVisibility = function (node) {
                this.selectionChange.dispatch(this, new SelectionEvent('visibility', node));
            };
            //
            Model.prototype.clear = function () {
                this.nodeMap = {};
                this.selectedNode = null;
                this.highlightedNode = null;
                _super.prototype.clear.call(this);
                this.bindPose.clear();
                this.animations = {};
                this.animationList = null;
                this.activeAnimation = this.bindPose;
                this.setMode(EditMode.EDIT);
                this.animationChange.dispatch(this.bindPose, new Event('updateAnimationList'));
            };
            Model.prototype.addNode = function (node) {
                this.nodeMap[node.id] = node;
                node.propertyChange.on(this.onNodePropertyChange);
            };
            Model.prototype.removeNode = function (node) {
                delete this.nodeMap[node.id];
                node.propertyChange.off(this.onNodePropertyChange);
            };
            Model.prototype.getNode = function (id) {
                return this.nodeMap[id];
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
            Model.prototype.increaseSelectedNodeLayer = function (amount, subLayer, recurse) {
                if (subLayer === void 0) { subLayer = false; }
                if (recurse === void 0) { recurse = false; }
                if (!this.selectedNode)
                    return;
                this.selectedNode.increaseLayer(amount, subLayer, recurse);
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
            //
            Model.prototype.save = function () {
                var data = _super.prototype.save.call(this);
                data.nextAnimationId = this.nextAnimationId;
                data.mode = this.mode;
                data.bindPose = this.bindPose.save();
                data.animations = {};
                data.activeAnimation = this.activeAnimation.name;
                data.selectedNode = this.selectedNode ? this.selectedNode.id : -1;
                for (var animName in this.animations) {
                    data.animations[animName] = this.animations[animName].save();
                }
                return data;
            };
            Model.prototype.load = function (data) {
                // console.log(data);
                this.nodeMap = {};
                _super.prototype.load.call(this, data);
                this.nextAnimationId = data.get('nextAnimationId');
                this._mode = data.get('mode');
                this.bindPose.initTracksFromModel(false);
                this.bindPose.load(data.asLoadData('bindPose'));
                var animations = data.get('animations');
                for (var animName in animations) {
                    if (!animations.hasOwnProperty(animName))
                        continue;
                    var animData = data.asLoadData(animations[animName]);
                    animData = data.asLoadData(animData);
                    this.animations[animName] = new app.anim.Animation(null, this, false, false).load(animData);
                }
                this.setActiveAnimation(data.get('activeAnimation'), true);
                var selectedNodeId = data.get('selectedNode');
                if (selectedNodeId != -1) {
                    var node = this.nodeMap[selectedNodeId];
                    if (node) {
                        this.setSelectedNode(node);
                    }
                    else {
                        console.log('Invalid node id for selected node');
                    }
                }
                return this;
            };
            //
            Model.prototype.setMode = function (value) {
                if (this._mode == value)
                    return;
                if (value == EditMode.PLAYBACK) {
                    this.activeAnimation.initForAnimation();
                }
                this._mode = value;
                this.modeChange.dispatch(this, new Event('mode'));
            };
            Model.prototype.updateLayer = function () {
            };
            Model.prototype.onStructureChange = function (type, parent, source, index, other) {
                this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, source, index, other));
            };
            return Model;
        }(model.ContainerNode));
        model.Model = Model;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Model.js.map