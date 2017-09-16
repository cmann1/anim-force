namespace app.ui
{

	export type SpriteSelectCallback = (spriteGroup:string, spriteName:string) => void;

	export class SpriteSelector
	{

		private modal:jBox;
		private $container;
		private callback:SpriteSelectCallback;

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
		}

		hide()
		{
			this.modal.close();
		}

		private init()
		{
			this.$container = $('#sprite_selector');
			this.$container
				.on('click', '.heading', this.onHeadingClick)
				.on('click', '.thumb-outer', this.onSpriteClick);

			var spriteList = app.main.spriteManager.getSpriteList();

			for(var groupData of spriteList)
			{
				const groupName = groupData['name'];
				const spriteList = groupData['sprites'];

				var $group = $(
					`<div class="sprite_group collapsed">
						<div class="heading">
							<i class="fa fold-icon"></i>
							<img src="assets/sprites/${groupName}/_group_thumb.png" alt="">
							<span>${groupName.toTitleCase()}</span>
						</div>
						<div class="content"></div>
					</div>`
				);
				var $content = $group.find('.content');

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
			}

			new jBox('Tooltip', {
				attach: '.spr-tooltip',
				theme: 'TooltipDark'
			});

			this.modal = new jBox('Modal', {
				title: '<i class="fa fa-image fa-2x"></i> Sprite Selector',
				content: this.$container,
				isolateScroll: false
			});
		}

		protected onHeadingClick = (event) =>
		{
			$(event.currentTarget).parent().toggleClass('collapsed');
			// this.modal.position();
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

	}

}