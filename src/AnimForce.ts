/*
// TODO: Timeline:
// TODO: - Update on insert/delete keyframe
// TODO: - Draw time bar and scrubber
// TODO: - Scroll with mouse wheel and right click drag
// TODO: Separate edit and animate modes
// TODO: - Edit mode:
// TODO: - - Replace stretch handle with length handle
// TODO: - Animate mode:
// TODO: - - Disable adding, removing and dragging in the timeline.
// TODO: Loading sprites
// TODO: Export to AngelScript
// TODO: Add bone as next sibling if selected node doesn't allow children (ctrl forces sibling)
// TODO: Allow frames to be animated
// TODO: Animation events
// TODO: Sprite Selector:
// TODO: - Use different modal script
// TODO: - Improve all-round
// TODO: - Lazy load/create groups
// TODO: - Auto show when adding a sprite
// TODO: - - Auto set sprite node name to sprite name
// TODO: - Add cancel button
// TODO: Ghosts
// TODO: Show loading sprite when changing sprites
// TODO: Viewport:
// TODO: - ???
// TODO: Property panel:
// TODO: - ????
// TODO: Help?
// TODO: - List of shortcut keys
 */

namespace app
{
	import Ticker = app.ticker.Ticker;
	import Splitter = app.ui.Splitter;
	import SplitterOrientation = app.ui.SplitterOrientation;
	import SplitterAnchor = app.ui.SplitterAnchor;
	import SpriteManager = app.assets.SpriteManager;
	import Model = app.model.Model;
	import Bone = app.model.Bone;
	import Sprite = app.model.Sprite;
	import SpriteSelector = app.ui.SpriteSelector;
	import SpriteSelectCallback = app.ui.SpriteSelectCallback;

	class App{
		protected ticker:Ticker;
		protected fpsDisplay:Fps.Display;

		protected _spriteManager:SpriteManager;
		protected viewport:app.viewport.Viewport;
		protected timeline:app.timeline.TimelinePanel;

		protected model:Model = new Model();

		protected spriteSelector:SpriteSelector = null;

		public runningTime:number = 0;

		constructor()
		{
			createjs.Ticker.timingMode = createjs.Ticker.RAF;

			this._spriteManager = new SpriteManager('assets/sprites/');

			window.addEventListener('DOMContentLoaded', this.onWindowLoad);
			window.addEventListener('resize', this.onWindowResize);
		}

		protected step(deltaTime:number, timestamp:number)
		{
			this.viewport.step(deltaTime, timestamp);
			this.timeline.step(deltaTime, timestamp);
		}

		protected draw()
		{
			this.viewport.draw();
			this.timeline.draw();
		}

		protected initUI()
		{
			this.viewport = new app.viewport.Viewport('viewport', this.model);
			this.timeline = new app.timeline.TimelinePanel(this.model);

			new Splitter($('#col-left'), $('#properties-panel'), SplitterOrientation.HORIZONTAL, 200, SplitterAnchor.SECOND, 'properties');
			new Splitter(this.viewport.getContainer(), this.timeline.getContainer(), SplitterOrientation.VERTICAL, 200, SplitterAnchor.SECOND, 'timeline');

			this.timeline.init();

			this.viewport.focus();

			this.fpsDisplay = new Fps.Display(this.ticker.getFps);

			new jBox('Tooltip', {
				attach: '.tooltip',
				theme: 'TooltipDark'
			});
		}

		get spriteManager():app.assets.SpriteManager
		{
			return this._spriteManager;
		}

		showSpriteSelector(callback:SpriteSelectCallback=null)
		{
			if(this.spriteSelector == null)
			{
				this.spriteSelector = new SpriteSelector();
			}

			this.spriteSelector.show(callback);
		}

		/*
		* Events
		*/

		protected onTick = (deltaTime:number, timestamp:number) =>
		{
			this.runningTime++;
			this.step(deltaTime, timestamp);
			this.draw();
		};

		protected onWindowLoad = () =>
		{
			app.$body = $(document.body);
			app.$window = $(window);

			app.$window
				.on('focus', this.onWindowFocus)
				.on('blur', this.onWindowBlur)
				.focus();

			this.ticker = new Ticker(this.onTick);
			this.ticker.start();

			this.initUI();
		};

		protected onWindowResize = () =>
		{
			this.viewport.updateCanvasSize();

			this.step(0, 0);
			this.draw();
		};

		protected onWindowBlur = () =>
		{
			this.ticker.stop();
		};

		protected onWindowFocus = () =>
		{
			this.ticker.start();
		};

	}

	// Used for debugging
	//noinspection JSUnusedLocalSymbols
	export var main = new App();
	export var $body:JQuery;
	export var $window:JQuery;
}