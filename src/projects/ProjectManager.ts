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

	function LoadData_asLoadData(obj:string|any):LoadData
	{
		if(typeof(obj) == 'string')
		{
			obj = this.get(obj);
		}

		obj.get = LoadData_get;
		obj.asLoadData = LoadData_asLoadData;

		return obj;
	}

	export class ProjectManager
	{

		private projectsDb:PouchDB;

		private activeProject:Project;
		private overwriteProjectId:string = null;
		private overwriteProjectRev:string = null;
		private overwriteProjectName:string = null;
		private renameProjectId = null;

		private dlgStack:Dialog[] = [];

		private promptDlg:PromptDlg;
		private confirmOverwriteDlg:Dialog;
		private $confirmOverwriteName:JQuery;
		private confirmDlg:Dialog;

		private projectManagerDlg:Dialog;
		private projectListTooltips:jBox;

		private $fileOpenInput:JQuery;

		private $selectedProjectItem:JQuery = null;

		private $contentPane:JQuery;
		private $itemList:JQuery;
		private $projectItems = {};
		private projectCount = 0;

		private $buttons:JQuery;
		private $openBtn:JQuery;
		private $importBtn:JQuery;
		private $loadLastInput:JQuery;

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
				this.openProject(Config.activeProject, Config.activeProjectName, () => {
					if(!this.activeProject)
						this.newProject();
					callback();
				});

				return;
			}

			this.newProject();
			callback();
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

			if(this.activeProject.id == projectId)
			{
				this.activeProject.id = null;
				this.activeProject.rev = null;
				Config.set('activeProject', null);
				Config.set('activeProjectName', null);
			}

			if(this.projectCount < 1)
			{
				this.setLoadingMessage('No projects found');
			}
		}

		private exportProject(projectId, projectName)
		{
			this.projectsDb.get(String(projectId)).then((doc:any) => {
				delete doc._id;
				delete doc._rev;
				delete doc.date;

				var blob = new Blob([JSON.stringify(doc)], {type: 'text/json;charset=utf-8'});
				saveAs(blob, projectName + '.json');

			}).catch((error) => {
				App.notice(`ERROR: Unable to read project for export: <strong>${projectName}</strong>`, 'red');
				console.error(error);
			});
		}

		private importFromFile(file:File)
		{
			var reader = new FileReader();
			reader.onload = (event:any) => {
				try
				{
					var doc:LoadData = JSON.parse(event.target.result);
					doc.date = new Date().toJSON();
					// console.log(doc);

					if(!doc.name) throw new Error();
					var projectName = doc.name;

					this.projectsDb.find({
						selector: {
							name: {$eq: name}
						},
						fields: ['_id', '_rev'],
						limit: 1
					}).then((results:any) => {
						if(results.docs.length)
						{
							App.notice('Cannot import: A project with that name already exists');
						}
						else
						{
							this.projectsDb.post(<any> doc).then((response:any) => {
								this.loadProjects();
								App.notice('Project imported');
							}).catch((err) => {
								App.notice('Error importing project', 'red');
								console.error(err);
							});
						}
					}).catch((error) => {
						App.notice('There was an error reading from the database');
						console.error(error);
					});
				}
				catch(error)
				{
					App.notice('Cannot import: Invalid JSON data', 'red');
				}
			};

			reader.readAsText(file);
		}

		private loadProjects()
		{
			this.setLoadingMessage('<i class="fa fa-spinner fa-spin"></i> Loading...');

			this.disableButton(this.$openBtn);
			this.disableButton(this.$importBtn);
			this.$loadLastInput.prop('checked', Config.loadLastProjectOnStartUp);

			this.projectsDb.find({
				selector: {
					name: {$gte: null},
					date: {$gte: null}
				},
				fields: ['_id', 'name'],
				sort: [{'date': 'desc'}]
			}).then(this.updateProjectsList);
		}

		private newProject()
		{
			this.activeProject = new Project('New Project');
			this.activeProject.addModel(new Model());
			this.activeProject.id = null;
			this.activeProject.rev = null;
			Config.set('activeProject', null);
			Config.set('activeProjectName', null);

			app.main.setProject(this.activeProject);
		}

		private openProject(projectId:string, projectName:string, callback=null)
		{
			this.projectManagerDlg && this.projectManagerDlg.close();

			this.projectsDb.get(String(projectId)).then((doc:any) => {
				try
				{
					doc = LoadData_asLoadData(doc);

					this.activeProject = Project.load(doc);
					Config.set('activeProject', this.activeProject.id);
					Config.set('activeProjectName', this.activeProject.name);
					app.main.setProject(this.activeProject);
					callback && callback();
				}
				catch(error)
				{
					App.notice('  > ' + error.toString(), 'red');
					App.notice(`Error loading project data: <strong>${projectName}</strong>`, 'red');
					console.error(error);
					callback && callback();
				}
			}).catch((error) => {
				App.notice(`ERROR: Unable to open project: <strong>${projectName}</strong>`, 'red');
				console.error(error);
				callback && callback();
			});
		}

		private renameProject(projectId:string, newName:string)
		{
			newName = $.trim(newName);
			if(newName == projectId) return;

			this.projectsDb.find({
				selector: {
					name: {$eq: newName}
				},
				fields: ['_id', '_rev'],
				limit: 1
			}).then((results:any) => {
				if(results.docs.length)
				{
					App.notice('Unable to rename.<br> - A project with that name already exist.', 'red');
				}
				else
				{
					this.projectsDb.get(String(projectId)).then((doc:any) => {
						doc.name = newName;
						return this.projectsDb.put(doc);
					}).then(() => {
						if(projectId == this.activeProject.id)
						{
							this.activeProject.name = newName;
							Config.set('activeProject', this.activeProject.id);
							Config.set('activeProjectName', this.activeProject.name);
						}

						this.$projectItems[projectId]
							.data('project-name', newName)
							.find('label').html(newName);

						App.notice('Project renamed');
					}).catch(() => {
						App.notice('There was a problem renaming the project.', 'red');
					});
				}
			}).catch((error) => {
				App.notice('There was an error reading from the database');
				console.error(error);
			});
		}

		private saveActiveProject()
		{
			var data = this.activeProject.save();

			(data._id ? this.projectsDb.put(data) : this.projectsDb.post(data)).then((response:any) => {
				App.notice('Project saved', 'blue');
				this.activeProject.id = response.id;
				this.activeProject.rev = response.rev;
				Config.set('activeProject', this.activeProject.id);
				Config.set('activeProjectName', this.activeProject.name);
			}).catch((err) => {
				App.notice('Error saving project', 'red');
				console.error(err);
			});
		}

		private saveProjectAs(name:string)
		{
			this.projectsDb.find({
				selector: {
					name: {$eq: name}
				},
				fields: ['_id', '_rev'],
				limit: 1
			}).then((results:any) => {
				if(results.docs.length)
				{
					this.overwriteProjectId = results.docs[0]._id;
					this.overwriteProjectRev = results.docs[0]._rev;
					this.overwriteProjectName = name;
					this.showConfirmOverwriteDlg(name);
				}
				else
				{
					this.activeProject.id = null;
					this.activeProject.rev = null;
					this.activeProject.name = name;
					this.saveActiveProject();
				}
			}).catch((error) => {
				App.notice('There was an error reading from the database');
				console.error(error);
			});
		}

		//

		private askDeleteProject(projectId:string, projectName:string)
		{
			this.showConfirmDlg(
				'Confirm Delete',
				`<strong>${projectName}</strong><br><br>
				Are you sure you want to delete this project?<br>
				This action cannot be undone.`,
				'DeleteProject',
				projectId
			);
		}

		private askImport()
		{
			if(!this.$fileOpenInput)
			{
				this.$fileOpenInput = $('<input>').prop({
					type: 'file',
					// multiple: true,
					accept: '.json'
				}).on('change', (event) => {
					this.importFromFile(this.$fileOpenInput.prop('files')[0]);
				});
			}

			this.$fileOpenInput.trigger('click');
		}

		private rename(projectId:string, projectName:string)
		{
			this.renameProjectId = projectId;
			this.showPromptDlg('RenameProject', 'Rename', projectName, this.onConfirm);
		}

		private save()
		{
			if(this.activeProject.rev == null)
			{
				this.saveAs();
				return;
			}

			this.saveActiveProject();
		}

		private saveAs()
		{
			this.showPromptDlg('SaveAs', 'Save As', this.activeProject.name, this.onSaveAsConfirm);
		}

		//

		//noinspection JSMethodCanBeStatic
		private disableButton($button, disabled=true)
		{
			$button.prop('disabled', disabled).toggleClass('disable', disabled);
		}

		private pushDlg(dlg:Dialog):boolean
		{
			if(this.dlgStack.indexOf(dlg) != -1) return false;

			if(this.dlgStack.length)
				this.dlgStack[this.dlgStack.length - 1].disable();

			this.dlgStack.push(dlg);
			return true;
		}

		private popDialog(dlg:Dialog)
		{
			this.dlgStack.splice(this.dlgStack.indexOf(dlg), 1);

			if(this.dlgStack.length)
				this.dlgStack[this.dlgStack.length - 1].enable();
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

			if(!this.pushDlg(this.confirmDlg)) return;

			if(title != null)
				this.confirmDlg.setTitle(title);
			if(content != null)
				this.confirmDlg.setContent(content);
			if(name != null)
				this.confirmDlg.setName(name);

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

			if(!this.pushDlg(this.confirmOverwriteDlg)) return;

			if(name != null)
			{
				this.$confirmOverwriteName.html(name);
			}

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

				var $options = $(`<div class="options">
					<label>Load on startup <input type="checkbox"></label>
				</div>`);
				this.$loadLastInput = $options.find('input')
					.on('change', this.onLoadLastInputChange);

				this.projectManagerDlg = new Dialog('ProjectManager', {
					name: 'ProjectManager',
					dlgClass: 'project-manager-dlg',
					icon: 'tasks',
					content: this.$contentPane,
					buttons: [
						{label: 'Open', confirm: true},
						{label: 'Cancel', cancel: true},
						{content: $options, rightAlign: true},
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

			if(!this.pushDlg(this.projectManagerDlg)) return;

			this.loadProjects();
			this.projectManagerDlg.show();
		}

		private showPromptDlg(name:string, title:string, value:string, confirm=null)
		{
			if(!this.promptDlg)
			{
				this.promptDlg = new PromptDlg('Confirm', {
					buttons: [
						{label: 'Accept', confirm: true},
						{label: 'Cancel', cancel: true}
					],
					confirm: null,
					close: this.onDlgClose,
					zIndex: 15000
				});
			}

			if(!this.pushDlg(this.promptDlg)) return;

			this.promptDlg.confirmCallback = confirm;
			this.promptDlg.name = name;
			this.promptDlg.setTitle(title);
			this.promptDlg.show(value);
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
				<div class="project-item" data-project-id="${doc._id}" data-project-name="${doc.name}">
					<label for="">${doc.name}</label>
					<div class="flex-filler"></div>
					<i class="fa fa-i-cursor btn" title="Rename" data-action="rename"></i>
					<i class="fa fa-download btn" title="Export to file" data-action="export"></i>
					<i class="fa fa-close btn" title="Delete" data-action="delete"></i>
				</div>
				`);
				this.$itemList.append($item);
				this.$projectItems[doc._id] = $item;
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
			// console.log('onConfirm', name, value);

			if(name == 'NewProject')
			{
				this.newProject();
			}

			else if(name == 'ProjectManager')
			{
				if(this.$selectedProjectItem)
				{
					this.openProject(
						this.$selectedProjectItem.data('project-id'),
						this.$selectedProjectItem.data('project-name')
					);
				}
			}

			else if(name == 'DeleteProject')
			{
				this.deleteProject(value);
			}

			else if(name == 'RenameProject')
			{
				this.renameProject(this.renameProjectId, value);
			}
		};

		private onDlgClose = (dlg:Dialog) =>
		{
			this.popDialog(dlg);
		};

		private onLoadLastInputChange = (event) =>
		{
			Config.set('loadLastProjectOnStartUp', this.$loadLastInput.prop('checked'));
		};

		private onOverwriteConfirm = (name:string, value:any) =>
		{
			this.activeProject.id = this.overwriteProjectId;
			this.activeProject.rev = this.overwriteProjectRev;
			this.activeProject.name = this.overwriteProjectName;
			this.overwriteProjectId = null;
			this.overwriteProjectRev = null;
			this.overwriteProjectName = null;

			this.saveActiveProject();
		};

		private onProjectListAction = (event) =>
		{
			const $button = $(event.target);
			const action = $button.data('action');
			const $projectItem = $button.closest('.project-item');
			const projectId = $projectItem.data('project-id');
			const projectName = $projectItem.data('project-name');

			if(action == 'rename')
			{
				this.rename(projectId, projectName);
			}
			else if(action == 'export')
			{
				this.exportProject(projectId, projectName);
			}
			else if(action == 'delete')
			{
				this.askDeleteProject(projectId, projectName);
			}

			event.preventDefault();
			return false;
		};

		private onProjectListItemDoubleClick = (event) =>
		{
			if(this.$selectedProjectItem)
			{
				this.openProject(
					this.$selectedProjectItem.data('project-id'),
					this.$selectedProjectItem.data('project-name')
				);
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
					this.openProject(
						this.$selectedProjectItem.data('project-id'),
						this.$selectedProjectItem.data('project-name')
					);
				}
			}
			else if(key == Key.Delete)
			{
				if(this.$selectedProjectItem)
				{
					this.askDeleteProject(
						this.$selectedProjectItem.data('project-id'),
						this.$selectedProjectItem.data('project-name')
					);
				}
			}
			else if(key == Key.F2)
			{
				if(this.$selectedProjectItem)
				{
					this.rename(
						this.$selectedProjectItem.data('project-id'),
						this.$selectedProjectItem.data('project-name')
					);
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
				this.askImport();
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

			this.saveProjectAs(value);
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