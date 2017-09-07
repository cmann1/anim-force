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
    var timeline;
    (function (timeline) {
        var TimelineViewport = (function (_super) {
            __extends(TimelineViewport, _super);
            function TimelineViewport(elementId, model) {
                var _this = _super.call(this, elementId) || this;
                _this.$container.on('resize', _this.onResize);
                _this.$container.parent().on('resize', _this.onResize);
                _this.$canvas
                    .on('keydown', _this.onKeyDown)
                    .on('keyup', _this.onKeyUp);
                _this.setupToolbar();
                return _this;
            }
            TimelineViewport.prototype.step = function (deltaTime, timestamp) {
                if (!this.requiresUpdate && document.activeElement != this.canvas)
                    return;
            };
            TimelineViewport.prototype.draw = function () {
                if (!this.requiresUpdate && document.activeElement != this.canvas)
                    return;
                var ctx = this.ctx;
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.save();
                // this.tree.draw(ctx, 0, 0, this.treeWidth, this.height);
                // this.viewport.draw(ctx, this.treeWidth, 0, this.width - this.treeWidth, this.height);
                ctx.restore();
                this.requiresUpdate = false;
            };
            TimelineViewport.prototype.setupToolbar = function () {
                this.$toolbar = this.$container.find('#timeline-toolbar');
                // this.$toolbar
                // 	.on('click', 'i', this.onToolbarButtonClick)
                // 	.on('mousewheel', this.onToolbarMouseWheel);
                // this.$toolbar.find('.fa-plus').parent()
                // 	.on('mouseenter', this.onToolbarAddHover)
                // 	.on('mouseleave', this.onToolbarAddLeave);
                // this.$toolbarAddMenu = this.$toolbar.find('.add-menu');
                //
                // this.$toolbarAddBtn = this.$toolbar.find('i.btn-add');
                // this.$toolbarAddBoneBtn = this.$toolbar.find('i.btn-add-bone');
                // this.$toolbarAddSpriteBtn = this.$toolbar.find('i.btn-add-sprite');
                // this.$toolbarAddDeleteBtn = this.$toolbar.find('i.btn-delete');
                tippy(this.$toolbar.find('i').toArray());
                // this.$toolbarAddMenu.hide();
            };
            /*
             * Events
             */
            TimelineViewport.prototype.onKeyDown = function (event) {
                var keyCode = event.keyCode;
                console.log(keyCode);
            };
            TimelineViewport.prototype.onKeyUp = function (event) {
            };
            TimelineViewport.prototype.onMouseDown = function (event) {
            };
            TimelineViewport.prototype.onMouseUp = function (event) {
            };
            TimelineViewport.prototype.onMouseWheel = function (event) {
            };
            TimelineViewport.prototype.onMouseMove = function (event) {
            };
            return TimelineViewport;
        }(app.Canvas));
        timeline.TimelineViewport = TimelineViewport;
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelineViewport.js.map