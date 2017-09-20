/*
 Ordered To-Do's:
 ---------------------------------------------------------------
 TODO: Layer palette for hiding and locking layers and sublayers
 TODO: - Store a Layer instance for each node (updating when the node's layer/sublayer changes)

 TODO: ?Multiple selection
 TODO: ?Groups
 TODO: ?Emitter nodes
 TODO: - Check how emitter entities work in game
 TODO: - How will rotation be handled?
 TODO: - Export to AngelScript
 TODO: ?Sound nodes
 TODO: - Export to AngelScript

 TODO: Sprite Selector:
 TODO: - Improve all-round / Completely redo
 TODO: - Remember state, scroll position, etc.
 TODO: - Lazy load/create groups
 TODO: - ? Auto show when adding a sprite
 TODO: - - Auto set sprite node name to sprite name
 TODO: - Add cancel button
 TODO: Property panel:
 TODO: - ????
 ---------------------------------------------------------------

 TODO: ? Ghosts
 TODO: ? Keyframe easing
 TODO: Export options:
 TODO: - sprite_group: Option to not use sprite layers and sublayers
 TODO: - AngelScript: Selected animations only
 TODO: Timeline:
 TODO: - Somehow indicate that a keyframe is selected - it might not be obvious (esp. if the selected keyframe is not in view)
 TODO: - ???
 TODO: Viewport:
 TODO: - ???
 TODO: Help
 TODO: - List of shortcut keys
 */

const MAX_LAYER = 22;
const MAX_SUB_LAYER = 24;

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
	import Viewport = app.viewport.Viewport;

	export class App{
		protected static instance:App;

		public readonly ticker:Ticker;

		protected _spriteManager:SpriteManager;
		protected viewport:app.viewport.Viewport;
		protected timeline:app.timeline.TimelinePanel;
		protected propertiesPanel:app.properties.PropertiesPanel;

		protected project:Project;
		protected model:Model = new Model(); // A blank model so things work before a project is loaded

		protected spriteSelector:SpriteSelector = null;
		protected projectManager:ProjectManager;

		protected loadCount = 0;

		protected validationId = 0;
		protected validationQueue:(()=>void)[] = [];
		protected validationQueueSize = 0;

		constructor()
		{
			App.instance = this;

			createjs.Ticker.timingMode = createjs.Ticker.RAF;
			this.ticker = new Ticker(this.step);

			this.loadCount++;
			this._spriteManager = new SpriteManager('assets/sprites/', this.onLoadQueue);

			this.loadCount++;
			Config.init(this.onLoadQueue);

			this.loadCount++;
			window.addEventListener('DOMContentLoaded', this.onWindowLoad);
			window.addEventListener('resize', this.onWindowResize);
		}

		//

		public static getViewport():Viewport
		{
			return App.instance.viewport;
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

		//

		protected step = (deltaTime:number, timestamp:number) =>
		{
			for(var i = 0; i < this.validationQueueSize; i++)
			{
				this.validationQueue[i]();
			}
			this.validationQueueSize = 0;

			this.viewport.step(deltaTime, timestamp);
			this.timeline.step(deltaTime, timestamp);

			this.draw();
		};

		protected draw()
		{
			this.viewport.draw();
			this.timeline.draw();
		}

		protected initUI()
		{
			this.viewport = new app.viewport.Viewport('viewport', this.model);
			this.timeline = new app.timeline.TimelinePanel(this.model);
			this.propertiesPanel = new app.properties.PropertiesPanel(this.model);

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
			if(!this.projectManager && this._spriteManager.isReady() && Config.isLoaded && app.$body)
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
			}
		};

		//

		public setProject(project:Project)
		{
			this.project = this.projectManager.getActiveProject();
			this.model = this.project.activeModel;

			if(project.isNew)
			{
				this.viewport.reset();
				this.timeline.reset();
			}

			this.viewport.setModel(project.activeModel);
			this.timeline.setModel(project.activeModel);
			this.propertiesPanel.setModel(project.activeModel);

			this.viewport.focus();
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

		public requestValidation = (callback:()=>void) =>
		{
			this.validationQueue[this.validationQueueSize++] = callback;
			return this.validationId++;
		};

		/*
		* Events
		*/

		protected onProjectManagerReady = () =>
		{
			this.onLoadQueue();
		};

		protected onWindowLoad = () =>
		{
			app.$body = $(document.body);
			app.$window = $(window);

			this.initUI();

			this.onLoadQueue();
		};

		protected onWindowResize = () =>
		{
			this.viewport.updateCanvasSize();
			this.step(0, 0);
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