var app;
(function (app) {
    var timeline;
    (function (timeline) {
        var Splitter = app.ui.Splitter;
        var TimelineTree = app.timeline.tree.TimelineTree;
        var TimelinePanel = (function () {
            function TimelinePanel(model) {
                this.model = model;
                this.$container = $('#timeline-panel');
            }
            TimelinePanel.prototype.init = function () {
                this.tree = new TimelineTree('timeline-tree', this.model);
                this.viewport = new timeline.TimelineViewport('timeline', this.model);
                new Splitter(this.tree.getContainer(), this.viewport.getContainer(), 1 /* HORIZONTAL */, 350, 0 /* FIRST */, 'timeline-tree');
            };
            TimelinePanel.prototype.getContainer = function () {
                return this.$container;
            };
            TimelinePanel.prototype.step = function (deltaTime, timestamp) {
                this.viewport.step(deltaTime, timestamp);
            };
            TimelinePanel.prototype.draw = function () {
                this.viewport.draw();
            };
            return TimelinePanel;
        }());
        timeline.TimelinePanel = TimelinePanel;
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelinePanel.js.map