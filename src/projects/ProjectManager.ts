namespace app.projects
{

	import Key = KeyCodes.Key;
	import PromptDlg = app.ui.PromptDlg;
	import PouchDB = pouchDB.IPouchDB;
	import Model = app.model.Model;
	import Dialog = app.ui.Dialog;

	export class ProjectManager
	{

		private projectsDb:PouchDB;

		private activeProject:Project;
		private activeProjectRev:string = null;
		private overwriteProjectRev:string = null;

		private promptDlg:PromptDlg;
		private confirmOverwriteDlg:Dialog;
		private $confirmOverwriteName:JQuery;

		constructor() { }

		public init(callback:() => void)
		{
			app.$window.on('keydown', this.onWindowKeyDown);

			this.projectsDb = new PouchDB('app-projects', {adapter: 'idb', revs_limit: 3, auto_compaction: true});
			this.projectsDb.createIndex({
				index: {fields: ['_id', 'data']}
			});

			if(Config.loadLastProjectOnStartUp && Config.activeProject)
			{
				// TODO: Implement loadLastProjectOnStartUp
				// db.allDocs({include_docs: true}).then(function(results){
				// 	for(var data of results.rows)
				// 	{
				// 		Config[data.id] = (<any> data.doc).value;
				// 	}
				// 	Config.isLoaded = true;
				// }).then(callback);
			}
			else{
				this.activeProject = new Project('New Project');
				this.activeProject.addModel(new Model());
				callback();
			}

			this.confirmOverwriteDlg = new Dialog('Confirm Overwrite', {
				type: 'warning',
				content: '<strong>XXX</strong> already exists.<br>Do you want to overwrite it?',
				buttons: [
					{label: 'Yes', confirm: true, focus: true},
					{label: 'No', cancel: true}
				],
				confirm: this.onOverwriteConfirm
			});
			this.$confirmOverwriteName = this.confirmOverwriteDlg.getContent().find('strong');
		}

		public getActiveProject():Project
		{
			return this.activeProject;
		}

		public save()
		{
			if(this.activeProjectRev == null)
			{
				this.saveAs();
				return;
			}

			this.saveActiveProject();
		}

		public saveAs()
		{
			if(!this.promptDlg)
			{
				this.promptDlg = new PromptDlg('Save As', {confirm: this.onSaveAsConfirm});
			}

			this.promptDlg.show(this.activeProject.name);
		}

		private saveActiveProject()
		{
			var data = this.activeProject.save();
			data._id = data.name;

			if(this.activeProjectRev != null)
			{
				data._rev = this.activeProjectRev;
			}

			this.projectsDb.put(data).then((response:any) => {
				App.notice('Project saved', 'blue');
				this.activeProjectRev = response.rev;
			}).catch(() => {
				App.notice('Error saving project', 'red');
			});
		}

		/*
		 * Events
		 */

		private onOverwriteConfirm = (value:any) =>
		{
			this.activeProjectRev = this.overwriteProjectRev;
			this.overwriteProjectRev = null;

			this.saveActiveProject();
		};

		private onSaveAsConfirm = (value:string) =>
		{
			value = $.trim(value);

			this.projectsDb.get(value).then((doc:any) => {
				this.overwriteProjectRev = doc._rev;
				this.$confirmOverwriteName.html(value);
				this.confirmOverwriteDlg.show();
			}).catch(() => {
				this.activeProject.name = value;
				this.saveActiveProject();
			});
		};

		private onWindowKeyDown = (event) =>
		{
			const keyCode = event.keyCode;
			const shiftKey = event.shiftKey;
			const ctrlKey = event.ctrlKey;

			var consume = false;

			if(ctrlKey)
			{
				if(keyCode == Key.S)
				{
					if(shiftKey)
						this.saveAs();
					else
						this.save();
					consume = true;
				}
				else if(keyCode == Key.O)
				{
					consume = true;
				}
				else if(keyCode == Key.N)
				{
					consume = true;
				}
			}

			if(consume)
			{
				event.preventDefault();
				return false;
			}
		};

	}

}