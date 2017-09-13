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
		private confirmDlg:Dialog;

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
				this.newProject();
				callback();
			}
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

		private newProject()
		{
			this.activeProject = new Project('New Project');
			this.activeProject.addModel(new Model());
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

		private showConfirmDlg(title?:string, content?:string, name?:string)
		{
			if(!this.confirmDlg)
			{
				this.confirmDlg = new Dialog('Confirm', {
					type: 'warning',
					content: 'Are you sure?',
					buttons: [
						{label: 'Yes', confirm: true, focus: true},
						{label: 'No', cancel: true}
					],
					confirm: this.onConfirm
				});
			}

			if(title != null)
				this.confirmDlg.setTitle(title);
			if(content != null)
				this.confirmDlg.setContent(content);
			if(name != null)
				this.confirmDlg.setName(name);

			this.confirmDlg.show();
		}

		private showConfirmOverwriteDlg(name?:string)
		{
			if(!this.confirmOverwriteDlg)
			{
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

			if(name != null)
			{
				this.$confirmOverwriteName.html(name);
			}

			this.confirmOverwriteDlg.show();
		}

		/*
		 * Events
		 */

		private onConfirm = (name:string, value:any) =>
		{
			if(name == 'NewProject')
			{
				this.newProject();
				app.main.setProject(this.activeProject);
			}
		};

		private onOverwriteConfirm = (name:string, value:any) =>
		{
			this.activeProjectRev = this.overwriteProjectRev;
			this.overwriteProjectRev = null;

			this.saveActiveProject();
		};

		private onSaveAsConfirm = (name:string, value:string) =>
		{
			value = $.trim(value);

			this.projectsDb.get(value).then((doc:any) => {
				this.overwriteProjectRev = doc._rev;
				this.showConfirmOverwriteDlg(value);
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
					// TODO: implement project manager dialog/open
					consume = true;
				}
			}

			else if(shiftKey)
			{
				if(keyCode == Key.N)
				{
					this.showConfirmDlg(
						'Confirm New Project',
						'Any unsaved changes will be lost<br>Are you sure you want to continue?',
						'NewProject'
					);
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