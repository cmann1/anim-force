namespace app.ui
{

	export type DialogType = 'plain'|'info'|'warning'|'error';

	export class Dialog
	{
		protected static nextId = 0;

		protected dlg:jBox;
		protected $contentPane:JQuery;
		protected $dlg:JQuery;

		public name:string;
		protected title:string = '';
		protected icon:string = '';
		protected isOpen = false;

		protected $buttons:JQuery;
		protected buttonData:any = {};
		protected confirmButton:string = null;
		protected $focusButton:JQuery = null;

		public confirmCallback:(name:string, value?:any)=>void;
		public cancelCallback:(name:string, value?:any)=>void;
		public buttonCallback:(buttonId:string)=>void;
		public closeCallback:(dlg:Dialog)=>void;

		public confirmValue:any = null;
		public cancelValue:any = null;

		constructor(title:string, options?:any)
		{
			this.title = title;

			var defaults = {
				name: 'Dlg' + (++Dialog.nextId),
				pointer: false,
				pointTo: 'target',
				target: null,
				fixed: true,
				dlgClass: '',
				overlay: true,
				overlayClass: 'clear',
				closeButton: 'title',
				closeOnEsc: true,
				closeOnClick: 'overlay',
				draggable: false,
				repositionOnOpen: true,
				position: {x: 'center', y: 'center'},
				offset: {x: 0, y: 0},
				zIndex: 10000,
				type: 'plain',
				icon: null
			};
			Object['assign'](defaults, options || {});
			options = defaults;

			this.name = options.name;

			this.$dlg = $(
				`<div class="dialog button-layout ${options.type}">
					<div class="content-pane">
					
					</div>
				</div>`
			);

			if(options.buttons)
			{
				var $buttonBar = $(`<div class="button-bar"></div>`);
				this.$dlg.append($buttonBar);

				var rightButtons = [];

				var i = 0;
				for(var buttonData of options.buttons)
				{
					if(typeof(buttonData) != 'object')
					{
						buttonData = {label: buttonData};
					}

					if(i++ > 0)
						$buttonBar.append(' ');

					let $element:JQuery;

					if(buttonData.content)
					{
						$element = typeof(buttonData.content) == 'string' ? $(buttonData.content) : buttonData.content;
					}
					else
					{
						$element = $(`<button class="button">${buttonData.label}</button>`);

						if(buttonData.confirm)
							this.confirmButton = buttonData.label;
					}



					if(buttonData.rightAlign)
						rightButtons.push($element);
					else
						$buttonBar.append($element);

					if(buttonData.className)
						$element.addClass(buttonData.className);
					if(buttonData.focus)
						this.$focusButton = $element;

					buttonData.$element = $element;
					this.buttonData[buttonData.label] = buttonData;
				}

				if(rightButtons.length)
				{
					$buttonBar.append($('<div class="flex-filler wide"></div>'));

					for(let $button of rightButtons)
					{
						$buttonBar.append($button);
					}
				}
			}

			this.$buttons = this.$dlg.find('.button-bar button');

			this.confirmCallback = options.confirm;
			this.cancelCallback = options.cancel;
			this.buttonCallback = options.button;
			this.closeCallback = options.close;

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
				pointer: options.pointer,
				pointTo: options.pointTo,
				fixed: options.fixed,
				target: options.target,
				addClass: 'jbox-dialog-wrapper ' + options.type + ' ' + options.dlgClass,
				overlay: options.overlay,
				overlayClass: options.overlayClass,
				closeButton: options.closeButton,
				closeOnEsc: options.closeOnEsc,
				closeOnClick: options.closeOnClick,
				draggable: options.draggable,
				repositionOnOpen: options.repositionOnOpen,
				repositionOnContent: true,
				reposition: true,
				isolateScroll: false,
				content: this.$dlg,
				onClose: this.onDlgClose,
				zIndex: options.zIndex,
				position: options.position,
				offset: options.offset
			});
		}

		public close()
		{
			if(this.isOpen)
			{
				this.cancel();
				this.dlg.close();
			}
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

		public disable()
		{
			this.dlg.disable();
		}

		public enable()
		{
			this.dlg.enable();
		}

		public getButtons():JQuery
		{
			return this.$buttons;
		}

		public getButton(label:string):JQuery
		{
			var buttonData = this.buttonData[label];

			return buttonData ? buttonData.$element : null;
		}

		public getContent():JQuery
		{
			return this.$contentPane;
		}

		public get dialog():jBox
		{
			return this.dlg;
		}

		public reposition()
		{
			this.dlg.position();
		}

		public setContent(content:string|HTMLElement|JQuery)
		{
			this.$contentPane.empty().append(content);
			this.dlg && this.dlg.setContent(this.$dlg);
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

		//

		protected confirm(value?:any)
		{
			if(this.confirmCallback)
			{
				this.confirmCallback(this.name, value != undefined ? value : this.getConfirmValue());
			}
		}

		protected cancel(value?:any)
		{
			if(this.cancelCallback)
			{
				this.cancelCallback(this.name, value != undefined ? value : this.getCancelValue());
			}
		}

		protected getConfirmValue():any
		{
			return this.confirmValue;
		}

		protected getCancelValue():any
		{
			return this.cancelValue;
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
				this.dlg.close();
			}
			else if(this.buttonData[id].cancel)
			{
				this.cancel();
				this.dlg.close();
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

				if(this.closeCallback)
				{
					this.closeCallback(this);
				}
			}
		};

	}

}