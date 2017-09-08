namespace app.timeline
{

	import Splitter = app.ui.Splitter;
	import SplitterOrientation = app.ui.SplitterOrientation;
	import SplitterAnchor = app.ui.SplitterAnchor;
	import Model = app.model.Model;
	import TimelineTree = app.timeline.tree.TimelineTree;

	export class TimelinePanel

	{

		public tree:TimelineTree;
		public viewport:TimelineViewport;

		private $container:JQuery;
		private model:app.model.Model;

		constructor(model:Model)
		{
			this.model = model;

			this.$container = $('#timeline-panel');
		}

		public init()
		{
			this.tree = new TimelineTree('timeline-tree', this.model);
			this.viewport = new TimelineViewport('timeline', this.model, this.tree);

			new Splitter(this.tree.getContainer(), $('#timeline-container'), SplitterOrientation.HORIZONTAL, 350, SplitterAnchor.FIRST, 'timeline-tree');
		}

		public getContainer()
		{
			return this.$container;
		}

		public step(deltaTime:number, timestamp:number)
		{
			this.viewport.step(deltaTime, timestamp);
		}

		public draw()
		{
			this.viewport.draw();
		}

	}

}