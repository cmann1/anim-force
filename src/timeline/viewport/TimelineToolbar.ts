namespace app.timeline
{

	import Model = app.model.Model;
	import EditMode = app.model.EditMode;
	import Animation = app.anim.Animation;
	import Event = app.events.Event;

	export class TimelineToolbar
	{

		private timeline:TimelineViewport;
		private model:Model;
		private animation:Animation;

		private $toolbar:JQuery;
		private $toolbarButtons:JQuery;
		private $animControlButtons:JQuery;

		private $playButton:JQuery;
		private $pauseButton:JQuery;
		private $frameLabel:JQuery;
		private $animationSelect:JQuery;
		private $editAnimButton:JQuery;
		private $deleteAnimButton:JQuery;
		private $deleteConfirmDlg:JQuery;
		private deleteConfirmDlg:jBox;

		constructor(model:Model, timeline:TimelineViewport, $toolbar:JQuery)
		{
			this.model = model;
			this.timeline = timeline;

			this.model.animationChange.on(this.onModelAnimationChange);
			this.animation = model.getActiveAnimation();
			this.animation.change.on(this.onAnimationChange);

			this.$toolbar = $toolbar;
			this.$frameLabel = this.$toolbar.find('.frame-label .value');

			this.$toolbarButtons = this.$toolbar.find('i');
			this.$animControlButtons = this.$toolbarButtons.filter('.anim-controls');
			this.$playButton = this.$toolbar.find('.btn-play');
			this.$pauseButton = this.$toolbar.find('.btn-pause');

			this.$editAnimButton = this.$toolbar.find('.btn-edit-anim');
			this.$deleteAnimButton = this.$toolbar.find('.btn-delete-anim');

			this.$animationSelect = this.$toolbar.find('select')
				.on('change', this.onAnimationSelect);

			this.$toolbar
				.on('click', 'i', this.onToolbarButtonClick);

			tippy(this.$toolbar.find('i').toArray());

			this.$deleteConfirmDlg = $('#anim-delete-confirm');
			this.$deleteConfirmDlg.find('button').on('click', this.onDeleteConfirmClick);
			this.deleteConfirmDlg = new jBox('Modal', {
				title: 'Delete this animation?',
				attach: '#timeline-toolbar i.btn-delete-anim',
				overlay: false,
				position: {x: 'right', y: 'bottom'},
				offset: {y: 10},
				outside: 'y',
				closeButton: false,
				closeOnEsc: true,
				closeOnClick: 'body',
				content: this.$deleteConfirmDlg,
				target: this.$deleteAnimButton[0],
				trigger: 'click',
				onOpen: this.onDeleteConfirmDlgOpen
			});

			this.updateFrameLabel();
			this.updateToolbarButtons();
		}

		public updateFrameLabel()
		{
			this.$frameLabel.text((this.animation.getPosition() + 1) + '/' + this.animation.getLength());
		}

		public updateToolbarButtons()
		{
			const mode = this.timeline.getMode();
			const inEditMode = (mode == EditMode.EDIT);

			if(mode == EditMode.PLAYBACK)
			{
				this.$playButton.hide();
				this.$pauseButton.show();
			}
			else
			{
				this.$playButton.show();
				this.$pauseButton.hide();
			}

			if(mode == EditMode.ANIMATE)
			{
				this.$animControlButtons.removeClass('disabled');
			}
			else
			{
				this.$animControlButtons.addClass('disabled');
			}

			this.$playButton.toggleClass('disabled', inEditMode);
			this.$pauseButton.toggleClass('disabled', inEditMode);
			this.$frameLabel.parent().toggleClass('disabled', inEditMode);

			this.$editAnimButton.toggleClass('disabled', inEditMode);
			this.$deleteAnimButton.toggleClass('disabled', inEditMode);
		}

		/*
		 * Events
		 */

		private onAnimationChange = (animation:Animation, event:Event) =>
		{
			const type = event.type;

			if(type == 'position' || type == 'clear')
			{
				this.updateFrameLabel();
			}
			else if(type == 'length')
			{
				this.updateFrameLabel();
			}
		};

		private onAnimationSelect = (event) =>
		{
			this.model.setActiveAnimation(this.$animationSelect.val());
		};

		private onDeleteConfirmDlgOpen = (event) =>
		{
			this.$deleteConfirmDlg.find('strong').html(this.animation.name);
		};

		private onDeleteConfirmClick = (event) =>
		{
			if(event.target.innerText == 'Yes')
			{
				this.model.deleteAnimation();
			}

			this.deleteConfirmDlg.close();
		};

		private onModelAnimationChange = (animation:Animation, event:Event) =>
		{
			const type = event.type;

			if(type == 'updateAnimationList' || type == 'newAnimation')
			{
				this.$animationSelect.empty();
				var animList:Animation[] = this.model.getAnimationList();
				var i = 0;
				for(var anim of animList)
				{
					this.$animationSelect.append($(`<option>${i > 0 ? anim.name : 'None'}</option>`));
					i++;
				}
			}

			if(type == 'setAnimation' || type == 'updateAnimationList')
			{
				this.animation = animation;
				this.$animationSelect.val(animation.name);
			}
		};

		private onToolbarButtonClick = (event) =>
		{
			this.timeline.focus();
			const mode = this.timeline.getMode();

			var $btn = $(event.target);
			if($btn.hasClass('disabled')) return;

			const type = $btn.data('action');

			if(mode != EditMode.EDIT)
			{
				if(type == 'play' || type == 'pause')
				{
					this.timeline.togglePlayback();
				}
			}

			if(mode == EditMode.ANIMATE)
			{
				if(type == 'prev-frame')
				{
					this.timeline.prevFrame(event.shiftKey);
				}
				else if(type == 'next-frame')
				{
					this.timeline.nextFrame(event.shiftKey);
				}

				else if(type == 'prev-keyframe')
				{
					this.animation.gotoPrevKeyframe();
				}
				else if(type == 'next-keyframe')
				{
					this.animation.gotoNextKeyframe();
				}

				else if(type == 'insert-keyframe')
				{
					this.animation.forceKeyframe(event.shiftKey ? null : this.model.getSelectedNode());
				}
				else if(type == 'delete-keyframe')
				{
					this.animation.deleteKeyframe(event.shiftKey ? null : this.model.getSelectedNode());
				}
				else if(type == 'trim-length')
				{
					this.animation.trimLength();
				}
			}

			if(type == 'add-anim')
			{
				this.model.addNewAnimation(null, true);
			}
			else if(type == 'delete-anim')
			{
			}
		};

	}

}
