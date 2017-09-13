/*
// TODO: Ordered TODO:
// ---------------------------------------------------------------
// TODO: Saving/Loading models
// TODO: - Manage saved models
// TODO: - Enter to open selected project
// TODO: - Option to auto open last project
// TODO: - rename, export to file, import from file, ?clear
// TODO: Export to AngelScript
// TODO: - Multiple animations
// TODO: Allow sprite frames to be animated
// TODO: - Refactor the way sprite source frames are stored/set to make this easier/faster
// TODO: Sprite Selector:
// TODO: - Remember state, scroll position, etc.
// TODO: - Improve all-round
// TODO: - Lazy load/create groups
// TODO: - Auto show when adding a sprite
// TODO: - - Auto set sprite node name to sprite name
// TODO: - Add cancel button
// TODO: Animation events
 // ---------------------------------------------------------------

// TODO: Ghosts
// TODO: Add icon to sprite selector window
// TODO: Disable timeline tree actions (buttons and keyboard shortcuts) when in playback mode
// TODO: Keyboard shortcuts for changing layer and sublayer
// TODO: Export to sprite_group
// TODO: - copy to clipboard when exporting
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
	import ProjectManager = app.projects.ProjectManager;
	import Project = app.projects.Project;

	export class App{
		public readonly ticker:Ticker;

		protected _spriteManager:SpriteManager;
		protected viewport:app.viewport.Viewport;
		protected timeline:app.timeline.TimelinePanel;

		protected project:Project;
		protected model:Model;

		protected spriteSelector:SpriteSelector = null;
		protected projectManager:ProjectManager;

		protected loadCount = 0;

		public runningTime:number = 0;

		constructor()
		{
			createjs.Ticker.timingMode = createjs.Ticker.RAF;
			this.ticker = new Ticker(this.onTick);

			this._spriteManager = new SpriteManager('assets/sprites/');

			this.loadCount++;
			Config.init(this.onLoadQueue);

			this.loadCount++;
			window.addEventListener('DOMContentLoaded', this.onWindowLoad);
			window.addEventListener('resize', this.onWindowResize);
		}

		public static notice(content:string, colour:string='white', time=3500)
		{
			new jBox('Notice', {
				content: content,
				color: colour,
				autoClose: time,
				attributes: {x: 'left', y: 'top'}
			});
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

			new jBox('Tooltip', {
				attach: '.tooltip',
				theme: 'TooltipDark'
			});
		}

		protected onLoadQueue = () =>
		{
			if(!this.projectManager && Config.isLoaded && app.$body)
			{
				this.loadCount++;
				this.projectManager = new ProjectManager();
				this.projectManager.init(this.onProjectManagerReady);
			}

			// Loading complete
			if(--this.loadCount == 0)
			{
				app.$window
					.on('focus', this.onWindowFocus)
					.on('blur', this.onWindowBlur)
					.focus();

				$('#app-loading-screen').remove();

				this.ticker.start();
				this.initUI();
			}
		};

		public setProject(newProject:Project)
		{
			this.project = this.projectManager.getActiveProject();
			this.model = this.project.activeModel;

			this.viewport.setModel(newProject.activeModel);
			this.timeline.setModel(newProject.activeModel);

			this.viewport.focus();
			this.viewport.reset();
			this.timeline.reset();
		}

		public get spriteManager():app.assets.SpriteManager
		{
			return this._spriteManager;
		}

		// TODO: remove
		public showSpriteSelector(callback:SpriteSelectCallback=null)
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

		protected onProjectManagerReady = () =>
		{
			this.project = this.projectManager.getActiveProject();
			this.model = this.project.activeModel;

			this.onLoadQueue();
		};

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

			this.onLoadQueue();
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