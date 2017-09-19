namespace app.ui
{

	export type SpriteSelectCallback = (spriteGroup:string, spriteName:string) => void;

	export class SpriteSelector
	{

		private modal:jBox;
		private $container;
		private $content;
		private callback:SpriteSelectCallback;

		private scrollTop = 0;

		constructor()
		{
		}

		show(callback:SpriteSelectCallback=null)
		{
			if(!this.modal)
			{
				this.init();
			}

			this.callback = callback;

			this.modal.open();
			setTimeout(() => {this.modal.position();}, 100);
		}

		hide()
		{
			this.modal.close();
		}

		private init()
		{
			this.$container = $('#sprite_selector');
			this.$container
				.on('click', '.sprite-group', this.onHeadingClick)
				.on('click', '.thumb-outer', this.onSpriteClick);

			var spriteList = app.main.spriteManager.getSpriteList();

			for(var groupData of spriteList)
			{
				const groupName = groupData['name'];
				const spriteList = groupData['sprites'];

				var $group = $(
					`<div class="sprite-group spr-tooltip" title="${groupName}">
						<img src="assets/sprites/${groupName}/_group_thumb.png" alt="">
					</div>`
				);
				var $content = this.$content = $('<div class="content collapsed"></div>');

				var thumbX = 0;
				for(var spriteData of spriteList)
				{
					var $thumb = $(
						`<div class="thumb-outer spr-tooltip" title="${spriteData.name} p[${spriteData.palettes}] f[${spriteData.frames}]" data-group="${groupName}" data-sprite="${spriteData.name}">
							<div class="thumb" style="background: url('assets/sprites/${groupName}/_thumb.png') ${-thumbX}px 0"></div>
						</div>`
					);
					$content.append($thumb);
					thumbX += 42;
				}

				this.$container.append($group);
				this.$container.append($content);
			}

			new jBox('Tooltip', {
				attach: '.spr-tooltip',
				theme: 'TooltipDark'
			});

			this.modal = new jBox('Modal', {
				title: '<i class="fa fa-image fa-2x"></i> Sprite Selector',
				content: this.$container,
				isolateScroll: false,
				onOpen: this.onDialogOpen,
				onPosition: this.onDialogPosition,
				onClose: this.onDialogClose,
			});
		}

		protected onHeadingClick = (event) =>
		{
			$(event.currentTarget).next().toggleClass('collapsed');
			this.modal.position();
		};

		protected onSpriteClick = (event) =>
		{
			var $sprite = $(event.currentTarget);
			var spriteGroup = $sprite.data('group');
			var spriteName = $sprite.data('sprite');

			if(this.callback)
			{
				this.callback(spriteGroup, spriteName);
			}

			this.hide();
		};

		protected onDialogOpen = (event) =>
		{
			this.modal.position();
			this.modal.content.scrollTop(this.scrollTop);
		};

		protected onDialogPosition = (event) =>
		{
			this.modal.content.scrollTop(this.scrollTop);
		};

		protected onDialogClose = (event) =>
		{
			this.scrollTop = this.modal.content.scrollTop();
		};

	}

}