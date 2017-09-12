namespace app.viewport
{

	export class SettingsDlg
	{
		private viewport:app.viewport.Viewport;
		private $dlg:JQuery;
		private dlg:jBox;
		private $showFps:JQuery;
		private $showControls:JQuery;
		private $showAABB:JQuery;

		constructor(viewport:Viewport, $viewportContainer)
		{
			this.viewport = viewport;

			var $btn = $viewportContainer.find('i.settings-btn');

			this.$dlg = $('#viewport-properties-dlg');
			this.$showFps = this.$dlg.find('#view-prop-show-fps');
			this.$showControls = this.$dlg.find('#view-prop-show-controls');
			this.$showAABB = this.$dlg.find('#view-prop-show-aabb');
			this.$dlg.find('input').on('change', this.onInputChange);
			this.dlg = new jBox('Modal', {
				title: 'Viewport Settings',
				attach: $btn,
				overlay: false,
				position: {x: 'right', y: 'top'},
				offset: {y: -10},
				outside: 'y',
				closeButton: false,
				closeOnEsc: true,
				closeOnClick: 'body',
				content: this.$dlg,
				target: $btn,
				trigger: 'click',
				onOpen: this.onDlgOpen
			});
		}

		private onDlgOpen = (event) =>
		{
			this.$showFps.prop('checked', Config.showFps);
			this.$showControls.prop('checked', Config.drawControls);
			this.$showAABB.prop('checked', Config.drawAABB);
		};

		private onInputChange = (event) =>
		{
			const type = event.target.id.replace('view-prop-', '');

			if(type == 'show-fps')
			{
				this.viewport.toggleFps(this.$showFps.prop('checked'));
			}
			else if(type == 'show-controls')
			{
				Config.set('drawControls', this.$showControls.prop('checked'));
			}
			else if(type == 'show-aabb')
			{
				Config.set('drawAABB', this.$showAABB.prop('checked'));
			}

			this.viewport.requiresUpdate = true;
		}

	}

}