///<reference path='../lib/jquery.d.ts'/>
///<reference path='../lib/createjs-lib.d.ts'/>

///<reference path='Ticker.ts'/>
///<reference path='FpsDisplay.ts'/>
///<reference path='viewport/Viewport.ts'/>

namespace app
{
	import Ticker = app.ticker.Ticker;

	class App{
		protected ticker:Ticker;
		protected fpsDisplay:Fps.Display;

		protected viewport:app.viewport.Viewport;

		constructor()
		{
			createjs.Ticker.timingMode = createjs.Ticker.RAF;

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
			this.viewport = new app.viewport.Viewport('viewport');

			$(window)
				.on('focus', this.onWindowFocus)
				.on('blur', this.onWindowBlur)
				.focus();

			this.ticker = new Ticker(this.onTick);
			this.ticker.start();

			this.fpsDisplay = new Fps.Display(this.ticker.getFps);
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