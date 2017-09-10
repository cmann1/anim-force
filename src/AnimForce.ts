/*
// TODO: Separate edit and animate modes
// TODO: - Add, remove, and rename animations
// TODO: - Edit mode:
// TODO: - - Replace stretch handle with length handle
// TODO: - - Force frame to stay at zero
// TODO: - - Don't allow deleting keyframes
// TODO: - - Don't allow dragging timeline  frame
// TODO: - Animate mode:
// TODO: - - ? Disable adding, removing in the timeline.
// TODO: Saving/Loading models
// TODO: - Save to localdata/db and option to export/import from file
// TODO: - Manage saved models
// TODO: Manually change animation length
// TODO: Export to AngelScript
// TODO: - Multiple animations
// TODO: Allow sprite frames to be animated
// TODO: Animation events
// TODO: Some sort of options window/popup:
// TODO: - Show/Hide controls
// TODO: Sprite Selector:
// TODO: - Use different modal script
// TODO: - Improve all-round
// TODO: - Lazy load/create groups
// TODO: - Auto show when adding a sprite
// TODO: - - Auto set sprite node name to sprite name
// TODO: - Add cancel button
// TODO: Ghosts
// TODO: Show loading sprite when changing sprites
// TODO: Keyboard shortcuts from changing layer and sublayer

// TODO: Timeline:
// TODO: - Somehow indicate that a keyframe is selected - it might not be obvious (esp. if the selected keyframe is not in view)
// TODO: - ???
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

			this.viewport.timeline = this.timeline.viewport;
			this.timeline.viewport.viewport = this.viewport;

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