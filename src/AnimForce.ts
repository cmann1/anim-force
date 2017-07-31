///<reference path='../lib/jquery.d.ts'/>
///<reference path='../lib/createjs-lib.d.ts'/>

///<reference path='Ticker.ts'/>
///<reference path='FpsDisplay.ts'/>
///<reference path='viewport/Viewport.ts'/>
///<reference path='ui/Splitter.ts'/>
///<reference path='assets/SpriteManager.ts'/>

/*
// TODO: Armature, bone, and forward kinematics
 */

namespace app
{
	import Ticker = app.ticker.Ticker;
	import Splitter = app.ui.Splitter;
	import SplitterOrientation = app.ui.SplitterOrientation;
	import SplitterAnchor = app.ui.SplitterAnchor;
	import SpriteManager = app.assets.SpriteManager;

	class App{
		protected ticker:Ticker;
		protected fpsDisplay:Fps.Display;

		protected viewport:app.viewport.Viewport;

		protected _spriteManager:SpriteManager;

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