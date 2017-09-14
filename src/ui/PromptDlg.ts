namespace app.ui
{

	import Key = KeyCodes.Key;

	export class PromptDlg extends Dialog
	{

		private $input:JQuery;

		constructor(title:string, options:any)
		{
			super(title, PromptDlg.getOptions(options));

			this.$input = $('<input type="text"/>').on('keypress', this.onInputKeyPress);
			super.setContent(this.$input);
		}

		public show(value:string=null)
		{
			this.isOpen = true;

			this.$input.val(value === null ? '' : value);
			this.dlg.open();
			this.$input.focus();
		}

		public setContent(content:string|HTMLElement|JQuery) { console.log('Set content not allowed on PromptDlg'); }

		protected static getOptions(options:any)
		{
			if(!options.buttons)
			{
				options.buttons = [
					{label: 'Save', confirm: true},
					{label: 'Cancel', cancel: true}
				];
			}

			return options;
		}

		protected getConfirmValue():any
		{
			return this.$input.val();
		}

		protected getCancelValue():any { return null; }

		/*
		 * Events
		 */

		private onInputKeyPress = (event) =>
		{
			if(event.keyCode == Key.Enter)
			{
				this.confirm(this.$input.val());
				this.dlg.close();
			}
		};

	}

}