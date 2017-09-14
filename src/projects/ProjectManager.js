var app;
(function (app) {
    var projects;
    (function (projects) {
        var Key = KeyCodes.Key;
        var PromptDlg = app.ui.PromptDlg;
        var Model = app.model.Model;
        var Dialog = app.ui.Dialog;
        function LoadData_get(key) {
            if (!this.hasOwnProperty(key))
                throw new Error('Invalid data. Cannot find property: ' + key);
            return this[key];
        }
        function LoadData_asLoadData(obj) {
            if (typeof (obj) == 'string') {
                obj = this.get(obj);
            }
            obj.get = this.get;
            obj.asLoadData = this.asLoadData;
            return obj;
        }
        var ProjectManager = (function () {
            function ProjectManager() {
                var _this = this;
                this.overwriteProjectId = null;
                this.overwriteProjectRev = null;
                this.overwriteProjectName = null;
                this.renameProjectId = null;
                this.dlgStack = [];
                this.$selectedProjectItem = null;
                this.$projectItems = {};
                this.projectCount = 0;
                this.updateProjectsList = function (results) {
                    _this.setLoadingMessage();
                    _this.projectListTooltips.detach();
                    _this.$projectItems = {};
                    _this.projectCount = results.docs.length;
                    if (!results.docs.length) {
                        _this.setLoadingMessage('No projects found');
                    }
                    for (var _i = 0, _a = results.docs; _i < _a.length; _i++) {
                        var doc = _a[_i];
                        var $item = $("\n\t\t\t\t<div class=\"project-item\" data-project-id=\"" + doc._id + "\" data-project-name=\"" + doc.name + "\">\n\t\t\t\t\t<label for=\"\">" + doc.name + "</label>\n\t\t\t\t\t<div class=\"flex-filler\"></div>\n\t\t\t\t\t<i class=\"fa fa-i-cursor btn\" title=\"Rename\" data-action=\"rename\"></i>\n\t\t\t\t\t<i class=\"fa fa-download btn\" title=\"Export to file\" data-action=\"export\"></i>\n\t\t\t\t\t<i class=\"fa fa-close btn\" title=\"Delete\" data-action=\"delete\"></i>\n\t\t\t\t</div>\n\t\t\t\t");
                        _this.$itemList.append($item);
                        _this.$projectItems[doc._id] = $item;
                    }
                    _this.projectListTooltips.attach(_this.$itemList.find('i'));
                    _this.$contentPane.focus();
                    _this.disableButton(_this.$importBtn, false);
                    _this.projectManagerDlg.reposition();
                    setTimeout(function () {
                        _this.projectManagerDlg.reposition();
                    }, 100);
                };
                /*
                 * Events
                 */
                this.onConfirm = function (name, value) {
                    console.log('onConfirm', name, value);
                    if (name == 'NewProject') {
                        _this.newProject();
                    }
                    else if (name == 'ProjectManager') {
                        if (_this.$selectedProjectItem) {
                            _this.openProject(_this.$selectedProjectItem.data('project-id'), _this.$selectedProjectItem.data('project-name'));
                        }
                    }
                    else if (name == 'DeleteProject') {
                        _this.deleteProject(value);
                    }
                    else if (name == 'RenameProject') {
                        _this.renameProject(_this.renameProjectId, value);
                    }
                };
                this.onDlgClose = function (dlg) {
                    _this.popDialog(dlg);
                };
                this.onLoadLastInputChange = function (event) {
                    app.Config.set('loadLastProjectOnStartUp', _this.$loadLastInput.prop('checked'));
                };
                this.onOverwriteConfirm = function (name, value) {
                    _this.activeProject.id = _this.overwriteProjectId;
                    _this.activeProject.rev = _this.overwriteProjectRev;
                    _this.activeProject.name = _this.overwriteProjectName;
                    _this.overwriteProjectId = null;
                    _this.overwriteProjectRev = null;
                    _this.overwriteProjectName = null;
                    _this.saveActiveProject();
                };
                this.onProjectListAction = function (event) {
                    var $button = $(event.target);
                    var action = $button.data('action');
                    var $projectItem = $button.closest('.project-item');
                    var projectId = $projectItem.data('project-id');
                    var projectName = $projectItem.data('project-name');
                    console.log('onProjectListAction', action, projectId);
                    if (action == 'rename') {
                        _this.rename(projectId, projectName);
                    }
                    else if (action == 'export') {
                        // TODO: Implement exporting
                    }
                    else if (action == 'delete') {
                        _this.askDeleteProject(projectId, projectName);
                    }
                };
                this.onProjectListItemDoubleClick = function (event) {
                    if (_this.$selectedProjectItem) {
                        _this.openProject(_this.$selectedProjectItem.data('project-id'), _this.$selectedProjectItem.data('project-name'));
                    }
                };
                this.onProjectListItemSelect = function (event) {
                    _this.selectProjectItem($(event.currentTarget));
                };
                this.onProjectManagerKeyDown = function (event) {
                    var key = event.keyCode;
                    if (key == Key.Enter) {
                        if (_this.$selectedProjectItem) {
                            _this.openProject(_this.$selectedProjectItem.data('project-id'), _this.$selectedProjectItem.data('project-name'));
                        }
                    }
                    else if (key == Key.Delete) {
                        if (_this.$selectedProjectItem) {
                            _this.askDeleteProject(_this.$selectedProjectItem.data('project-id'), _this.$selectedProjectItem.data('project-name'));
                        }
                    }
                    else if (key == Key.UpArrow) {
                        _this.selectPreviousProjectItem();
                    }
                    else if (key == Key.DownArrow) {
                        _this.selectNextProjectItem();
                    }
                };
                this.onProjectManagerButtonClick = function (buttonId) {
                    if (buttonId == 'Import') {
                        // TODO: Implement import
                        console.log('Importing');
                    }
                };
                this.onSaveAsConfirm = function (name, value) {
                    value = $.trim(value);
                    if (value == '') {
                        app.App.notice('Invalid project name', 'red');
                        setTimeout(function () {
                            _this.saveAs();
                        }, 50);
                        return;
                    }
                    _this.saveProjectAs(value);
                };
                this.onWindowKeyDown = function (event) {
                    if (_this.dlgStack.length)
                        return;
                    var keyCode = event.keyCode;
                    var shiftKey = event.shiftKey;
                    var ctrlKey = event.ctrlKey;
                    var consume = false;
                    if (ctrlKey) {
                        if (keyCode == Key.S) {
                            if (shiftKey)
                                _this.saveAs();
                            else
                                _this.save();
                            consume = true;
                        }
                        else if (keyCode == Key.O) {
                            _this.showProjectManager();
                            consume = true;
                        }
                    }
                    else if (shiftKey) {
                        if (keyCode == Key.N) {
                            _this.showConfirmDlg('Confirm New Project', 'Any unsaved changes will be lost.<br>Are you sure you want to continue?', 'NewProject');
                            consume = true;
                        }
                    }
                    if (consume) {
                        event.preventDefault();
                        return false;
                    }
                };
            }
            ProjectManager.prototype.init = function (callback) {
                var _this = this;
                app.$window.on('keydown', this.onWindowKeyDown);
                this.projectsDb = new PouchDB('app-projects', { adapter: 'idb', revs_limit: 3, auto_compaction: true });
                this.projectsDb.createIndex({
                    index: { fields: ['name'] }
                }).then(function () {
                    _this.projectsDb.createIndex({
                        index: { fields: ['date'] }
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
                if (app.Config.loadLastProjectOnStartUp && app.Config.activeProject) {
                    this.openProject(app.Config.activeProject, app.Config.activeProjectName, function () {
                        if (!_this.activeProject)
                            _this.newProject();
                        callback();
                    });
                    return;
                }
                this.newProject();
                callback();
            };
            ProjectManager.prototype.getActiveProject = function () {
                return this.activeProject;
            };
            //
            ProjectManager.prototype.deleteProject = function (projectId) {
                var _this = this;
                var $projectItem = this.$projectItems[projectId];
                if ($projectItem) {
                    if ($projectItem.is(this.$selectedProjectItem)) {
                        this.selectProjectItem(null);
                    }
                    $projectItem.remove();
                    this.projectManagerDlg.reposition();
                }
                this.projectsDb.get(String(projectId)).then(function (doc) {
                    return _this.projectsDb.remove(doc);
                }).then(function () {
                    app.App.notice('Project deleted');
                }).catch(function () {
                    app.App.notice('ERROR: Unable to delete project', 'red');
                });
                delete this.$projectItems[projectId];
                this.projectCount--;
                if (this.activeProject.id == projectId) {
                    this.activeProject.id = null;
                    this.activeProject.rev = null;
                    app.Config.set('activeProject', null);
                    app.Config.set('activeProjectName', null);
                }
                if (this.projectCount < 1) {
                    this.setLoadingMessage('No projects found');
                }
            };
            ProjectManager.prototype.newProject = function () {
                this.activeProject = new projects.Project('New Project');
                this.activeProject.addModel(new Model());
                this.activeProject.id = null;
                this.activeProject.rev = null;
                app.Config.set('activeProject', null);
                app.Config.set('activeProjectName', null);
                app.main.setProject(this.activeProject);
            };
            ProjectManager.prototype.openProject = function (projectId, projectName, callback) {
                var _this = this;
                if (callback === void 0) { callback = null; }
                this.projectManagerDlg && this.projectManagerDlg.close();
                this.projectsDb.get(String(projectId)).then(function (doc) {
                    try {
                        doc.get = LoadData_get;
                        doc.asLoadData = LoadData_asLoadData;
                        _this.activeProject = projects.Project.load(doc);
                        app.Config.set('activeProject', _this.activeProject.id);
                        app.Config.set('activeProjectName', _this.activeProject.name);
                        app.main.setProject(_this.activeProject);
                        callback && callback();
                    }
                    catch (error) {
                        app.App.notice('  > ' + error.toString(), 'red');
                        app.App.notice("Error loading project data: <strong>" + projectName + "</strong>", 'red');
                        console.error(error);
                        callback && callback();
                    }
                }).catch(function (error) {
                    app.App.notice("ERROR: Unable to open project: <strong>" + projectName + "</strong>", 'red');
                    console.error(error);
                    callback && callback();
                });
            };
            ProjectManager.prototype.renameProject = function (projectId, newName) {
                var _this = this;
                newName = $.trim(newName);
                if (newName == projectId)
                    return;
                this.projectsDb.find({
                    selector: {
                        name: { $eq: newName }
                    },
                    fields: ['_id', '_rev'],
                    limit: 1
                }).then(function (results) {
                    if (results.docs.length) {
                        app.App.notice('Unable to rename.<br> - A project with that name already exist.', 'red');
                    }
                    else {
                        _this.projectsDb.get(String(projectId)).then(function (doc) {
                            doc.name = newName;
                            return _this.projectsDb.put(doc);
                        }).then(function () {
                            if (projectId == _this.activeProject.id) {
                                _this.activeProject.name = newName;
                                app.Config.set('activeProject', _this.activeProject.id);
                                app.Config.set('activeProjectName', _this.activeProject.name);
                            }
                            _this.$projectItems[projectId].find('label').html(newName);
                            app.App.notice('Project renamed');
                        }).catch(function () {
                            app.App.notice('There was a problem renaming the project.', 'red');
                        });
                    }
                }).catch(function (error) {
                    app.App.notice('There was an error reading from the database');
                    console.error(error);
                });
            };
            ProjectManager.prototype.saveActiveProject = function () {
                var _this = this;
                var data = this.activeProject.save();
                (data._id ? this.projectsDb.put(data) : this.projectsDb.post(data)).then(function (response) {
                    app.App.notice('Project saved', 'blue');
                    _this.activeProject.id = response.id;
                    _this.activeProject.rev = response.rev;
                    app.Config.set('activeProject', _this.activeProject.id);
                    app.Config.set('activeProjectName', _this.activeProject.name);
                }).catch(function (err) {
                    app.App.notice('Error saving project', 'red');
                    console.error(err);
                });
            };
            ProjectManager.prototype.saveProjectAs = function (name) {
                var _this = this;
                this.projectsDb.find({
                    selector: {
                        name: { $eq: name }
                    },
                    fields: ['_id', '_rev'],
                    limit: 1
                }).then(function (results) {
                    if (results.docs.length) {
                        _this.overwriteProjectId = results.docs[0]._id;
                        _this.overwriteProjectRev = results.docs[0]._rev;
                        _this.overwriteProjectName = name;
                        _this.showConfirmOverwriteDlg(name);
                    }
                    else {
                        _this.activeProject.id = null;
                        _this.activeProject.rev = null;
                        _this.activeProject.name = name;
                        _this.saveActiveProject();
                    }
                }).catch(function (error) {
                    app.App.notice('There was an error reading from the database');
                    console.error(error);
                });
            };
            //
            ProjectManager.prototype.askDeleteProject = function (projectId, projectName) {
                this.showConfirmDlg('Confirm Delete', "<strong>" + projectName + "</strong><br><br>\n\t\t\t\tAre you sure you want to delete this project?<br>\n\t\t\t\tThis action cannot be undone.", 'DeleteProject', projectId);
            };
            ProjectManager.prototype.rename = function (projectId, projectName) {
                this.renameProjectId = projectId;
                this.showPromptDlg('RenameProject', 'Rename', projectName, this.onConfirm);
            };
            ProjectManager.prototype.save = function () {
                if (this.activeProject.rev == null) {
                    this.saveAs();
                    return;
                }
                this.saveActiveProject();
            };
            ProjectManager.prototype.saveAs = function () {
                this.showPromptDlg('SaveAs', 'Save As', this.activeProject.name, this.onSaveAsConfirm);
            };
            //
            //noinspection JSMethodCanBeStatic
            ProjectManager.prototype.disableButton = function ($button, disabled) {
                if (disabled === void 0) { disabled = true; }
                $button.prop('disabled', disabled).toggleClass('disable', disabled);
            };
            ProjectManager.prototype.pushDlg = function (dlg) {
                if (this.dlgStack.indexOf(dlg) != -1)
                    return false;
                if (this.dlgStack.length)
                    this.dlgStack[this.dlgStack.length - 1].disable();
                this.dlgStack.push(dlg);
                return true;
            };
            ProjectManager.prototype.popDialog = function (dlg) {
                this.dlgStack.splice(this.dlgStack.indexOf(dlg), 1);
                if (this.dlgStack.length)
                    this.dlgStack[this.dlgStack.length - 1].enable();
            };
            ProjectManager.prototype.selectProjectItem = function ($item) {
                if (this.$selectedProjectItem) {
                    this.$selectedProjectItem.removeClass('selected');
                }
                this.$selectedProjectItem = $item;
                if (this.$selectedProjectItem) {
                    this.$selectedProjectItem.addClass('selected');
                }
                this.disableButton(this.$openBtn, !this.$selectedProjectItem);
            };
            ProjectManager.prototype.selectPreviousProjectItem = function () {
                var $prev = null;
                if (this.$selectedProjectItem) {
                    $prev = this.$selectedProjectItem.prev();
                    if (!$prev.length)
                        $prev = null;
                }
                if (!$prev) {
                    $prev = this.$itemList.find('.project-item:last');
                }
                this.selectProjectItem($prev);
            };
            ProjectManager.prototype.selectNextProjectItem = function () {
                var $next = null;
                if (this.$selectedProjectItem) {
                    $next = this.$selectedProjectItem.next();
                    if (!$next.length)
                        $next = null;
                }
                if (!$next) {
                    $next = this.$itemList.find('.project-item:first');
                }
                this.selectProjectItem($next);
            };
            ProjectManager.prototype.setLoadingMessage = function (message) {
                this.$selectedProjectItem = null;
                this.$itemList
                    .empty()
                    .toggleClass('loading', message != null);
                if (message != null) {
                    this.$itemList.append('<div class="loading-message">' + message + '</div>');
                }
            };
            ProjectManager.prototype.showConfirmDlg = function (title, content, name, confirmValue, cancelValue) {
                if (!this.confirmDlg) {
                    this.confirmDlg = new Dialog('Confirm', {
                        type: 'warning',
                        content: 'Are you sure?',
                        buttons: [
                            { label: 'Yes', confirm: true, focus: true },
                            { label: 'No', cancel: true }
                        ],
                        closeOnClick: 'body',
                        confirm: this.onConfirm,
                        close: this.onDlgClose,
                        zIndex: 20000
                    });
                }
                if (!this.pushDlg(this.confirmDlg))
                    return;
                if (title != null)
                    this.confirmDlg.setTitle(title);
                if (content != null)
                    this.confirmDlg.setContent(content);
                if (name != null)
                    this.confirmDlg.setName(name);
                this.confirmDlg.confirmValue = confirmValue;
                this.confirmDlg.cancelValue = cancelValue;
                this.confirmDlg.show();
            };
            ProjectManager.prototype.showConfirmOverwriteDlg = function (name) {
                if (!this.confirmOverwriteDlg) {
                    this.confirmOverwriteDlg = new Dialog('Confirm Overwrite', {
                        type: 'warning',
                        content: '<strong>XXX</strong> already exists.<br>Do you want to overwrite it?',
                        buttons: [
                            { label: 'Yes', confirm: true, focus: true },
                            { label: 'No', cancel: true }
                        ],
                        confirm: this.onOverwriteConfirm,
                        close: this.onDlgClose,
                        zIndex: 20000
                    });
                    this.$confirmOverwriteName = this.confirmOverwriteDlg.getContent().find('strong');
                }
                if (!this.pushDlg(this.confirmOverwriteDlg))
                    return;
                if (name != null) {
                    this.$confirmOverwriteName.html(name);
                }
                this.confirmOverwriteDlg.show();
            };
            ProjectManager.prototype.showProjectManager = function () {
                if (!this.projectManagerDlg) {
                    this.$contentPane = $('<div id="project-manager" tabindex="0"><div class="item-list"></div></div>')
                        .on('keydown', this.onProjectManagerKeyDown);
                    this.$itemList = this.$contentPane.find('.item-list')
                        .on('click', 'i', this.onProjectListAction)
                        .on('click', 'div.project-item', this.onProjectListItemSelect)
                        .on('dblclick', 'div.project-item', this.onProjectListItemDoubleClick);
                    var $options = $("<div class=\"options\">\n\t\t\t\t\t<label>Load on startup <input type=\"checkbox\"></label>\n\t\t\t\t</div>");
                    this.$loadLastInput = $options.find('input')
                        .on('change', this.onLoadLastInputChange);
                    this.projectManagerDlg = new Dialog('ProjectManager', {
                        name: 'ProjectManager',
                        dlgClass: 'project-manager-dlg',
                        icon: 'tasks',
                        content: this.$contentPane,
                        buttons: [
                            { label: 'Open', confirm: true },
                            { label: 'Cancel', cancel: true },
                            { content: $options, rightAlign: true },
                            { label: 'Import', rightAlign: true }
                        ],
                        position: { x: 'center', y: 'top' },
                        offset: { y: 25 },
                        confirm: this.onConfirm,
                        close: this.onDlgClose,
                        button: this.onProjectManagerButtonClick
                    });
                    this.$buttons = this.projectManagerDlg.getButtons();
                    this.$openBtn = this.projectManagerDlg.getButton('Open');
                    this.$importBtn = this.projectManagerDlg.getButton('Import');
                    this.projectListTooltips = new jBox('Tooltip', { theme: 'TooltipDark' });
                }
                if (!this.pushDlg(this.projectManagerDlg))
                    return;
                this.setLoadingMessage('<i class="fa fa-spinner fa-spin"></i> Loading...');
                this.disableButton(this.$openBtn);
                this.disableButton(this.$importBtn);
                this.$loadLastInput.prop('checked', app.Config.loadLastProjectOnStartUp);
                this.projectsDb.find({
                    selector: {
                        name: { $gte: null },
                        date: { $gte: null }
                    },
                    fields: ['_id', 'name'],
                    sort: [{ 'date': 'desc' }]
                }).then(this.updateProjectsList);
                this.projectManagerDlg.show();
            };
            ProjectManager.prototype.showPromptDlg = function (name, title, value, confirm) {
                if (confirm === void 0) { confirm = null; }
                if (!this.promptDlg) {
                    this.promptDlg = new PromptDlg('Confirm', {
                        buttons: [
                            { label: 'Accept', confirm: true },
                            { label: 'Cancel', cancel: true }
                        ],
                        confirm: null,
                        close: this.onDlgClose,
                        zIndex: 15000
                    });
                }
                if (!this.pushDlg(this.promptDlg))
                    return;
                this.promptDlg.confirmCallback = confirm;
                this.promptDlg.name = name;
                this.promptDlg.setTitle(title);
                this.promptDlg.show(value);
            };
            return ProjectManager;
        }());
        projects.ProjectManager = ProjectManager;
    })(projects = app.projects || (app.projects = {}));
})(app || (app = {}));
//# sourceMappingURL=ProjectManager.js.map