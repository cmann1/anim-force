namespace app.projects
{

	import Key = KeyCodes.Key;
	import PromptDlg = app.ui.PromptDlg;
	import PouchDB = pouchDB.IPouchDB;
	import Model = app.model.Model;
	import Dialog = app.ui.Dialog;

	export type LoadData = {
		get:(key:string) => any,
		asLoadData:(obj:any) => LoadData,
		[key:string]:any
	};

	function LoadData_get(key:string):any
	{
		if(!this.hasOwnProperty(key))
			throw new Error('Invalid data. Cannot find property: ' + key);

		return this[key];
	}

	function LoadData_asLoadData(obj:any):LoadData
	{
		obj.get = this.get;
		obj.asLoadData = this.asLoadData;

		return obj;
	}

	export class ProjectManager
	{

		private projectsDb:PouchDB;

		private activeProject:Project;
		private activeProjectRev:string = null;
		private overwriteProjectRev:string = null;

		private dlgStack:Dialog[] = [];

		private promptDlg:PromptDlg;
		private confirmOverwriteDlg:Dialog;
		private $confirmOverwriteName:JQuery;
		private confirmDlg:Dialog;

		private projectManagerDlg:Dialog;
		private projectListTooltips:jBox;

		private $selectedProjectItem:JQuery = null;

		private $contentPane:JQuery;
		private $itemList:JQuery;
		private $projectItems = {};
		private projectCount = 0;

		private $buttons:JQuery;
		private $openBtn:JQuery;
		private $importBtn:JQuery;

		constructor() { }

		public init(callback:() => void)
		{
			app.$window.on('keydown', this.onWindowKeyDown);

			this.projectsDb = new PouchDB('app-projects', {adapter: 'idb', revs_limit: 3, auto_compaction: true});
			this.projectsDb.createIndex({
				index: {fields: ['name']}
			}).then(() => {
				this.projectsDb.createIndex({
					index: {fields: ['date']}
				});
			});

			// < Delete indices >
			// this.projectsDb.getIndexes().then((result) => {
			// 	for(var index of result.indexes)
			// 	{
			// 		if(index.ddoc)
			// 			this.projectsDb.deleteIndex(index);
			// 	}
			// });

			if(Config.loadLastProjectOnStartUp && Config.activeProject)
			{
				// TODO: Implement loadLastProjectOnStartUp
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

		//

		private deleteProject(projectId:string)
		{
			var $projectItem = this.$projectItems[projectId];

			if($projectItem)
			{
				if($projectItem.is(this.$selectedProjectItem))
				{
					this.selectProjectItem(null);
				}

				$projectItem.remove();
				this.projectManagerDlg.reposition();
			}

			this.projectsDb.get(String(projectId)).then((doc:any) => {
				return this.projectsDb.remove(doc);
			}).then(() => {
				App.notice('Project deleted');
			}).catch(() => {
				App.notice('ERROR: Unable to delete project', 'red');
			});

			delete this.$projectItems[projectId];
			this.projectCount--;

			if(this.activeProject.name == projectId)
			{
				this.activeProjectRev = null;
			}

			if(this.projectCount < 1)
			{
				this.setLoadingMessage('No projects found');
			}
		}

		private newProject()
		{
			this.activeProject = new Project('New Project');
			this.activeProject.addModel(new Model());
		}

		private openProject(projectId)
		{
			// TODO: Implement opening
			this.projectManagerDlg.close();

			this.projectsDb.get(String(projectId)).then((doc:any) => {
				try
				{
					doc.get = LoadData_get;
					doc.asLoadData = LoadData_asLoadData;

					this.activeProject = Project.load(doc);
					this.activeProjectRev = doc.rev;
					app.main.setProject(this.activeProject);
				}
				catch(error)
				{
					App.notice('  > ' + error.toString(), 'red');
					App.notice(`Error loading project data: <strong>${projectId}</strong>`, 'red');
				}
			}).catch(() => {
				App.notice(`ERROR: Unable to open project: <strong>${projectId}</strong>`, 'red');
			});
		}

		private save()
		{
			if(this.activeProjectRev == null)
			{
				this.saveAs();
				return;
			}

			this.saveActiveProject();
		}

		private saveAs()
		{
			this.showPromptDlg();
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
			}).catch((err) => {
				App.notice('Error saving project', 'red');
				console.error(err);
			});
		}

		//

		private askDeleteProject(projectId:string)
		{
			this.showConfirmDlg(
				'Confirm Delete',
				`<strong>${projectId}</strong><br><br>
				Are you sure you want to delete this project?<br>
				This action cannot be undone.`,
				'DeleteProject',
				projectId
			);
		}

		//noinspection JSMethodCanBeStatic
		private disableButton($button, disabled=true)
		{
			$button.prop('disabled', disabled).toggleClass('disable', disabled);
		}

		private selectProjectItem($item:JQuery)
		{
			if(this.$selectedProjectItem)
			{
				this.$selectedProjectItem.removeClass('selected');
			}

			this.$selectedProjectItem = $item;

			if(this.$selectedProjectItem)
			{
				this.$selectedProjectItem.addClass('selected');
			}

			this.disableButton(this.$openBtn, !this.$selectedProjectItem);
		}

		private selectPreviousProjectItem()
		{
			var $prev:JQuery = null;

			if(this.$selectedProjectItem)
			{
				$prev = this.$selectedProjectItem.prev();
				if(!$prev.length) $prev =  null;
			}

			if(!$prev)
			{
				$prev = this.$itemList.find('.project-item:last');
			}

			this.selectProjectItem($prev);
		}

		private selectNextProjectItem()
		{
			var $next:JQuery = null;

			if(this.$selectedProjectItem)
			{
				$next = this.$selectedProjectItem.next();
				if(!$next.length) $next =  null;
			}

			if(!$next)
			{
				$next = this.$itemList.find('.project-item:first');
			}

			this.selectProjectItem($next);
		}

		private setLoadingMessage(message?:string)
		{
			this.$selectedProjectItem = null;
			this.$itemList
				.empty()
				.toggleClass('loading', message != null);

			if(message != null)
			{
				this.$itemList.append('<div class="loading-message">' + message + '</div>');
			}
		}

		private showConfirmDlg(title?:string, content?:string, name?:string, confirmValue?:string, cancelValue?:string)
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
					closeOnClick: 'body',
					confirm: this.onConfirm,
					close: this.onDlgClose,
					zIndex: 20000
				});
			}

			if(this.dlgStack.indexOf(this.confirmDlg) != -1) return;

			if(title != null)
				this.confirmDlg.setTitle(title);
			if(content != null)
				this.confirmDlg.setContent(content);
			if(name != null)
				this.confirmDlg.setName(name);

			this.dlgStack.push(this.confirmDlg);
			this.confirmDlg.confirmValue = confirmValue;
			this.confirmDlg.cancelValue = cancelValue;
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
					confirm: this.onOverwriteConfirm,
					close: this.onDlgClose,
					zIndex: 20000
				});
				this.$confirmOverwriteName = this.confirmOverwriteDlg.getContent().find('strong');
			}

			if(this.dlgStack.indexOf(this.confirmOverwriteDlg) != -1) return;

			if(name != null)
			{
				this.$confirmOverwriteName.html(name);
			}

			this.dlgStack.push(this.confirmOverwriteDlg);
			this.confirmOverwriteDlg.show();
		}

		private showProjectManager()
		{
			if(!this.projectManagerDlg)
			{
				this.$contentPane = $('<div id="project-manager" tabindex="0"><div class="item-list"></div></div>')
					.on('keydown', this.onProjectManagerKeyDown);
				this.$itemList = this.$contentPane.find('.item-list')
					.on('click', 'i', this.onProjectListAction)
					.on('click', 'div.project-item', this.onProjectListItemSelect)
					.on('dblclick', 'div.project-item', this.onProjectListItemDoubleClick);

				this.projectManagerDlg = new Dialog('ProjectManager', {
					name: 'ProjectManager',
					icon: 'tasks',
					content: this.$contentPane,
					buttons: [
						{label: 'Open', confirm: true},
						{label: 'Cancel', cancel: true},
						{label: 'Import', rightAlign: true}
					],
					position: {x: 'center', y: 'top'},
					offset: {y: 25},
					confirm: this.onConfirm,
					close: this.onDlgClose,
					button: this.onProjectManagerButtonClick
				});

				this.$buttons = this.projectManagerDlg.getButtons();
				this.$openBtn = this.projectManagerDlg.getButton('Open');
				this.$importBtn = this.projectManagerDlg.getButton('Import');

				this.projectListTooltips = new jBox('Tooltip', { theme: 'TooltipDark'});
			}

			if(this.dlgStack.indexOf(this.projectManagerDlg) != -1) return;

			this.setLoadingMessage('<i class="fa fa-spinner fa-spin"></i> Loading...');

			this.disableButton(this.$openBtn);
			this.disableButton(this.$importBtn);

			this.projectsDb.find({
				selector: {
					name: {$gte: null},
					date: {$gte: null}
				},
				fields: ['_id', 'name'],
				sort: [{'date': 'desc'}]
			}).then(this.updateProjectsList);

			this.dlgStack.push(this.projectManagerDlg);
			this.projectManagerDlg.show();
		}

		private showPromptDlg()
		{
			if(!this.promptDlg)
			{
				this.promptDlg = new PromptDlg('Save As', {
					confirm: this.onSaveAsConfirm,
					close: this.onDlgClose
				});
			}

			if(this.dlgStack.indexOf(this.promptDlg) != -1) return;

			this.dlgStack.push(this.promptDlg);
			this.promptDlg.show(this.activeProject.name);
		}

		private updateProjectsList = (results) =>
		{
			this.setLoadingMessage();
			this.projectListTooltips.detach();
			this.$projectItems = {};
			this.projectCount = results.docs.length;

			if(!results.docs.length)
			{
				this.setLoadingMessage('No projects found');
			}

			for(var doc of results.docs)
			{
				var $item = $(`
				<div class="project-item" data-project-id="${doc.name}">
					<label for="">${doc.name}</label>
					<div class="flex-filler"></div>
					<i class="fa fa-i-cursor btn" title="Rename" data-action="rename"></i>
					<i class="fa fa-download btn" title="Export to file" data-action="export"></i>
					<i class="fa fa-close btn" title="Delete" data-action="delete"></i>
				</div>
				`);
				this.$itemList.append($item);
				this.$projectItems[doc.name] = $item;
			}

			this.projectListTooltips.attach(this.$itemList.find('i'));
			this.$contentPane.focus();

			this.disableButton(this.$importBtn, false);

			this.projectManagerDlg.reposition();
			setTimeout(() => {
				this.projectManagerDlg.reposition();
			}, 100);
		};

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

			else if(name == 'ProjectManager')
			{
				if(this.$selectedProjectItem)
				{
					this.openProject(this.$selectedProjectItem.data('project-id'));
				}
			}

			else if(name == 'DeleteProject')
			{
				this.deleteProject(value);
			}
		};

		private onDlgClose = (dlg:Dialog) =>
		{
			this.dlgStack.splice(this.dlgStack.indexOf(dlg), 1);
		};

		private onOverwriteConfirm = (name:string, value:any) =>
		{
			this.activeProjectRev = this.overwriteProjectRev;
			this.overwriteProjectRev = null;

			this.saveActiveProject();
		};

		private onProjectListAction = (event) =>
		{
			const $button = $(event.target);
			const action = $button.data('action');
			const projectId = $button.closest('.project-item').data('project-id');

			console.log('onProjectListAction', action, projectId);

			if(action == 'export')
			{
				// TODO: Implement exporting
			}
			else if(action == 'delete')
			{
				this.askDeleteProject(projectId);
			}
		};

		private onProjectListItemDoubleClick = (event) =>
		{
			if(this.$selectedProjectItem)
			{
				this.openProject(this.$selectedProjectItem.data('project-id'));
			}
		};

		private onProjectListItemSelect = (event) =>
		{
			this.selectProjectItem($(event.currentTarget));
		};

		private onProjectManagerKeyDown = (event) =>
		{
			const key = event.keyCode;

			if(key == Key.Enter)
			{
				if(this.$selectedProjectItem)
				{
					this.openProject(this.$selectedProjectItem.data('project-id'));
				}
			}
			else if(key == Key.Delete)
			{
				if(this.$selectedProjectItem)
				{
					this.askDeleteProject(this.$selectedProjectItem.data('project-id'));
				}
			}

			else if(key == Key.UpArrow)
			{
				this.selectPreviousProjectItem();
			}
			else if(key == Key.DownArrow)
			{
				this.selectNextProjectItem();
			}
		};

		private onProjectManagerButtonClick = (buttonId:string) =>
		{
			if(buttonId == 'Import')
			{
				// TODO: Implement import
				console.log('Importing');
			}
		};

		private onSaveAsConfirm = (name:string, value:string) =>
		{
			value = $.trim(value);

			if(value == '')
			{
				App.notice('Invalid project name', 'red');
				setTimeout(() => {
					this.saveAs();
				}, 50);
				return;
			}

			this.activeProject.name = value;

			this.projectsDb.get(value).then((doc:any) => {
				this.overwriteProjectRev = doc._rev;
				this.showConfirmOverwriteDlg(value);
			}).catch(() => {
				this.activeProjectRev = null;
				this.saveActiveProject();
			});
		};

		private onWindowKeyDown = (event) =>
		{
			if(this.dlgStack.length) return;

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
					this.showProjectManager();
					consume = true;
				}
			}

			else if(shiftKey)
			{
				if(keyCode == Key.N)
				{
					this.showConfirmDlg(
						'Confirm New Project',
						'Any unsaved changes will be lost.<br>Are you sure you want to continue?',
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