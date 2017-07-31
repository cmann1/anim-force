///<reference path='../lib/jquery.d.ts'/>
///<reference path='../lib/createjs-lib.d.ts'/>

///<reference path='Ticker.ts'/>
///<reference path='FpsDisplay.ts'/>
///<reference path='viewport/Viewport.ts'/>
///<reference path='ui/Splitter.ts'/>
///<reference path='assets/SpriteManager.ts'/>
///<reference path='model/Model.ts'/>
///<reference path='model/Bone.ts'/>
///<reference path='model/Sprite.ts'/>

/*
// TODO: Timeline:
// TODO: - A row for each node
// TODO: - Tree structure collapsible  nodes
// TODO: - Selecting
// TODO: - Add/Delete
// TODO: -
// TODO: Draw controls:
// TODO: - Independent of zoom and scale
// TODO: - Mouse interaction
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

	class App{
		protected ticker:Ticker;
		protected fpsDisplay:Fps.Display;

		protected _spriteManager:SpriteManager;
		protected viewport:app.viewport.Viewport;

		protected model:Model = new Model();

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
		}

		protected draw()
		{
			this.viewport.draw();
		}

		protected initUI()
		{
			this.viewport = new app.viewport.Viewport('viewport');

			new Splitter($('#col-left'), $('#properties-panel'), SplitterOrientation.HORIZONTAL, 200, SplitterAnchor.SECOND, 'properties');
			new Splitter(this.viewport.getContainer(), $('#timeline-container'), SplitterOrientation.VERTICAL, 200, SplitterAnchor.SECOND, 'timeline');

			this.viewport.updateCanvasSize();
			this.viewport.focus();

			this.fpsDisplay = new Fps.Display(this.ticker.getFps);
		}

		get spriteManager():app.assets.SpriteManager
		{
			return this._spriteManager;
		}

		/*
		* Events
		*/

		protected onTick = (deltaTime:number, timestamp:number) =>
		{
			this.step(deltaTime, timestamp);
			this.draw();
		};

		protected onWindowLoad = () =>
		{
			$(window)
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
}