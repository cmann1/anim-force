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
        var Anchor = (function (_super) {
            __extends(Anchor, _super);
            // TODO: Provide an interface for enabling/disabling rotation and scale for anchor nodes
            function Anchor(name) {
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name, false, false) || this;
                _this.drawOutline = false;
                _this.type = 'anchor';
                _this.boxWidth = _this.boxHeight = 40;
                _this.hitRadius = _this.boxWidth * 0.5 * 0.75;
                return _this;
            }
            Object.defineProperty(Anchor.prototype, "name", {
                get: function () {
                    return this._name || 'anchor-' + this.id;
                },
                set: function (value) {
                    this.setName(value);
                },
                enumerable: true,
                configurable: true
            });
            Anchor.prototype.drawControls = function (ctx, worldScale, viewport) {
                if (!this.visible || !this.worldAABB.intersects(viewport))
                    return;
                ctx.save();
                var scaleX = this.scaleX * worldScale;
                var scaleY = this.scaleY * worldScale;
                var w = this.boxWidth * 0.5;
                var h = this.boxHeight * 0.5;
                ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
                if (this.allowRotation) {
                    ctx.rotate(this.worldRotation);
                }
                ctx.lineWidth = 3;
                ctx.strokeStyle = app.Config.anchor;
                for (var i = 0; i < 2; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.hitRadius * worldScale, 0, Math.PI * 2);
                    ctx.moveTo(-w * scaleX, 0);
                    ctx.lineTo(w * scaleX, 0);
                    ctx.moveTo(0, -h * scaleY);
                    ctx.lineTo(0, h * scaleY);
                    ctx.stroke();
                    ctx.lineWidth = 1.75;
                    ctx.strokeStyle = app.Config.control;
                }
                ctx.restore();
                _super.prototype.drawControls.call(this, ctx, worldScale, viewport);
            };
            //
            Anchor.prototype.getInstance = function () {
                return new Anchor();
            };
            Anchor.prototype.save = function () {
                var data = _super.prototype.save.call(this);
                data.allowRotation = this.allowRotation;
                data.allowScale = this.allowScale;
                return data;
            };
            Anchor.prototype.load = function (data) {
                _super.prototype.load.call(this, data);
                this.allowRotation = data.get('allowRotation');
                this.allowScale = data.get('allowScale');
                return this;
            };
            return Anchor;
        }(model.BoxNode));
        model.Anchor = Anchor;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Anchor.js.map