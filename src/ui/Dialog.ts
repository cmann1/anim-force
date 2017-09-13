namespace app.ui
{

	export type DialogType = 'plain'|'info'|'warning'|'error';

	export class Dialog
	{
		protected static nextId = 0;

		protected dlg:jBox;
		protected $contentPane:JQuery;
		protected $dlg:JQuery;

		protected name:string;
		protected title:string = '';
		protected icon:string = '';
		protected isOpen = false;

		protected confirmCallback:(name:string, value?:any)=>void;
		protected cancelCallback:(name:string, value?:any)=>void;
		protected buttonCallback:(button:string)=>void;

		protected buttonData:any = {};
		protected confirmButton:string = null;
		protected $focusButton:JQuery = null;

		constructor(title:string, options?:any)
		{
			this.title = title;

			var defaults = {
				name: 'Dlg' + (++Dialog.nextId),
				overlay: true,
				overlayClass: 'clear',
				closeButton: true,
				closeOnEsc: true,
				closeOnClick: 'body',
				type: 'plain',
				icon: null
			};
			Object['assign'](defaults, options || {});
			options = defaults;

			this.name = options.name;

			this.$dlg = $(
				`<div class="dialog ${options.type}">
					<div class="content-pane">
					
					</div>
				</div>`
			);

			if(options.buttons)
			{
				var $buttonBar = $(`<div class="button-bar"></div>`);
				this.$dlg.append($buttonBar);
				var i = 0;
				for(var buttonData of options.buttons)
				{
					if(typeof(buttonData) != 'object')
					{
						buttonData = {label: buttonData};
					}

					if(i++ > 0)
						$buttonBar.append(' ');

					var $button = $(`<button class="button">${buttonData.label}</button>`);
					$buttonBar.append($button);

					if(buttonData.className)
						$button.addClass(buttonData.className);
					if(buttonData.confirm)
						this.confirmButton = buttonData.label;
					if(buttonData.focus)
						this.$focusButton = $button;

					this.buttonData[buttonData.label] = buttonData;
				}
			}

			if(options.confirm)
				this.confirmCallback = options.confirm;
			if(options.cancel)
				this.cancelCallback = options.cancel;
			if(options.button)
				this.buttonCallback = options.button;

			this.$contentPane = this.$dlg.find('.content-pane');
			this.$dlg.find('.button-bar').on('click', 'button', this.onButtonClick);

			if(options.content)
			{
				this.setContent(options.content);
			}

			if(!options.icon)
			{
				if(options.type == 'info')
					options.icon = 'info-circle';
				else if(options.type == 'warning' || options.type == 'error')
					options.icon = 'warning';
			}

			if(options.icon)
			{
				this.icon = `<i class="fa fa-${options.icon} fa-2x"></i> `;
			}

			this.dlg = new jBox('Modal', {
				title: this.icon + this.title,
				addClass: options.type,
				overlay: options.overlay,
				overlayClass: options.overlayClass,
				closeButton: options.closeButton,
				closeOnEsc: options.closeOnEsc,
				closeOnClick: options.closeOnClick,
				content: this.$dlg,
				onClose: this.onDlgClose
			});
		}

		public show()
		{
			this.isOpen = true;
			this.dlg.open();

			if(this.$focusButton)
			{
				this.$focusButton.focus();
			}
		}

		public confirm(value?:any)
		{
			this.isOpen = false;
			this.dlg.close();

			if(this.confirmCallback)
			{
				this.confirmCallback(this.name, value != undefined ? value : this.getConfirmValue());
			}
		}

		public cancel(value?:any)
		{
			this.isOpen = false;
			this.dlg.close();

			if(this.cancelCallback)
			{
				this.cancelCallback(this.name, value != undefined ? value : this.getCancelValue());
			}
		}

		public setContent(content:string|HTMLElement|JQuery)
		{
			this.$contentPane.empty().append(content);
		}

		public getContent():JQuery
		{
			return this.$contentPane;
		}

		public setTitle(title:string)
		{
			if(title == this.title) return;

			this.title = title;
			this.dlg.setTitle(this.icon + this.title);
		}

		public setConfirmCallback(callback:(value?:any)=>void)
		{
			this.confirmCallback = callback;
		}

		public setCancelCallback(callback:(value?:any)=>void)
		{
			this.cancelCallback = callback;
		}

		public setName(name:string)
		{
			this.name = name;
		}

		protected getConfirmValue():any
		{
			return null;
		}

		protected getCancelValue():any
		{
			return null;
		}

		/*
		 * Events
		 */

		protected onButtonClick = (event) =>
		{
			const id = event.target.innerText;

			if(id == this.confirmButton)
			{
				this.confirm();
			}
			else if(this.buttonData[id].cancel)
			{
				this.cancel();
			}
			else if(this.buttonCallback){
				this.buttonCallback(id);
			}
		};

		protected onDlgClose = () =>
		{
			if(this.isOpen)
			{
				this.cancel();
			}
		};

	}

}