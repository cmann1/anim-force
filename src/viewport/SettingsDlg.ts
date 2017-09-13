namespace app.viewport
{

	export class SettingsDlg
	{
		private viewport:app.viewport.Viewport;
		private $dlg:JQuery;
		private dlg:jBox;
		private $showFps:JQuery;
		private $showControls:JQuery;
		private $drawAABB:JQuery;
		private $drawGrid:JQuery;

		constructor(viewport:Viewport, $viewportContainer)
		{
			this.viewport = viewport;

			var $btn = $viewportContainer.find('i.settings-btn');

			this.$dlg = $('#viewport-properties-dlg');
			this.$showFps = this.$dlg.find('#view-prop-showFps');
			this.$showControls = this.$dlg.find('#view-prop-showControls');
			this.$drawAABB = this.$dlg.find('#view-prop-drawAABB');
			this.$drawGrid = this.$dlg.find('#view-prop-drawGrid');
			this.$dlg.find('input').on('change', this.onInputChange);
			this.dlg = new jBox('Modal', {
				title: 'Viewport Settings',
				attach: $btn,
				overlay: false,
				position: {x: 'right', y: 'top'},
				offset: {y: -10},
				outside: 'y',
				closeButton: true,
				closeOnEsc: true,
				closeOnClick: 'body',
				content: this.$dlg,
				target: $btn,
				trigger: 'click',
				onOpen: this.onDlgOpen
			});

			new jBox('Tooltip', {
				attach: this.$dlg.find('label[title]'),
				theme: 'TooltipDark'
			});
		}

		private onDlgOpen = (event) =>
		{
			this.$showFps.prop('checked', Config.showFps);
			this.$showControls.prop('checked', Config.showControls);
			this.$drawAABB.prop('checked', Config.drawAABB);
			this.$drawGrid.prop('checked', Config.drawGrid);
		};

		private onInputChange = (event) =>
		{
			const type = event.target.id.replace('view-prop-', '');

			Config.set(type, this[`$${type}`].prop('checked'));

			this.viewport.requiresUpdate = true;
		}

	}

}